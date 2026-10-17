import "server-only";
import { nanoid } from "nanoid";
import { designDocSchema } from "@/lib/design/schema";
import { videoDocSchema } from "@/lib/video/schema";
import { ASPECTS, type VideoDoc } from "@/lib/video/types";
import type { DesignDoc } from "@/lib/design/types";
import type { AssetKind, AssetMeta, ExportRecord, Project, ProjectDoc, ProjectKind, ProjectMeta } from "@/lib/projects";
import { HttpError, type AppUser } from "./auth";
import { getStorage, type Storage } from "./storage";
import { createHash } from "node:crypto";

const metaKey = (id: string) => `projects/meta/${id}.json`;
const docKey = (id: string) => `projects/doc/${id}.json`;
const thumbKey = (id: string) => `projects/thumb/${id}.jpg`;
const assetMetaKey = (id: string) => `assets/meta/${id}.json`;
const assetFileKey = (id: string, ext: string) => `assets/files/${id}.${ext}`;
const favKey = (email: string) => `users/${createHash("sha256").update(email).digest("hex").slice(0, 24)}/favorites.json`;

const ID_RE = /^[A-Za-z0-9_-]{6,40}$/;
export function assertId(id: string) {
  if (!ID_RE.test(id)) throw new HttpError(400, "Invalid id");
}

// Serialise writes per key inside this process (fs driver, local server renders).
const locks = new Map<string, Promise<unknown>>();
async function withLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = locks.get(key) ?? Promise.resolve();
  const next = prev.then(fn, fn);
  locks.set(key, next.catch(() => undefined));
  try {
    return await next;
  } finally {
    if (locks.get(key) === next) locks.delete(key);
  }
}

export function validateDoc(kind: ProjectKind, doc: unknown): ProjectDoc {
  const parsed = kind === "design" ? designDocSchema.safeParse(doc) : videoDocSchema.safeParse(doc);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new HttpError(400, `Invalid ${kind} document: ${first?.path.join(".")} ${first?.message}`);
  }
  return parsed.data as ProjectDoc;
}

function dims(kind: ProjectKind, doc: ProjectDoc) {
  if (kind === "design") return { width: (doc as DesignDoc).width, height: (doc as DesignDoc).height };
  const a = ASPECTS[(doc as VideoDoc).aspect];
  return { width: a.width, height: a.height };
}

function decodeThumbnail(dataUrl: string | undefined): Buffer | null {
  if (!dataUrl) return null;
  const m = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m) throw new HttpError(400, "Thumbnail must be a base64 JPEG or PNG data URL");
  const buf = Buffer.from(m[2], "base64");
  if (buf.length > 600 * 1024) throw new HttpError(413, "Thumbnail too large");
  return buf;
}

export class Repo {
  constructor(private s: Storage = getStorage()) {}

  // ---------- projects ----------
  async listProjects(kind?: ProjectKind): Promise<ProjectMeta[]> {
    const keys = await this.s.list("projects/meta");
    const metas = await Promise.all(keys.filter((k) => k.endsWith(".json")).map((k) => this.s.readJSON<ProjectMeta>(k)));
    return metas
      .filter((m): m is ProjectMeta => Boolean(m) && (!kind || m!.kind === kind))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getProject(id: string): Promise<Project> {
    assertId(id);
    const [meta, doc] = await Promise.all([this.s.readJSON<ProjectMeta>(metaKey(id)), this.s.readJSON<ProjectDoc>(docKey(id))]);
    if (!meta || !doc) throw new HttpError(404, "Project not found");
    return { meta, doc };
  }

  async createProject(user: AppUser, input: { kind: ProjectKind; name: string; templateId: string | null; doc: unknown; thumbnail?: string }): Promise<ProjectMeta> {
    const doc = validateDoc(input.kind, input.doc);
    const thumb = decodeThumbnail(input.thumbnail);
    const now = new Date().toISOString();
    const who = { email: user.email, name: user.name };
    const meta: ProjectMeta = {
      id: nanoid(12),
      kind: input.kind,
      name: input.name.trim().slice(0, 120) || "Untitled",
      templateId: input.templateId,
      ...dims(input.kind, doc),
      createdAt: now,
      updatedAt: now,
      createdBy: who,
      updatedBy: who,
      favoritedBy: [],
      hasThumbnail: Boolean(thumb),
      thumbnailVersion: thumb ? 1 : 0,
      exports: [],
      revision: 1,
    };
    await this.s.writeJSON(docKey(meta.id), doc);
    if (thumb) await this.s.writeFile(thumbKey(meta.id), thumb, "image/jpeg");
    await this.s.writeJSON(metaKey(meta.id), meta);
    return meta;
  }

  async updateProject(
    user: AppUser,
    id: string,
    input: { name?: string; doc?: unknown; thumbnail?: string; baseRevision?: number; force?: boolean },
  ): Promise<ProjectMeta> {
    assertId(id);
    return withLock(id, async () => {
      const meta = await this.s.readJSON<ProjectMeta>(metaKey(id));
      if (!meta) throw new HttpError(404, "Project not found");
      if (!input.force && input.baseRevision !== undefined && input.baseRevision !== meta.revision) {
        throw new HttpError(409, `${meta.updatedBy.name} saved a newer version of this project. Reload it, or save your version as a copy.`);
      }
      const next: ProjectMeta = { ...meta, updatedAt: new Date().toISOString(), updatedBy: { email: user.email, name: user.name }, revision: meta.revision + 1 };
      if (input.name !== undefined) next.name = input.name.trim().slice(0, 120) || meta.name;
      if (input.doc !== undefined) {
        const doc = validateDoc(meta.kind, input.doc);
        Object.assign(next, dims(meta.kind, doc));
        await this.s.writeJSON(docKey(id), doc);
      }
      const thumb = decodeThumbnail(input.thumbnail);
      if (thumb) {
        await this.s.writeFile(thumbKey(id), thumb, "image/jpeg");
        next.hasThumbnail = true;
        next.thumbnailVersion = meta.thumbnailVersion + 1;
      }
      await this.s.writeJSON(metaKey(id), next);
      return next;
    });
  }

  async duplicateProject(user: AppUser, id: string): Promise<ProjectMeta> {
    const { meta, doc } = await this.getProject(id);
    const copy = await this.createProject(user, { kind: meta.kind, name: `${meta.name} (copy)`, templateId: meta.templateId, doc });
    const thumb = meta.hasThumbnail ? await this.s.readFile(thumbKey(id)) : null;
    if (thumb) {
      const buf = Buffer.from(await new Response(thumb.body).arrayBuffer());
      await this.s.writeFile(thumbKey(copy.id), buf, "image/jpeg");
      const withThumb = { ...copy, hasThumbnail: true, thumbnailVersion: 1 };
      await this.s.writeJSON(metaKey(copy.id), withThumb);
      return withThumb;
    }
    return copy;
  }

  async deleteProject(user: AppUser, id: string): Promise<void> {
    assertId(id);
    const meta = await this.s.readJSON<ProjectMeta>(metaKey(id));
    if (!meta) throw new HttpError(404, "Project not found");
    if (!user.isAdmin && meta.createdBy.email !== user.email) {
      throw new HttpError(403, "Only the person who created this project (or an admin) can delete it.");
    }
    await this.s.remove(metaKey(id));
    await this.s.remove(docKey(id));
    await this.s.remove(thumbKey(id)).catch(() => undefined);
  }

  async toggleProjectFavorite(user: AppUser, id: string): Promise<ProjectMeta> {
    assertId(id);
    return withLock(id, async () => {
      const meta = await this.s.readJSON<ProjectMeta>(metaKey(id));
      if (!meta) throw new HttpError(404, "Project not found");
      const has = meta.favoritedBy.includes(user.email);
      const next = { ...meta, favoritedBy: has ? meta.favoritedBy.filter((e) => e !== user.email) : [...meta.favoritedBy, user.email] };
      await this.s.writeJSON(metaKey(id), next);
      return next;
    });
  }

  async addExport(user: AppUser, id: string, rec: Omit<ExportRecord, "id" | "createdAt" | "by">): Promise<ProjectMeta> {
    assertId(id);
    return withLock(id, async () => {
      const meta = await this.s.readJSON<ProjectMeta>(metaKey(id));
      if (!meta) throw new HttpError(404, "Project not found");
      const entry: ExportRecord = { ...rec, id: nanoid(10), createdAt: new Date().toISOString(), by: user.name };
      const next = { ...meta, exports: [entry, ...meta.exports].slice(0, 25) };
      await this.s.writeJSON(metaKey(id), next);
      return next;
    });
  }

  getThumbnail(id: string) {
    assertId(id);
    return this.s.readFile(thumbKey(id));
  }

  // ---------- assets ----------
  async listAssets(kind?: AssetKind): Promise<AssetMeta[]> {
    const keys = await this.s.list("assets/meta");
    const metas = await Promise.all(keys.filter((k) => k.endsWith(".json")).map((k) => this.s.readJSON<AssetMeta>(k)));
    return metas
      .filter((m): m is AssetMeta => Boolean(m) && (!kind || m!.kind === kind))
      .sort((a, b) => (b.lastUsedAt ?? b.createdAt).localeCompare(a.lastUsedAt ?? a.createdAt));
  }

  async createAsset(user: AppUser, input: { name: string; kind: AssetKind; contentType: string; ext: string; data: Buffer; width?: number; height?: number }): Promise<AssetMeta> {
    const id = nanoid(14);
    const meta: AssetMeta = {
      id,
      name: input.name.slice(0, 160),
      kind: input.kind,
      contentType: input.contentType,
      ext: input.ext,
      sizeBytes: input.data.length,
      width: input.width,
      height: input.height,
      createdAt: new Date().toISOString(),
      createdBy: { email: user.email, name: user.name },
      lastUsedAt: null,
      url: `/api/assets/file/${id}`,
    };
    await this.s.writeFile(assetFileKey(id, input.ext), input.data, input.contentType);
    await this.s.writeJSON(assetMetaKey(id), meta);
    return meta;
  }

  async getAsset(id: string): Promise<AssetMeta> {
    assertId(id);
    const meta = await this.s.readJSON<AssetMeta>(assetMetaKey(id));
    if (!meta) throw new HttpError(404, "Asset not found");
    return meta;
  }

  async readAssetFile(id: string) {
    const meta = await this.getAsset(id);
    const file = await this.s.readFile(assetFileKey(id, meta.ext));
    if (!file) throw new HttpError(404, "Asset file missing");
    return { meta, file };
  }

  async updateAsset(user: AppUser, id: string, input: { name?: string; markUsed?: boolean; kind?: AssetKind }): Promise<AssetMeta> {
    return withLock(`asset-${id}`, async () => {
      const meta = await this.getAsset(id);
      const next = { ...meta };
      if (input.name !== undefined) {
        if (!user.isAdmin && meta.createdBy.email !== user.email) throw new HttpError(403, "Only the uploader or an admin can rename this asset.");
        next.name = input.name.trim().slice(0, 160) || meta.name;
      }
      if (input.kind) next.kind = input.kind;
      if (input.markUsed) next.lastUsedAt = new Date().toISOString();
      await this.s.writeJSON(assetMetaKey(id), next);
      return next;
    });
  }

  async deleteAsset(user: AppUser, id: string) {
    const meta = await this.getAsset(id);
    if (!user.isAdmin && meta.createdBy.email !== user.email) throw new HttpError(403, "Only the uploader or an admin can delete this asset.");
    await this.s.remove(assetFileKey(id, meta.ext));
    await this.s.remove(assetMetaKey(id));
  }

  // ---------- template favourites (per user) ----------
  async getFavorites(user: AppUser): Promise<string[]> {
    return (await this.s.readJSON<{ templateIds: string[] }>(favKey(user.email)))?.templateIds ?? [];
  }

  async toggleFavorite(user: AppUser, templateId: string): Promise<string[]> {
    if (!/^[a-z0-9-]{2,80}$/.test(templateId)) throw new HttpError(400, "Invalid template id");
    return withLock(favKey(user.email), async () => {
      const current = await this.getFavorites(user);
      const next = current.includes(templateId) ? current.filter((t) => t !== templateId) : [templateId, ...current].slice(0, 200);
      await this.s.writeJSON(favKey(user.email), { templateIds: next });
      return next;
    });
  }
}

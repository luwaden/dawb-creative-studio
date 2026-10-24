import "server-only";
import { createHash } from "node:crypto";
import { HttpError } from "./auth";
import type { Storage, StoredFile } from "./storage";

/**
 * Cloudinary storage driver (shared workspace). Every file — project JSON,
 * thumbnails and uploads — is stored as a private ("authenticated") raw resource,
 * so nothing is reachable by URL; the app streams files to signed-in users only.
 *
 * Configure with CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
 * (shown on the Cloudinary dashboard) or the three CLOUDINARY_* variables.
 */

export interface CloudinaryConfig {
  cloud: string;
  key: string;
  secret: string;
  folder: string;
}

export function cloudinaryConfig(): CloudinaryConfig | null {
  const url = process.env.CLOUDINARY_URL;
  let cloud = process.env.CLOUDINARY_CLOUD_NAME ?? "";
  let key = process.env.CLOUDINARY_API_KEY ?? "";
  let secret = process.env.CLOUDINARY_API_SECRET ?? "";
  if (url) {
    const m = /^cloudinary:\/\/([^:]+):([^@]+)@([^/?#]+)/.exec(url.trim());
    if (m) [, key, secret, cloud] = m;
  }
  if (!cloud || !key || !secret) return null;
  const folder = (process.env.CLOUDINARY_FOLDER ?? "dawb-studio").replace(/^\/+|\/+$/g, "") || "dawb-studio";
  return { cloud, key, secret, folder };
}

/** Cloudinary request signature: sha1 of sorted "k=v&k=v" + api_secret. */
export function signParams(params: Record<string, string | number>, secret: string): string {
  const base = Object.keys(params)
    .filter((k) => params[k] !== "" && params[k] !== undefined)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(base + secret).digest("hex");
}

const apiBase = () => process.env.CLOUDINARY_API_BASE ?? "https://api.cloudinary.com";
const LIST_TTL_MS = 15_000;

export class CloudinaryStorage implements Storage {
  private listCache = new Map<string, { at: number; keys: string[] }>();

  constructor(private c: CloudinaryConfig, private mime: (key: string) => string) {}

  private pid(key: string) {
    return `${this.c.folder}/${key}`;
  }

  private signed(params: Record<string, string | number>) {
    const timestamp = Math.floor(Date.now() / 1000);
    const all = { ...params, timestamp };
    return { ...all, api_key: this.c.key, signature: signParams(all, this.c.secret) };
  }

  private fail(action: string, status: number, detail: string): never {
    console.error(`[cloudinary] ${action} failed`, status, detail.slice(0, 300));
    if (status === 401 || status === 403) throw new HttpError(500, "Cloudinary rejected the credentials. Check CLOUDINARY_URL (API key, secret and cloud name) and redeploy.");
    if (status === 420 || status === 429) throw new HttpError(503, "Cloudinary rate limit reached — wait a few minutes and try again.");
    if (/file size|too large/i.test(detail)) throw new HttpError(413, "That file is too large for your Cloudinary plan (raw files up to 10 MB on the free plan).");
    throw new HttpError(502, `Cloudinary couldn't ${action}. Try again shortly.`);
  }

  private invalidate(key: string) {
    for (const prefix of [...this.listCache.keys()]) if (key.startsWith(prefix)) this.listCache.delete(prefix);
  }

  async writeFile(key: string, data: Buffer, contentType: string) {
    const form = new FormData();
    const p = this.signed({ public_id: this.pid(key), type: "authenticated", overwrite: "true", invalidate: "true" });
    for (const [k, v] of Object.entries(p)) form.set(k, String(v));
    form.set("file", new Blob([new Uint8Array(data)], { type: contentType }), key.split("/").pop());
    const res = await fetch(`${apiBase()}/v1_1/${this.c.cloud}/raw/upload`, { method: "POST", body: form, cache: "no-store" });
    if (!res.ok) this.fail("save the file", res.status, await res.text().catch(() => ""));
    this.invalidate(key);
  }

  async writeJSON(key: string, value: unknown) {
    await this.writeFile(key, Buffer.from(JSON.stringify(value)), "application/json");
  }

  private async download(key: string): Promise<Response | null> {
    const q = new URLSearchParams(Object.entries(this.signed({ public_id: this.pid(key), type: "authenticated" })).map(([k, v]) => [k, String(v)]));
    const res = await fetch(`${apiBase()}/v1_1/${this.c.cloud}/raw/download?${q}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) this.fail("read the file", res.status, await res.text().catch(() => ""));
    return res;
  }

  async readJSON<T>(key: string): Promise<T | null> {
    const res = await this.download(key);
    return res ? ((await res.json()) as T) : null;
  }

  async readFile(key: string): Promise<StoredFile | null> {
    const res = await this.download(key);
    if (!res || !res.body) return null;
    const len = Number(res.headers.get("content-length"));
    return { body: res.body, contentType: this.mime(key), size: Number.isFinite(len) && len > 0 ? len : null };
  }

  async remove(key: string) {
    const form = new URLSearchParams(Object.entries(this.signed({ public_id: this.pid(key), type: "authenticated", invalidate: "true" })).map(([k, v]) => [k, String(v)]));
    const res = await fetch(`${apiBase()}/v1_1/${this.c.cloud}/raw/destroy`, { method: "POST", body: form, cache: "no-store" });
    if (!res.ok) this.fail("delete the file", res.status, await res.text().catch(() => ""));
    this.invalidate(key);
  }

  /** Lists keys under a prefix (Admin API). Cached briefly — the free plan allows 500 Admin calls/hour. */
  async list(prefix: string): Promise<string[]> {
    const p = prefix.replace(/\/$/, "");
    const hit = this.listCache.get(p);
    if (hit && Date.now() - hit.at < LIST_TTL_MS) return hit.keys;
    const keys: string[] = [];
    let cursor = "";
    const auth = `Basic ${Buffer.from(`${this.c.key}:${this.c.secret}`).toString("base64")}`;
    for (let page = 0; page < 20; page++) {
      const q = new URLSearchParams({ prefix: `${this.pid(p)}/`, max_results: "500", ...(cursor ? { next_cursor: cursor } : {}) });
      const res = await fetch(`${apiBase()}/v1_1/${this.c.cloud}/resources/raw/authenticated?${q}`, { headers: { authorization: auth }, cache: "no-store" });
      if (!res.ok) this.fail("list files", res.status, await res.text().catch(() => ""));
      const body = (await res.json()) as { resources?: Array<{ public_id: string }>; next_cursor?: string };
      for (const r of body.resources ?? []) {
        const k = r.public_id.slice(this.c.folder.length + 1);
        // Only direct children, like a directory listing.
        if (!k.slice(p.length + 1).includes("/")) keys.push(k);
      }
      if (!body.next_cursor) break;
      cursor = body.next_cursor;
    }
    this.listCache.set(p, { at: Date.now(), keys });
    return keys;
  }
}

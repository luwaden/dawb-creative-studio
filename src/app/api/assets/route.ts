import { requireUser, HttpError } from "@/lib/server/auth";
import { getConfig } from "@/lib/server/config";
import { assertSameOrigin, json, route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";
import { sniffMedia } from "@/lib/server/sniff";
import type { AssetKind } from "@/lib/projects";

export const dynamic = "force-dynamic";

const KINDS: AssetKind[] = ["image", "logo", "background", "audio"];

export const GET = route(async (req: Request) => {
  await requireUser();
  const kind = new URL(req.url).searchParams.get("kind") as AssetKind | null;
  return json({ assets: await new Repo().listAssets(kind && KINDS.includes(kind) ? kind : undefined) });
});

export const POST = route(async (req: Request) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const cfg = getConfig();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "No file uploaded");
  if (file.size > cfg.maxUploadBytes) throw new HttpError(413, `File is too large (max ${Math.round(cfg.maxUploadBytes / 1024 / 1024)} MB).`);
  const data = Buffer.from(await file.arrayBuffer());
  const sniffed = sniffMedia(data);
  if (!sniffed) throw new HttpError(415, "Unsupported file. Upload PNG, JPEG or WebP images, or MP3, WAV, M4A or OGG audio.");
  const requested = String(form.get("kind") ?? "") as AssetKind;
  const kind: AssetKind = sniffed.kind === "audio" ? "audio" : requested && requested !== "audio" && KINDS.includes(requested) ? requested : "image";
  const w = Number(form.get("width"));
  const h = Number(form.get("height"));
  const meta = await new Repo().createAsset(user, {
    name: String(form.get("name") ?? file.name ?? "Upload").slice(0, 160),
    kind,
    contentType: sniffed.contentType,
    ext: sniffed.ext,
    data,
    width: Number.isFinite(w) && w > 0 && w < 20000 ? Math.round(w) : undefined,
    height: Number.isFinite(h) && h > 0 && h < 20000 ? Math.round(h) : undefined,
  });
  return json({ asset: meta }, 201);
});

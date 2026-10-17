import { requireUser } from "@/lib/server/auth";
import { route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";
import { verifyAssetAccess } from "@/lib/server/sign";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Streams an uploaded asset. Same-origin, so canvases stay untainted and exports work.
 * Access: a signed-in workspace member, or a short-lived signature (server renders).
 * Supports byte ranges because audio/video decoders seek with Range requests.
 */
async function serve(req: Request, { params }: Ctx, headOnly: boolean) {
  const url = new URL(req.url);
  if (!verifyAssetAccess(url)) await requireUser();
  const { id } = await params;
  const { meta, file } = await new Repo().readAssetFile(id);
  const headers: Record<string, string> = {
    "content-type": meta.contentType,
    "cache-control": "private, max-age=86400, immutable",
    "x-content-type-options": "nosniff",
    "content-security-policy": "default-src 'none'; sandbox",
    "accept-ranges": "bytes",
  };
  const range = req.headers.get("range");
  const m = range ? /^bytes=(\d*)-(\d*)$/.exec(range) : null;
  if (m) {
    const buf = Buffer.from(await new Response(file.body).arrayBuffer());
    const size = buf.length;
    let start = m[1] ? Number(m[1]) : size - Number(m[2] || 0);
    let end = m[1] && m[2] ? Number(m[2]) : size - 1;
    start = Math.max(0, start);
    end = Math.min(size - 1, end);
    if (start > end || start >= size) return new Response(null, { status: 416, headers: { ...headers, "content-range": `bytes */${size}` } });
    const chunk = buf.subarray(start, end + 1);
    return new Response(headOnly ? null : chunk, {
      status: 206,
      headers: { ...headers, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(chunk.length) },
    });
  }
  if (file.size) headers["content-length"] = String(file.size);
  if (headOnly) {
    await file.body.cancel().catch(() => undefined);
    return new Response(null, { headers });
  }
  return new Response(file.body, { headers });
}

export const GET = route((req: Request, ctx: Ctx) => serve(req, ctx, false));
export const HEAD = route((req: Request, ctx: Ctx) => serve(req, ctx, true));

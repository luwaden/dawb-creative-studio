import fs from "node:fs";
import { Readable } from "node:stream";
import { HttpError, requireUser } from "@/lib/server/auth";
import { route } from "@/lib/server/http";
import { getJob } from "@/lib/server/render/jobs";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const job = getJob((await params).id);
  if (!job || job.owner !== user.email || job.status !== "done" || !job.filePath || !fs.existsSync(job.filePath)) {
    throw new HttpError(404, "Rendered file not available");
  }
  const ext = job.codec === "h264" ? "mp4" : "webm";
  const stream = Readable.toWeb(fs.createReadStream(job.filePath)) as ReadableStream<Uint8Array>;
  return new Response(stream, {
    headers: {
      "content-type": ext === "mp4" ? "video/mp4" : "video/webm",
      "content-length": String(job.sizeBytes ?? fs.statSync(job.filePath).size),
      "content-disposition": `attachment; filename="dawb-video-${job.id}.${ext}"`,
    },
  });
});

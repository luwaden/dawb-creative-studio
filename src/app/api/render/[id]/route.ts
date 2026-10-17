import { HttpError, requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, route } from "@/lib/server/http";
import { getJob, publicJob } from "@/lib/server/render/jobs";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const job = getJob((await params).id);
  if (!job || job.owner !== user.email) throw new HttpError(404, "Render job not found (jobs expire after an hour or when the server restarts).");
  return json({ job: publicJob(job) });
});

export const DELETE = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const job = getJob((await params).id);
  if (!job || job.owner !== user.email) throw new HttpError(404, "Render job not found");
  if (job.status === "queued") job.status = "cancelled";
  job.controller.abort();
  return json({ job: publicJob(job) });
});

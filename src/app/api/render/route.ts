import { z } from "zod";
import { HttpError, requireUser } from "@/lib/server/auth";
import { getConfig } from "@/lib/server/config";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { publicJob, startRenderJob } from "@/lib/server/render/jobs";
import { signAssetAccess } from "@/lib/server/sign";
import { videoDocSchema } from "@/lib/video/schema";
import type { VideoDoc } from "@/lib/video/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({ doc: videoDocSchema, codec: z.enum(["h264", "vp8"]).default("h264") });

export const POST = route(async (req: Request) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const cfg = getConfig();
  if (!cfg.serverRender) {
    throw new HttpError(501, "Server rendering is turned off on this deployment. Use the in-browser export (Chrome or Edge).");
  }
  const body = schema.parse(await readJson(req));
  // The headless browser fetches assets from this same server.
  const origin = new URL(req.url).origin;
  const job = startRenderJob({ doc: body.doc as VideoDoc, assetBase: origin, assetQuery: signAssetAccess(), codec: body.codec, owner: user.email });
  return json({ job: publicJob(job) }, 202);
});

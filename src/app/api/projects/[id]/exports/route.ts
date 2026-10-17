import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  format: z.enum(["png", "jpeg", "mp4", "webm"]),
  mode: z.enum(["browser", "server"]),
  width: z.number().int().min(1).max(10000),
  height: z.number().int().min(1).max(10000),
  sizeBytes: z.number().int().min(0).nullable(),
});

/** Records a completed export in the project's history (called only after the file was produced). */
export const POST = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { id } = await params;
  const body = schema.parse(await readJson(req));
  return json({ project: await new Repo().addExport(user, id, body) });
});

import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  name: z.string().max(160).optional(),
  markUsed: z.boolean().optional(),
  kind: z.enum(["image", "logo", "background"]).optional(),
});

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { id } = await params;
  return json({ asset: await new Repo().updateAsset(user, id, patchSchema.parse(await readJson(req))) });
});

export const DELETE = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { id } = await params;
  await new Repo().deleteAsset(user, id);
  return json({ ok: true });
});

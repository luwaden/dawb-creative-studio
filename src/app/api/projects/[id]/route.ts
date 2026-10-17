import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, { params }: Ctx) => {
  await requireUser();
  const { id } = await params;
  return json(await new Repo().getProject(id));
});

const updateSchema = z.object({
  name: z.string().max(120).optional(),
  doc: z.unknown().optional(),
  thumbnail: z.string().max(900_000).optional(),
  baseRevision: z.number().int().optional(),
  force: z.boolean().optional(),
});

export const PUT = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { id } = await params;
  const body = updateSchema.parse(await readJson(req));
  return json({ project: await new Repo().updateProject(user, id, body) });
});

export const DELETE = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { id } = await params;
  await new Repo().deleteProject(user, id);
  return json({ ok: true });
});

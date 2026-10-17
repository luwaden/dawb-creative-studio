import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export const GET = route(async (req: Request) => {
  await requireUser();
  const kind = new URL(req.url).searchParams.get("kind");
  const projects = await new Repo().listProjects(kind === "design" || kind === "video" ? kind : undefined);
  return json({ projects });
});

const createSchema = z.object({
  kind: z.enum(["design", "video"]),
  name: z.string().max(120),
  templateId: z.string().max(80).nullable(),
  doc: z.unknown(),
  thumbnail: z.string().max(900_000).optional(),
});

export const POST = route(async (req: Request) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const body = createSchema.parse(await readJson(req));
  const meta = await new Repo().createProject(user, body);
  return json({ project: meta }, 201);
});

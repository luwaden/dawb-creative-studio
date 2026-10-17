import { requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { id } = await params;
  return json({ project: await new Repo().duplicateProject(user, id) }, 201);
});

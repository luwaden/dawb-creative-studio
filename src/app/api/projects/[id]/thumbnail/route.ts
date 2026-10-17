import { requireUser } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req: Request, { params }: Ctx) => {
  await requireUser();
  const { id } = await params;
  const file = await new Repo().getThumbnail(id);
  if (!file) return json({ error: "No thumbnail" }, 404);
  return new Response(file.body, { headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=3600" } });
});

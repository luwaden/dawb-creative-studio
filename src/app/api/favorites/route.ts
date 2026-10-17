import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { Repo } from "@/lib/server/repo";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const user = await requireUser();
  return json({ templateIds: await new Repo().getFavorites(user) });
});

export const POST = route(async (req: Request) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { templateId } = z.object({ templateId: z.string() }).parse(await readJson(req));
  return json({ templateIds: await new Repo().toggleFavorite(user, templateId) });
});

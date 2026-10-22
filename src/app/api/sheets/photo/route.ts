import { z } from "zod";
import { requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { importPhoto } from "@/lib/server/photo";

export const dynamic = "force-dynamic";

const body = z.object({ url: z.string().max(600), label: z.string().max(80).optional() });

/** Imports a photo referenced in Sheets (https / Drive link / asset:<id>) into the asset store. */
export const POST = route(async (req: Request) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { url, label } = body.parse(await readJson(req, 8 * 1024));
  const asset = await importPhoto(user, url, label);
  return json({ asset });
});

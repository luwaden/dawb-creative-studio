import { getUserGoogleTokens, HttpError, requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { SheetsClient } from "@/lib/server/sheets";
import { cleanRecord } from "@/lib/server/sheetsInput";
import { isTabId } from "@/lib/sheets/schema";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ tab: string; id: string }> };

export const PATCH = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const { tab, id } = await params;
  if (!isTabId(tab)) throw new HttpError(404, "Unknown tab");
  if (tab === "users") throw new HttpError(403, "User rows are maintained by sign-in.");
  if (tab === "content" && !user.isAdmin) throw new HttpError(403, "Only admins can edit the content log.");
  if (!/^[A-Za-z0-9_-]{3,40}$/.test(id)) throw new HttpError(400, "Invalid id");
  const patch = cleanRecord(tab, await readJson(req, 64 * 1024), { partial: true });
  const client = await SheetsClient.create(await getUserGoogleTokens(req));
  return json({ row: await client.update(tab, id, patch) });
});

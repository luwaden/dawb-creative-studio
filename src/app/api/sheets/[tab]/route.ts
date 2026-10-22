import { getUserGoogleTokens, HttpError, requireUser } from "@/lib/server/auth";
import { assertSameOrigin, json, readJson, route } from "@/lib/server/http";
import { SheetsClient } from "@/lib/server/sheets";
import { cleanRecord } from "@/lib/server/sheetsInput";
import { isTabId, TABS, type TabId } from "@/lib/sheets/schema";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ tab: string }> };

async function tabFor(params: Ctx["params"]): Promise<TabId> {
  const { tab } = await params;
  if (!isTabId(tab)) throw new HttpError(404, "Unknown tab");
  return tab;
}

export const GET = route(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const tab = await tabFor(params);
  if (TABS[tab].adminOnly && !user.isAdmin) throw new HttpError(403, "Only admins can view this tab.");
  const client = await SheetsClient.create(await getUserGoogleTokens(req));
  return json({ rows: await client.read(tab) });
});

export const POST = route(async (req: Request, { params }: Ctx) => {
  assertSameOrigin(req);
  const user = await requireUser();
  const tab = await tabFor(params);
  // Users are recorded by sign-in only; the content log is written by generation.
  if (tab === "users") throw new HttpError(403, "Users are added automatically when they sign in.");
  const rec = cleanRecord(tab, await readJson(req, 64 * 1024), { partial: false });
  if (tab === "content") {
    rec.created_by = user.email;
    rec.created_at = new Date().toISOString();
    rec.status = rec.status || "Draft";
  }
  const client = await SheetsClient.create(await getUserGoogleTokens(req));
  return json({ row: await client.append(tab, rec) }, 201);
});

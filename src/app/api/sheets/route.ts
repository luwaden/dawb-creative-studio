import { getUserGoogleTokens, requireUser } from "@/lib/server/auth";
import { json, route } from "@/lib/server/http";
import { SheetsClient, sheetsAuthMode, sheetsConfigured, spreadsheetId } from "@/lib/server/sheets";
import { TABS } from "@/lib/sheets/schema";

export const dynamic = "force-dynamic";

/** Connection status for the Data page. Never exposes credentials. */
export const GET = route(async (req: Request) => {
  const user = await requireUser();
  const mode = sheetsAuthMode();
  const base = { configured: sheetsConfigured(), mode, hasSpreadsheetId: Boolean(spreadsheetId()), isAdmin: user.isAdmin, serviceAccount: mode === "service-account" ? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? null : null };
  if (!base.configured) return json({ ...base, connected: false });
  try {
    const client = await SheetsClient.create(await getUserGoogleTokens(req));
    const info = await client.info();
    const tabs = Object.values(TABS).map((t) => ({ id: t.id, title: t.title, exists: info.tabs.includes(t.title) }));
    return json({ ...base, connected: true, title: info.title, url: client.spreadsheetUrl, tabs });
  } catch (e) {
    return json({ ...base, connected: false, error: (e as Error).message });
  }
});

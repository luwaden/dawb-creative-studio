import { nanoid } from "nanoid";
import { getUserGoogleTokens, HttpError, requireUser } from "@/lib/server/auth";
import { getConfig } from "@/lib/server/config";
import { json, route } from "@/lib/server/http";
import { getStorage } from "@/lib/server/storage";
import { SheetsClient, sheetsConfigured } from "@/lib/server/sheets";
import { studioUsers } from "@/lib/server/users";

export const dynamic = "force-dynamic";

interface Check {
  id: string;
  label: string;
  status: "ok" | "warn" | "fail" | "off";
  detail: string;
}

/** Live system check for admins: sign-in, storage round-trip, Sheets, rendering. Never returns secrets. */
export const GET = route(async (req: Request) => {
  const user = await requireUser();
  if (!user.isAdmin) throw new HttpError(403, "Only admins can run the system check.");
  const cfg = getConfig();
  const checks: Check[] = [];

  const users = studioUsers();
  checks.push({
    id: "signin",
    label: "Sign-in",
    status: !cfg.authRequired && !cfg.loginConfigured ? "off" : cfg.loginConfigured ? "ok" : "fail",
    detail: [cfg.passwordConfigured ? `${users.length} email/password user(s), ${users.filter((u) => u.role === "admin").length} admin` : null, cfg.googleConfigured ? "Google sign-in on" : null].filter(Boolean).join(" · ") || (cfg.authRequired ? "No sign-in method configured" : "Local workspace — no sign-in needed"),
  });

  const t0 = Date.now();
  try {
    const s = getStorage();
    const key = `health/check-${nanoid(8)}.json`;
    await s.writeJSON(key, { at: new Date().toISOString() });
    const back = await s.readJSON<{ at: string }>(key);
    await s.remove(key);
    checks.push({ id: "storage", label: `Storage (${cfg.driver})`, status: back?.at ? "ok" : "fail", detail: back?.at ? `Write, read and delete worked in ${Date.now() - t0} ms` : "Wrote a test file but couldn't read it back" });
  } catch (e) {
    checks.push({ id: "storage", label: `Storage (${cfg.driver})`, status: "fail", detail: (e as Error).message });
  }

  if (!sheetsConfigured()) checks.push({ id: "sheets", label: "Google Sheets", status: "off", detail: "Not configured (optional)" });
  else {
    try {
      const info = await (await SheetsClient.create(await getUserGoogleTokens(req))).info();
      const missing = ["Trainees", "Speakers", "Lessons", "Content", "Users"].filter((t) => !info.tabs.includes(t));
      checks.push({ id: "sheets", label: "Google Sheets", status: missing.length ? "warn" : "ok", detail: missing.length ? `Connected to “${info.title}” — missing tabs: ${missing.join(", ")} (run Prepare spreadsheet)` : `Connected to “${info.title}”` });
    } catch (e) {
      checks.push({ id: "sheets", label: "Google Sheets", status: "fail", detail: (e as Error).message });
    }
  }

  checks.push({ id: "render", label: "Server video rendering", status: cfg.serverRender ? "ok" : "off", detail: cfg.serverRender ? "Available (MP4 on this server)" : "Off on Vercel — videos export in the browser (Chrome/Edge)" });
  return json({ checks, workspace: cfg.workspace, checkedAt: new Date().toISOString() });
});

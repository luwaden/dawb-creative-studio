import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser } from "./auth";
import { getConfig } from "./config";

/** Server-side page gate: shared workspace pages require an approved sign-in. */
export async function requirePageAccess() {
  const cfg = getConfig();
  if (!cfg.authRequired) return;
  if (!cfg.googleConfigured) redirect("/signin?reason=not-configured");
  const user = await getCurrentUser();
  if (!user) redirect("/signin");
}

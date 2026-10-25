import { SignIn } from "./SignIn";
import { getConfig } from "@/lib/server/config";

export const metadata = { title: "Sign in · DAWB Creative Studio" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ reason?: string; error?: string; callbackUrl?: string }> }) {
  const { reason, error, callbackUrl } = await searchParams;
  const cfg = getConfig();
  const safeCallback = callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/";
  return <SignIn notConfigured={reason === "not-configured" || !cfg.loginConfigured} error={error} password={cfg.passwordConfigured} google={cfg.googleConfigured} callbackUrl={safeCallback} />;
}

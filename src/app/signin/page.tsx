import { SignIn } from "./SignIn";

export const metadata = { title: "Sign in · DAWB Creative Studio" };

export default async function Page({ searchParams }: { searchParams: Promise<{ reason?: string; error?: string }> }) {
  const { reason, error } = await searchParams;
  return <SignIn notConfigured={reason === "not-configured"} error={error} />;
}

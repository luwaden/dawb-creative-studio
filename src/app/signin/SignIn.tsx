"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

const MESSAGES: Record<string, string> = {
  CredentialsSignin: "Wrong email or password. After 5 failed tries, wait 15 minutes.",
  AccessDenied: "This account isn't approved for the studio. Ask an admin to add your email (STUDIO_USERS or ALLOWED_EMAILS).",
  OAuthSignin: "Google sign-in isn't set up correctly (check GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
  OAuthCallback: "Google couldn't complete sign-in. Check the redirect URI in Google Cloud and that your email is a Test user on the consent screen.",
  Callback: "Google couldn't complete sign-in. Check the redirect URI in Google Cloud and that NEXTAUTH_URL matches your site address.",
  Configuration: "Sign-in is misconfigured on the server (NEXTAUTH_SECRET missing?).",
};

export function SignIn({ notConfigured, error, password, google, callbackUrl }: { notConfigured: boolean; error?: string; password: boolean; google: boolean; callbackUrl: string }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(error ? MESSAGES[error] ?? "Sign-in failed. Please try again." : "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await signIn("password", { email, password: pw, redirect: false, callbackUrl });
    setBusy(false);
    if (res?.ok && !res.error) window.location.href = callbackUrl;
    else setErr(MESSAGES[res?.error ?? ""] ?? MESSAGES.CredentialsSignin);
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas p-4">
      <div className="w-full max-w-sm rounded-lg border border-line bg-white p-8 shadow-soft">
        <img src="/brand/dawb-logo-light.svg" alt="DAWB" width={72} height={72} className="mx-auto" />
        <h1 className="mt-4 text-center text-lg font-bold">DAWB Creative Studio</h1>
        <p className="mt-1 text-center text-sm text-muted">Team sign-in</p>
        {notConfigured ? (
          <p className="mt-6 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900">Sign-in isn’t set up yet. An admin needs to set NEXTAUTH_SECRET and STUDIO_USERS (see README → Sign-in).</p>
        ) : (
          <>
            {err && <p role="alert" className="mt-6 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{err}</p>}
            {password && (
              <form onSubmit={submit} className="mt-6 space-y-3">
                <label className="block text-sm">
                  <span className="mb-1 block text-xs font-medium text-ink-2">Email</span>
                  <input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className="h-10 w-full rounded-md border border-line px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block text-xs font-medium text-ink-2">Password</span>
                  <input type="password" required autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className="h-10 w-full rounded-md border border-line px-3 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15" />
                </label>
                <button type="submit" disabled={busy} className="h-10 w-full rounded-md bg-brand text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
              </form>
            )}
            {password && google && <div className="my-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>}
            {google && (
              <button onClick={() => signIn("google", { callbackUrl })} className={`${password ? "" : "mt-6 "}flex h-10 w-full items-center justify-center gap-2 rounded-md border border-line bg-white text-sm font-medium hover:bg-canvas`}>
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
                Continue with Google
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

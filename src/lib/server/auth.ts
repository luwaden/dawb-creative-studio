import "server-only";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getToken } from "next-auth/jwt";
import { getConfig } from "./config";

export interface AppUser {
  email: string;
  name: string;
  image?: string | null;
  isAdmin: boolean;
}

export function isEmailAllowed(email: string | null | undefined, cfg = getConfig()): boolean {
  if (!email) return false;
  const e = email.toLowerCase();
  if (cfg.allowedEmails.includes(e)) return true;
  const domain = e.split("@")[1] ?? "";
  if (cfg.allowedDomains.includes(domain)) return true;
  // No allowlist configured = nobody gets in. The shared workspace must never be open by accident.
  return false;
}

export function buildAuthOptions(): NextAuthOptions {
  const cfg = getConfig();
  return {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
    providers: cfg.googleConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            // Ask for Sheets access only when Sheets runs on each user's own account.
            ...(process.env.SHEETS_AUTH === "user"
              ? { authorization: { params: { scope: "openid email profile https://www.googleapis.com/auth/spreadsheets", access_type: "offline", prompt: "consent" } } }
              : {}),
          }),
        ]
      : [],
    pages: { signIn: "/signin", error: "/signin" },
    callbacks: {
      async signIn({ profile, user }) {
        const email = (profile as { email?: string; email_verified?: boolean } | undefined)?.email ?? user?.email;
        const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified !== false;
        return verified && isEmailAllowed(email);
      },
      async jwt({ token, account }) {
        // Keep Google tokens inside the encrypted session cookie (never sent to the browser as data).
        if (account?.provider === "google" && process.env.SHEETS_AUTH === "user") {
          token.gAccess = account.access_token;
          token.gRefresh = account.refresh_token ?? token.gRefresh;
          token.gExpires = account.expires_at;
        }
        return token;
      },
      async session({ session }) {
        return session;
      },
    },
    events: {
      async signIn({ user, account, profile }) {
        const email = ((profile as { email?: string } | undefined)?.email ?? user?.email ?? "").toLowerCase();
        if (!email || !isEmailAllowed(email)) return;
        const { recordSignIn } = await import("./sheets");
        // Bounded so a slow Sheets API never holds up sign-in.
        await Promise.race([
          recordSignIn(
            { email, name: user?.name, image: user?.image, isAdmin: getConfig().adminEmails.includes(email) },
            account ? { accessToken: account.access_token, refreshToken: account.refresh_token, expiresAt: account.expires_at, email } : null,
          ),
          new Promise((r) => setTimeout(r, 4000)),
        ]);
      },
    },
  };
}

const LOCAL_USER: AppUser = { email: "local@this-computer", name: "Local user", isAdmin: true };

/**
 * Current user for server code. In local mode without sign-in everyone on the
 * machine is the "Local user". When sign-in is required, returns null unless a
 * valid session for an allowlisted account exists (re-checked on every request,
 * so removing someone from the allowlist takes effect immediately).
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const cfg = getConfig();
  if (!cfg.authRequired) {
    if (!cfg.googleConfigured) return LOCAL_USER;
    const session = await getServerSession(buildAuthOptions()).catch(() => null);
    const email = session?.user?.email;
    if (email && isEmailAllowed(email, cfg)) return toUser(email, session?.user?.name, session?.user?.image, cfg);
    return LOCAL_USER;
  }
  if (!cfg.googleConfigured) return null;
  const session = await getServerSession(buildAuthOptions()).catch(() => null);
  const email = session?.user?.email;
  if (!email || !isEmailAllowed(email, cfg)) return null;
  return toUser(email, session?.user?.name, session?.user?.image, cfg);
}

function toUser(email: string, name: string | null | undefined, image: string | null | undefined, cfg = getConfig()): AppUser {
  return { email: email.toLowerCase(), name: name || email.split("@")[0], image, isAdmin: cfg.adminEmails.includes(email.toLowerCase()) };
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** The signed-in user's Google tokens (SHEETS_AUTH=user only), read from the encrypted session cookie. */
export async function getUserGoogleTokens(req: Request): Promise<{ accessToken?: string; refreshToken?: string; expiresAt?: number; email?: string } | null> {
  if (process.env.SHEETS_AUTH !== "user" || !process.env.NEXTAUTH_SECRET) return null;
  const t = await getToken({ req: req as unknown as Parameters<typeof getToken>[0]["req"], secret: process.env.NEXTAUTH_SECRET }).catch(() => null);
  if (!t) return null;
  return { accessToken: t.gAccess as string | undefined, refreshToken: t.gRefresh as string | undefined, expiresAt: t.gExpires as number | undefined, email: t.email ?? undefined };
}

export async function requireUser(): Promise<AppUser> {
  const cfg = getConfig();
  if (cfg.authRequired && !cfg.googleConfigured) {
    throw new HttpError(503, "The shared workspace needs Google sign-in configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET).");
  }
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please sign in with an approved DAWB Google account.");
  return user;
}

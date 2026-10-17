import "server-only";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
      ? [GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET! })]
      : [],
    pages: { signIn: "/signin", error: "/signin" },
    callbacks: {
      async signIn({ profile, user }) {
        const email = (profile as { email?: string; email_verified?: boolean } | undefined)?.email ?? user?.email;
        const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified !== false;
        return verified && isEmailAllowed(email);
      },
      async session({ session }) {
        return session;
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

export async function requireUser(): Promise<AppUser> {
  const cfg = getConfig();
  if (cfg.authRequired && !cfg.googleConfigured) {
    throw new HttpError(503, "The shared workspace needs Google sign-in configured (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET).");
  }
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "Please sign in with an approved DAWB Google account.");
  return user;
}

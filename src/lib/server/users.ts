import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Seeded studio users who sign in with email + password (no Google needed).
 * Set STUDIO_USERS to one entry per line (or separated by ";"):
 *
 *   email|Full name|admin|scrypt$<salt>$<hash>
 *
 * Create entries with:  npm run user:add -- you@example.com "Your Name" admin
 * Passwords are never stored — only a salted scrypt hash.
 */

export interface StudioUser {
  email: string;
  name: string;
  role: "admin" | "member";
  hash: string;
}

const N = 16384;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password.normalize("NFKC"), salt, 64, { N }).toString("base64url");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const actual = scryptSync(password.normalize("NFKC"), salt, expected.length, { N });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function studioUsers(): StudioUser[] {
  return (process.env.STUDIO_USERS ?? "")
    .split(/\r?\n|;/)
    .map((l) => l.trim())
    .filter(Boolean)
    .flatMap((line) => {
      const [email, name, role, hash] = line.split("|").map((s) => s.trim());
      if (!email?.includes("@") || !hash?.startsWith("scrypt$")) return [];
      return [{ email: email.toLowerCase(), name: name || email.split("@")[0], role: role === "admin" ? "admin" : "member", hash } as StudioUser];
    });
}

export function findStudioUser(email: string | null | undefined): StudioUser | undefined {
  const e = (email ?? "").trim().toLowerCase();
  return e ? studioUsers().find((u) => u.email === e) : undefined;
}

// Simple brute-force guard: 5 failed attempts per email per 15 minutes (per server instance).
const failures = new Map<string, { count: number; until: number }>();

export function checkPassword(email: string, password: string): StudioUser | null {
  const key = email.trim().toLowerCase();
  const f = failures.get(key);
  if (f && f.count >= 5 && f.until > Date.now()) return null;
  const user = findStudioUser(key);
  // Always run scrypt so response time doesn't reveal whether the email exists.
  const ok = verifyPassword(password, user?.hash ?? "scrypt$c2FsdHNhbHRzYWx0$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") && Boolean(user);
  if (ok) {
    failures.delete(key);
    return user!;
  }
  const next = f && f.until > Date.now() ? f.count + 1 : 1;
  failures.set(key, { count: next, until: Date.now() + 15 * 60 * 1000 });
  return null;
}

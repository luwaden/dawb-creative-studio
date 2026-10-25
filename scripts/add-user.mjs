/**
 * Creates a STUDIO_USERS entry (email + password sign-in).
 *   npm run user:add -- you@example.com "Your Name" admin            (generates a password)
 *   npm run user:add -- you@example.com "Your Name" member "MyPass!"  (uses yours)
 * Paste the printed line into STUDIO_USERS (Vercel env var or .env.local).
 * One line per person; separate several with ";" if your host needs one line.
 */
import { randomBytes, scryptSync } from "node:crypto";

const [email, name = "", role = "member", given] = process.argv.slice(2);
if (!email || !email.includes("@")) {
  console.error('Usage: npm run user:add -- <email> "<Full name>" <admin|member> [password]');
  process.exit(1);
}
const password = given ?? randomBytes(9).toString("base64url");
if (password.length < 10) {
  console.error("Use a password of at least 10 characters.");
  process.exit(1);
}
const salt = randomBytes(16).toString("base64url");
const hash = scryptSync(password.normalize("NFKC"), salt, 64, { N: 16384 }).toString("base64url");
const entry = `${email.toLowerCase()}|${name.replace(/[|;]/g, " ")}|${role === "admin" ? "admin" : "member"}|scrypt$${salt}$${hash}`;
console.log("\nAdd this to STUDIO_USERS:\n");
console.log(entry);
if (!given) console.log(`\nPassword for ${email}: ${password}\n(Share it privately; it isn't stored anywhere.)`);

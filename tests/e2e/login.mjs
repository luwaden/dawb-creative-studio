/**
 * Sign-in end-to-end: seeded email/password users, wrong password, lockout-safe
 * success, protected pages, and the admin System check.
 *   node tests/e2e/login.mjs     (needs `npm run build`; starts the app on port 3200)
 */
import { spawn, execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";

const PORT = 3200;
const BASE = `http://localhost:${PORT}`;
const line = (email, name, role, pw) => execFileSync("node", ["scripts/add-user.mjs", email, name, role, pw]).toString().split("\n").find((l) => l.includes("scrypt$"));
const env = {
  ...process.env,
  REQUIRE_AUTH: "true",
  STORAGE_DRIVER: "fs",
  NEXTAUTH_SECRET: "e2e-secret-e2e-secret-e2e-secret-1234",
  NEXTAUTH_URL: BASE,
  STUDIO_USERS: [line("admin@dawb.test", "Admin Person", "admin", "admin-pass-123"), line("member@dawb.test", "Member Person", "member", "member-pass-123")].join("\n"),
  DATA_DIR: `/tmp/dawb-login-e2e-${Date.now()}`,
};
const stopApp = () => { try { process.platform === "win32" ? app.kill() : process.kill(-app.pid, "SIGTERM"); } catch {} };
const app = spawn("npx", ["next", "start", "-p", String(PORT)], { detached: process.platform !== "win32",  env, stdio: ["ignore", "pipe", "pipe"] });
let log = "";
app.stdout.on("data", (d) => (log += d));
app.stderr.on("data", (d) => (log += d));
const results = [];
const check = (n, ok, d = "") => { results.push(ok); console.log(`${ok ? "PASS" : "FAIL"}  ${n}${d ? ` — ${d}` : ""}`); };

let browser;
try {
  for (let i = 0; i < 90; i++) { try { if ((await fetch(`${BASE}/signin`)).ok) break; } catch {} await new Promise((r) => setTimeout(r, 1000)); }
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage();
  const api = await fetch(`${BASE}/api/projects`);
  check("API refuses anonymous requests", api.status === 401);
  await page.goto(`${BASE}/`);
  check("Pages redirect to sign-in", page.url().includes("/signin"));
  await page.getByLabel("Email").fill("admin@dawb.test");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  // (Next.js has its own hidden role="alert" route announcer, so match our message text.)
  const msg = page.getByText(/Wrong email or password/);
  await msg.waitFor({ timeout: 15000 });
  check("Wrong password is rejected with a clear message", await msg.isVisible());
  await page.getByLabel("Password").fill("admin-pass-123");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(`${BASE}/`, { timeout: 20000 });
  check("Seeded admin signs in", true);
  await page.goto(`${BASE}/status`);
  await page.getByText(/Write, read and delete worked/).waitFor({ timeout: 20000 });
  const txt = await page.locator("body").innerText();
  check("System check: storage round-trip OK", txt.includes("Write, read and delete worked"));
  check("System check: sign-in shows seeded users", txt.includes("2 email/password user(s), 1 admin"));
  check("System check: templates load", /\d+ templates loaded/.test(txt));
  const member = await browser.newPage();
  await member.goto(`${BASE}/signin`);
  await member.getByLabel("Email").fill("member@dawb.test");
  await member.getByLabel("Password").fill("member-pass-123");
  await member.getByRole("button", { name: "Sign in" }).click();
  await member.waitForURL(`${BASE}/`, { timeout: 20000 });
  const h = await member.request.get(`${BASE}/api/health`);
  check("Members can sign in but can't run the admin system check", h.status() === 403);
} catch (e) {
  console.error(e, log.slice(-2000));
  results.push(false);
} finally {
  await browser?.close();
  stopApp();
}
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed.`);
process.exit(passed === results.length ? 0 : 1);

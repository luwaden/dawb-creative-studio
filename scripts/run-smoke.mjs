/** Starts the built app on port 3300 and runs tests/e2e/smoke.mjs against it. */
import { spawn } from "node:child_process";
const stopApp = () => { try { process.platform === "win32" ? app.kill() : process.kill(-app.pid, "SIGTERM"); } catch {} };
const app = spawn("npx", ["next", "start", "-p", "3300"], { detached: process.platform !== "win32",  env: { ...process.env, DATA_DIR: `${process.env.TMPDIR ?? "/tmp"}/dawb-smoke-${Date.now()}`, REQUIRE_AUTH: "false", STORAGE_DRIVER: "fs" }, stdio: "ignore", shell: process.platform === "win32" });
for (let i = 0; i < 90; i++) { try { if ((await fetch("http://localhost:3300/api/workspace")).ok) break; } catch {} await new Promise((r) => setTimeout(r, 1000)); }
const code = await new Promise((res) => spawn("node", ["tests/e2e/smoke.mjs", "http://localhost:3300"], { stdio: "inherit" }).on("exit", res));
stopApp();
process.exit(code ?? 1);

/**
 * Runs every automated check in order and prints a summary:
 * typecheck → unit tests → production build → sign-in e2e → Sheets e2e → editor/export e2e.
 *   npm run test:all
 */
import { spawn } from "node:child_process";

const steps = [
  ["Type check", "npm", ["run", "typecheck"]],
  ["Unit tests", "npm", ["test"]],
  ["Production build", "npm", ["run", "build"]],
  ["Sign-in (end-to-end)", "node", ["tests/e2e/login.mjs"]],
  ["Google Sheets workflow (end-to-end, fake Sheets API)", "node", ["tests/e2e/sheets.mjs"]],
  ["Editor, exports and video (end-to-end)", "node", ["scripts/run-smoke.mjs"]],
];
const run = (cmd, args) => new Promise((res) => spawn(cmd, args, { stdio: "inherit", shell: process.platform === "win32" }).on("exit", (c) => res(c ?? 1)));
const summary = [];
for (const [name, cmd, args] of steps) {
  console.log(`\n━━━ ${name} ━━━`);
  const code = await run(cmd, args);
  summary.push([name, code === 0]);
  if (code !== 0 && name === "Production build") break;
}
console.log("\n━━━ Summary ━━━");
for (const [n, ok] of summary) console.log(`${ok ? "✔" : "✘"}  ${n}`);
process.exit(summary.every(([, ok]) => ok) ? 0 : 1);

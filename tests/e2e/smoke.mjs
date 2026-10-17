/**
 * End-to-end smoke test against a running app (default http://localhost:3000).
 *   node tests/e2e/smoke.mjs [baseUrl]
 * Covers: template → edit → save → reopen, PNG + ZIP export, MP4 export (browser + server).
 * Set CHROME_PATH to use a specific Chromium build.
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const BASE = process.argv[2] ?? "http://localhost:3000";
const out = fs.mkdtempSync(path.join(os.tmpdir(), "dawb-e2e-"));
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`); };

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ["--enable-features=WebCodecs"] });
const ctx = await browser.newContext({ acceptDownloads: true, viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

function pngSize(file) {
  const b = fs.readFileSync(file);
  return { ok: b.subarray(1, 4).toString() === "PNG", w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}
function probe(file) {
  try {
    return JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=codec_name,width,height,nb_frames:format=duration", "-of", "json", file]).toString());
  } catch (e) { return { error: String(e) }; }
}

try {
  // 1. Design: open template, edit via Quick edit, save
  await page.goto(`${BASE}/design/new?template=p11-smallpox`, { waitUntil: "networkidle" });
  await page.getByText("Slide 1 content").waitFor({ timeout: 60000 });
  const field = page.getByRole("textbox", { name: "Statement", exact: true });
  await field.fill("Then research ended it. E2E edit.");
  await page.getByRole("button", { name: "Save" }).click();
  await page.waitForURL(/\/design\/[A-Za-z0-9_-]{12}$/, { timeout: 30000 });
  const projectUrl = page.url();
  await page.getByText("Saved", { exact: true }).waitFor({ timeout: 30000 });
  check("Design project saved", true, projectUrl);

  // 2. Export PNG at 2x
  await page.getByRole("button", { name: "Export" }).click();
  const [dl] = await Promise.all([page.waitForEvent("download", { timeout: 60000 }), page.getByRole("button", { name: "Download" }).click()]);
  const pngPath = path.join(out, dl.suggestedFilename());
  await dl.saveAs(pngPath);
  const ps = pngSize(pngPath);
  check("PNG export is a valid 2160×2700 PNG", ps.ok && ps.w === 2160 && ps.h === 2700, `${ps.w}×${ps.h}, ${fs.statSync(pngPath).size} bytes → ${pngPath}`);

  // 3. Reopen and confirm the edit persisted
  await page.goto(projectUrl, { waitUntil: "networkidle" });
  await page.getByText("Slide 1 content").waitFor({ timeout: 60000 });
  const val = await page.getByRole("textbox", { name: "Statement", exact: true }).inputValue();
  check("Reopened project keeps edits", val.includes("E2E edit"), val);

  // 4. Carousel ZIP export
  await page.goto(`${BASE}/design/new?template=p07-ibn-al-haytham`, { waitUntil: "networkidle" });
  await page.getByText("Slide 1 content").waitFor({ timeout: 60000 });
  await page.getByRole("button", { name: "Export" }).click();
  await page.getByLabel("Slides").selectOption("all");
  await page.getByLabel("Size").selectOption("1");
  const [zipDl] = await Promise.all([page.waitForEvent("download", { timeout: 120000 }), page.getByRole("button", { name: "Download" }).click()]);
  const zipPath = path.join(out, zipDl.suggestedFilename());
  await zipDl.saveAs(zipPath);
  const list = execFileSync("unzip", ["-l", zipPath]).toString();
  const count = (list.match(/\.png/g) || []).length;
  check("Carousel exports all slides as ZIP", count === 4, `${count} PNGs → ${zipPath}`);

  // 5. Video: browser export
  await page.goto(`${BASE}/video/new?template=m11-300-million`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Export video" }).click();
  await page.getByText(/keep this tab open|can't encode/).waitFor({ timeout: 30000 });
  const browserOk = await page.getByLabel("In this browser").isEnabled().catch(() => false);
  if (browserOk) {
    await page.getByLabel("In this browser").check();
    const [vdl] = await Promise.all([page.waitForEvent("download", { timeout: 300000 }), page.getByRole("button", { name: "Render & download" }).click()]);
    const vp = path.join(out, `browser-${vdl.suggestedFilename()}`);
    await vdl.saveAs(vp);
    const pr = probe(vp);
    const s = pr.streams?.find((x) => x.width);
    check("Browser video export is a valid video", Boolean(s && s.width === 1080 && s.height === 1350), `${s?.codec_name} ${s?.width}×${s?.height} ${pr.format?.duration}s → ${vp}`);
  } else {
    check("Browser video export", false, "browser reports no WebCodecs encoder support (expected in some headless builds)");
  }
  await page.keyboard.press("Escape");

  // 6. Video: server export
  await page.goto(`${BASE}/video/new?template=v17-sixty-seconds`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Export video" }).click();
  const serverEnabled = await page.getByLabel("On the render server").isEnabled();
  if (serverEnabled) {
    await page.getByLabel("On the render server").check();
    const [sdl] = await Promise.all([page.waitForEvent("download", { timeout: 600000 }), page.getByRole("button", { name: "Render & download" }).click()]);
    const sp = path.join(out, `server-${sdl.suggestedFilename()}`);
    await sdl.saveAs(sp);
    const pr = probe(sp);
    const s = pr.streams?.find((x) => x.width);
    check("Server video export is a valid H.264 MP4", Boolean(s && s.codec_name === "h264" && s.width === 1080 && s.height === 1920), `${s?.codec_name} ${s?.width}×${s?.height} ${s?.nb_frames} frames ${pr.format?.duration}s → ${sp}`);
  } else {
    check("Server video export", false, "server rendering disabled on this deployment");
  }
} catch (e) {
  check("Unexpected failure", false, String(e).slice(0, 3000));
} finally {
  if (errors.length) console.log("Page errors:\n" + errors.slice(0, 10).join("\n"));
  await browser.close();
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed. Files in ${out}`);
  process.exit(failed ? 1 : 0);
}

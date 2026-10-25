/**
 * End-to-end test of the Google Sheets workflow against a fake Sheets API:
 * prepare spreadsheet → add trainees (one without consent) → generate quote
 * graphics + videos → content log; plus lessons and speakers generation.
 *
 *   node tests/e2e/sheets.mjs        (starts its own app on port 3100)
 */
import { spawn } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";
import { chromium } from "@playwright/test";
import { FakeSheets } from "../fake-sheets.mjs";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, publicKeyEncoding: { type: "spki", format: "pem" }, privateKeyEncoding: { type: "pkcs8", format: "pem" } });
const fake = new FakeSheets({ publicKeyPem: publicKey });
const fakeServer = await fake.listen(4010);

const env = {
  ...process.env,
  GOOGLE_SHEETS_ID: "1FakeSheetForDawbStudioE2Etests000000000",
  GOOGLE_SERVICE_ACCOUNT_EMAIL: "studio@dawb-e2e.iam.gserviceaccount.com",
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: privateKey.replace(/\n/g, "\\n"),
  SHEETS_API_BASE: "http://localhost:4010",
  GOOGLE_TOKEN_URL: "http://localhost:4010/token",
  DATA_DIR: `/tmp/dawb-sheets-e2e-${Date.now()}`,
  STORAGE_DRIVER: "fs",
  REQUIRE_AUTH: "false",
};
const stopApp = () => { try { process.platform === "win32" ? app.kill() : process.kill(-app.pid, "SIGTERM"); } catch {} };
const app = spawn("npx", ["next", "start", "-p", String(PORT)], { detached: process.platform !== "win32",  env, stdio: ["ignore", "pipe", "pipe"] });
let appLog = "";
app.stdout.on("data", (d) => (appLog += d));
app.stderr.on("data", (d) => (appLog += d));

const results = [];
const shots = process.env.SCREENSHOT_DIR;
const shot = async (page, name) => shots && page.screenshot({ path: `${shots}/${name}.png` });
const check = (name, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
};

async function waitForApp() {
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch(`${BASE}/api/workspace`);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`App did not start:\n${appLog}`);
}

let browser;
try {
  await waitForApp();
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  // 1. Data page shows the spreadsheet and offers to prepare it.
  await page.goto(`${BASE}/data`, { waitUntil: "networkidle" });
  await page.getByText("Open “DAWB Studio Data (test)”").waitFor({ timeout: 20000 });
  check("Data page connects to the spreadsheet", true);
  await page.getByRole("button", { name: "Prepare spreadsheet" }).click();
  await page.getByText(/Spreadsheet ready/).waitFor({ timeout: 20000 });
  check("Prepare spreadsheet creates the tabs", ["Trainees", "Speakers", "Lessons", "Content", "Users"].every((t) => fake.sheets.has(t)), [...fake.sheets.keys()].join(", "));

  // 2. Upload a photo, then add two trainees through the form (one without consent).
  const assetId = await page.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 400; c.height = 400;
    const g = c.getContext("2d");
    g.fillStyle = "#0097B2"; g.fillRect(0, 0, 400, 400);
    g.fillStyle = "#fff"; g.beginPath(); g.arc(200, 160, 80, 0, Math.PI * 2); g.fill(); g.fillRect(90, 260, 220, 140);
    const blob = await new Promise((r) => c.toBlob(r, "image/png"));
    const fd = new FormData();
    fd.append("file", new File([blob], "trainee.png", { type: "image/png" }));
    fd.append("kind", "image");
    const res = await fetch("/api/assets", { method: "POST", body: fd });
    return (await res.json()).asset.id;
  });
  const addTrainee = async (v) => {
    await page.getByRole("button", { name: "Add", exact: true }).click();
    const dlg = page.locator('[role="dialog"]');
    await dlg.getByLabel(/^Full name/).fill(v.name);
    await dlg.getByLabel(/^Occupation/).fill(v.occupation);
    await dlg.getByLabel(/^Location/).fill(v.location);
    await dlg.getByLabel(/^Learning quote/).fill(v.quote);
    await dlg.getByLabel(/^Progress/).fill(v.progress);
    await dlg.getByLabel(/^Track/).fill("Excel");
    await dlg.getByLabel(/^Consent/).selectOption(v.consent);
    if (v.photo) await dlg.getByPlaceholder("https://… or choose an upload").fill(v.photo);
    await dlg.getByRole("button", { name: "Add row" }).click();
    await page.getByText("Row added to Google Sheets").waitFor({ timeout: 15000 });
    await page.waitForLoadState("networkidle");
  };
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await shot(page, "data-add-form");
  await page.keyboard.press("Escape");
  await addTrainee({ name: "Amaka Eze", occupation: "Nurse", location: "Enugu, Nigeria", quote: "Excel finally clicked for me — I now build my own ward reports.", progress: "Week 5 of 8", consent: "Yes", photo: `asset:${assetId}` });
  await addTrainee({ name: "Bayo Ade", occupation: "Student", location: "Lagos, Nigeria", quote: "Great classes.", progress: "Week 2 of 8", consent: "No" });
  const traineeRows = await (await page.request.get(`${BASE}/api/sheets/trainees`)).json();
  check("Rows are written to Google Sheets with IDs", traineeRows.rows.length === 2 && traineeRows.rows.every((r) => /^tr_/.test(r.id)), traineeRows.rows.map((r) => r.name).join(", "));

  await shot(page, "data-trainees");
  // 3. Select both and generate a quote graphic + video; the no-consent row is skipped.
  await page.getByRole("checkbox", { name: "Select all" }).check();
  await page.getByRole("button", { name: "Generate content" }).click();
  const dlg = page.locator('[role="dialog"]');
  await dlg.getByText(/without consent .* will be skipped/).waitFor();
  await dlg.getByText("Trainee Quote — Word by Word (9:16)").click();
  await dlg.getByRole("button", { name: "Generate", exact: true }).click();
  await dlg.getByText(/Done — 2 of 2 created/).waitFor({ timeout: 60000 });
  await shot(page, "data-generated");
  check("Generates personalised projects (consent respected)", true, "2 projects for 1 consenting trainee × 2 templates");
  const contentRows = await (await page.request.get(`${BASE}/api/sheets/content`)).json();
  check("Content tab logs each generated project", contentRows.rows.length === 2 && contentRows.rows.every((r) => r.project_id && r.source_tab === "trainees"), contentRows.rows.map((r) => r.template_id).join(", "));

  // 4. The generated design contains the trainee's data and the imported photo.
  const designId = contentRows.rows.find((r) => r.kind === "design").project_id;
  const proj = await (await page.request.get(`${BASE}/api/projects/${designId}`)).json();
  const json = JSON.stringify(proj.doc);
  check("Design is personalised (name, quote, photo)", json.includes("Amaka Eze") && json.includes("ward reports") && json.includes(assetId), proj.meta.name);
  check("Generated design has a thumbnail", proj.meta.hasThumbnail === true);
  await dlg.getByRole("button", { name: "Close" }).last().click();

  // 5. Lessons and speakers via the API, then generate a carousel and a speaker intro.
  const post = (tab, body) => page.request.post(`${BASE}/api/sheets/${tab}`, { data: body, headers: { origin: BASE } });
  await post("lessons", { tool: "Excel", function_name: "SUM", topic: "Add up numbers", what_it_does: "Adds numbers.", syntax: "=SUM(number1, …)", arguments: "number1: first", example_table: "Month | Sales\nJan | 1200\nFeb | 850", example_formula: "=SUM(B2:B3)", result_cell: "B4", example_result: "2050", tip: "Text is skipped.", status: "Ready" });
  await post("speakers", { name: "Dr Kemi Bello", role: "Data Lead", organisation: "Acme", bio: "Builds dashboards.", expertise: "Power BI, SQL", webinar_title: "Dashboards That Decide", webinar_date: "Sat, 14 Nov", webinar_time: "4 PM WAT", platform: "Google Meet" });
  for (const [tabLabel, templateName, expect, rowText] of [["Class lessons", "Class Carousel — Excel SUM", "2,050", "Add up numbers"], ["Speakers", "Speaker Profile — Editorial (White)", "Dr Kemi Bello", "Dashboards That Decide"]]) {
    await page.getByRole("button", { name: tabLabel, exact: true }).click();
    // Wait for this tab's rows before selecting (the list reloads on tab change).
    await page.getByRole("cell", { name: rowText }).waitFor({ timeout: 20000 });
    await page.getByRole("checkbox", { name: "Select all" }).check();
    await page.getByRole("button", { name: "Generate content" }).click();
    const d = page.locator('[role="dialog"]');
    // Only the chosen template: untick the default, tick ours.
    for (const box of await d.locator('input[type="checkbox"]:checked').all()) await box.uncheck();
    await d.getByText(templateName).click();
    await d.getByRole("button", { name: "Generate", exact: true }).click();
    await d.getByText(/Done — 1 of 1 created/).waitFor({ timeout: 60000 });
    const rows = (await (await page.request.get(`${BASE}/api/sheets/content`)).json()).rows;
    const last = rows[rows.length - 1];
    const doc = JSON.stringify((await (await page.request.get(`${BASE}/api/projects/${last.project_id}`)).json()).doc);
    check(`${templateName} generated from Sheets`, doc.includes(expect), `${last.template_id}`);
    await d.getByRole("button", { name: "Close" }).last().click();
  }

  // 6. Security: members can't write the Users tab; formula-looking text is stored as text.
  const usersWrite = await post("users", { email: "x@y.z" });
  check("Users tab is not writable through the API", usersWrite.status() === 403);
  const crossSite = await page.request.post(`${BASE}/api/sheets/trainees`, { data: { name: "x" }, headers: { origin: "https://evil.example" } });
  check("Cross-site writes are blocked", crossSite.status() === 403);
  check("All Sheets writes use RAW input (no formula evaluation)", fake.writes.length > 0 && fake.writes.every((w) => w === "RAW"), `${fake.writes.length} writes`);
  check("No browser errors", errors.length === 0, errors.join(" | "));
} catch (e) {
  console.error(e);
  results.push(false);
} finally {
  await browser?.close();
  stopApp();
  fakeServer.close();
}
const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed.`);
process.exit(passed === results.length ? 0 : 1);

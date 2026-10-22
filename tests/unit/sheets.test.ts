import { generateKeyPairSync } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
// @ts-expect-error — plain JS test helper
import { FakeSheets } from "../fake-sheets.mjs";
import { designDocSchema } from "@/lib/design/schema";
import { videoDocSchema } from "@/lib/video/schema";
import { ALL_TEMPLATES } from "@/lib/templates";
import { colIndex, lessonGrid, parseArguments, parseTable, progressFraction, referencedCells } from "@/lib/lessons";
import { columnForHeader, isYes, TABS } from "@/lib/sheets/schema";
import { LESSON_CONCATENATE } from "@/lib/templates/records";

const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048, publicKeyEncoding: { type: "spki", format: "pem" }, privateKeyEncoding: { type: "pkcs8", format: "pem" } });

const fake = new FakeSheets({
  publicKeyPem: publicKey,
  // A hand-made Trainees tab: different header names/order, and rows without IDs.
  seed: { Trainees: [["Full name", "City", "Quote", "Consent"], ["Amaka Eze", "Enugu", "=SUM(A1) is just text to me", "Yes"], ["Bayo Ade", "Lagos", "Loved it", "No"]] },
});

beforeAll(() => {
  process.env.GOOGLE_SHEETS_ID = "https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789/edit#gid=0";
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "studio@dawb-test.iam.gserviceaccount.com";
  // Stored the way it usually arrives from an env var: escaped newlines.
  process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = privateKey.replace(/\n/g, "\\n");
  process.env.SHEETS_API_BASE = "http://fake";
  process.env.GOOGLE_TOKEN_URL = "http://fake/token";
  vi.stubGlobal("fetch", fake.fetch);
});
afterAll(() => vi.unstubAllGlobals());

describe("sheets client", () => {
  it("parses the spreadsheet ID from a link and picks service-account mode", async () => {
    const { spreadsheetId, sheetsAuthMode, sheetsConfigured } = await import("@/lib/server/sheets");
    expect(spreadsheetId()).toBe("1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789");
    expect(sheetsAuthMode()).toBe("service-account");
    expect(sheetsConfigured()).toBe(true);
  });

  it("prepares the spreadsheet: tabs, missing headers and IDs for hand-made rows", async () => {
    const { SheetsClient } = await import("@/lib/server/sheets");
    const client = await SheetsClient.create();
    const r = await client.setup();
    expect(r.created.sort()).toEqual(["Content", "Lessons", "Speakers", "Users"]);
    expect(r.idsAssigned).toBe(2);
    const info = await client.info();
    expect(info.tabs).toEqual(expect.arrayContaining(["Trainees", "Speakers", "Lessons", "Content", "Users"]));
    const rows = await client.read("trainees");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ name: "Amaka Eze", location: "Enugu", consent: "Yes" });
    expect(rows[0].id).toMatch(/^tr_/);
    // Running it again changes nothing.
    expect(await client.setup()).toEqual({ created: [], columnsAdded: 0, idsAssigned: 0 });
  });

  it("appends and updates by ID, always writing RAW values", async () => {
    const { SheetsClient } = await import("@/lib/server/sheets");
    const client = await SheetsClient.create();
    const added = await client.append("speakers", { name: "Dr Test", role: "Analyst", bio: "=HYPERLINK(\"x\")" });
    expect(added.id).toMatch(/^sp_/);
    const updated = await client.update("speakers", added.id, { role: "Lead Analyst" });
    expect(updated).toMatchObject({ name: "Dr Test", role: "Lead Analyst", bio: '=HYPERLINK("x")' });
    const rows = await client.read("speakers");
    expect(rows.find((x) => x.id === added.id)?.role).toBe("Lead Analyst");
    expect(fake.writes.length).toBeGreaterThan(0);
    expect(fake.writes.every((w: string) => w === "RAW")).toBe(true);
    await expect(client.update("speakers", "sp_missing123", { role: "x" })).rejects.toThrow(/no longer exists/);
  });

  it("records a sign-in in the Users tab, then refreshes it", async () => {
    const { recordSignIn, SheetsClient } = await import("@/lib/server/sheets");
    await recordSignIn({ email: "Ada@DawbLearn.org", name: "Ada", image: null, isAdmin: true }, null);
    await recordSignIn({ email: "ada@dawblearn.org", name: "Ada O.", image: null, isAdmin: true }, null);
    const users = await (await SheetsClient.create()).read("users");
    expect(users).toHaveLength(1);
    expect(users[0]).toMatchObject({ email: "ada@dawblearn.org", name: "Ada O.", role: "Admin" });
  });

  it("rejects a bad token exchange with a readable error", async () => {
    const { serviceAccountAssertion } = await import("@/lib/server/sheets");
    const other = generateKeyPairSync("rsa", { modulusLength: 2048, privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });
    const forged = serviceAccountAssertion("x@y.iam.gserviceaccount.com", other.privateKey);
    const res = await fake.fetch("http://fake/token", { method: "POST", body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: forged }).toString() });
    expect(res.status).toBe(400);
  });
});

describe("input cleaning and photo safety", () => {
  it("keeps known columns, enforces required fields and lengths", async () => {
    const { cleanRecord } = await import("@/lib/server/sheetsInput");
    expect(cleanRecord("trainees", { name: " Ada ", hacker: "x" }, { partial: false })).toEqual({ name: "Ada" });
    expect(() => cleanRecord("trainees", { occupation: "x" }, { partial: false })).toThrow(/Full name is required/);
    expect(() => cleanRecord("trainees", { name: "a".repeat(81) }, { partial: true })).toThrow(/too long/);
  });

  it("blocks private addresses and converts Drive links", async () => {
    const { isPrivateAddress, normalisePhotoUrl } = await import("@/lib/server/photo");
    for (const ip of ["127.0.0.1", "10.2.3.4", "172.20.1.1", "192.168.0.9", "169.254.169.254", "::1", "fd00::1", "::ffff:10.0.0.1"]) expect(isPrivateAddress(ip)).toBe(true);
    for (const ip of ["8.8.8.8", "142.250.180.14", "2606:4700::1111"]) expect(isPrivateAddress(ip)).toBe(false);
    expect(normalisePhotoUrl("https://drive.google.com/file/d/1abcDEFghiJKL/view?usp=sharing")).toBe("https://drive.google.com/uc?export=download&id=1abcDEFghiJKL");
  });
});

describe("schema helpers", () => {
  it("maps hand-made headers and consent values", () => {
    expect(columnForHeader("trainees", "Full name")).toBe("name");
    expect(columnForHeader("trainees", "Photo URL")).toBe("photo_url");
    expect(columnForHeader("lessons", "Function")).toBe("function_name");
    expect(isYes("yes")).toBe(true);
    expect(isYes("No")).toBe(false);
    expect(isYes("")).toBe(false);
    expect(TABS.trainees.columns.some((c) => c.key === "consent")).toBe(true);
  });
});

describe("lesson helpers", () => {
  it("parses tables, references and arguments", () => {
    expect(parseTable("Month | Sales\nJan | 1200").rows).toEqual([["Jan", "1200"]]);
    expect(referencedCells("=SUM(B2:B4)").map((c) => `${c.col}:${c.row}`)).toEqual(["1:2", "1:3", "1:4"]);
    expect(referencedCells('=CONCATENATE(A2," B9 ",B2)').length).toBe(2);
    expect(colIndex("AA")).toBe(26);
    expect(parseArguments("number1: first\nnumber2: more")).toEqual([{ name: "number1", meaning: "first" }, { name: "number2", meaning: "more" }]);
    expect(progressFraction("Week 6 of 8")?.value).toBe(0.75);
    expect(progressFraction("Graduated")).toBeNull();
    const g = lessonGrid(LESSON_CONCATENATE);
    expect(g.cell(2, 2)).toBe("Ada Obi");
    expect(g.isRef(0, 2) && g.isRef(1, 2)).toBe(true);
  });
});

describe("data-driven templates", () => {
  const dataTemplates = ALL_TEMPLATES.filter((t) => t.dataSource);
  const long = "x".repeat(300);
  const stress: Record<string, Record<string, string>> = {
    trainees: { name: "Oluwaseun Adebayo-Williams", occupation: "Monitoring & Evaluation Officer", location: "Port Harcourt, Rivers State", quote: long.slice(0, 320), progress: "Week 2 of 12", track: "Research Methods", photo_url: "https://example.com/photo.jpg" },
    speakers: { name: "Professor Chiamaka Nwachukwu-Okafor", role: "Head of Analytics", organisation: "A Very Long Organisation Name Ltd", bio: long.slice(0, 420), expertise: "A, B, C, D, E, F, G", webinar_title: "A Rather Long Webinar Title About Data That Goes On", webinar_date: "Sat, 14 Nov", webinar_time: "4 PM", platform: "Zoom" },
    lessons: { tool: "Google Sheets", function_name: "VLOOKUP", syntax: "=VLOOKUP(key, range, index, [is_sorted])", arguments: "key: a\nrange: b\nindex: c\nis_sorted: d", example_table: "ID | Name\n1 | Ada\n2 | Obi", example_formula: "=VLOOKUP(2, A2:B3, 2, FALSE)", result_cell: "C2", example_result: "Obi", tip: long.slice(0, 240), what_it_does: long.slice(0, 240) },
  };

  it("exist for speakers, lessons and trainees in both design and video", () => {
    for (const src of ["speakers", "lessons", "trainees"] as const) {
      expect(dataTemplates.some((t) => t.dataSource === src && t.kind === "design")).toBe(true);
      expect(dataTemplates.some((t) => t.dataSource === src && t.kind === "video")).toBe(true);
    }
  });

  for (const t of dataTemplates) {
    it(`${t.id} builds a valid document from an unusual row`, () => {
      expect(t.buildFrom).toBeTypeOf("function");
      const doc = t.buildFrom!(stress[t.dataSource!]);
      const parsed = t.kind === "design" ? designDocSchema.safeParse(doc) : videoDocSchema.safeParse(doc);
      expect(parsed.success, JSON.stringify(parsed.error?.issues?.[0])).toBe(true);
      // External photo URLs never reach the canvas (they'd block PNG export).
      expect(JSON.stringify(doc)).not.toContain("https://example.com/photo.jpg");
    });
  }
});

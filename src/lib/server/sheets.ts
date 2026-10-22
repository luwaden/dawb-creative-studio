import "server-only";
import { createSign } from "node:crypto";
import { nanoid } from "nanoid";
import { columnForHeader, TABS, type SheetRecord, type SheetRow, type TabId } from "@/lib/sheets/schema";
import { HttpError } from "./auth";

/**
 * Google Sheets access over the REST API (no SDK).
 *
 * Two ways to authorise, chosen with SHEETS_AUTH:
 *  - "service-account" (default when GOOGLE_SERVICE_ACCOUNT_EMAIL is set): the app
 *    acts as a service account; share the spreadsheet with that email (Editor).
 *    Works in local and shared mode without asking every user for Sheets access.
 *  - "user": each signed-in person's own Google token (the Sheets scope is requested
 *    at sign-in), so access follows the spreadsheet's normal sharing.
 *
 * Values are always written with valueInputOption=RAW, so text like "=SUM(...)"
 * typed into a quote is stored as text and never evaluated as a formula.
 */

const SCOPE = "https://www.googleapis.com/auth/spreadsheets";
const apiBase = () => process.env.SHEETS_API_BASE ?? "https://sheets.googleapis.com/v4";
const tokenUrl = () => process.env.GOOGLE_TOKEN_URL ?? "https://oauth2.googleapis.com/token";

export type SheetsAuthMode = "service-account" | "user" | "none";

export function spreadsheetId(): string | null {
  const raw = (process.env.GOOGLE_SHEETS_ID ?? "").trim();
  if (!raw) return null;
  const m = /\/spreadsheets\/d\/([A-Za-z0-9_-]+)/.exec(raw);
  const id = m ? m[1] : raw;
  return /^[A-Za-z0-9_-]{20,120}$/.test(id) ? id : null;
}

export function sheetsAuthMode(): SheetsAuthMode {
  const explicit = process.env.SHEETS_AUTH;
  const hasSa = Boolean(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
  const hasOauth = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.NEXTAUTH_SECRET);
  if (explicit === "service-account") return hasSa ? "service-account" : "none";
  if (explicit === "user") return hasOauth ? "user" : "none";
  if (hasSa) return "service-account";
  return "none";
}

export function sheetsConfigured(): boolean {
  return Boolean(spreadsheetId()) && sheetsAuthMode() !== "none";
}

// ───────────────────────── tokens ─────────────────────────

let saCache: { token: string; exp: number } | null = null;

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}

/** Signed JWT assertion for the service-account token exchange (RFC 7523). */
export function serviceAccountAssertion(email: string, privateKeyPem: string, now = Math.floor(Date.now() / 1000)): string {
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(JSON.stringify({ iss: email, scope: SCOPE, aud: tokenUrl(), iat: now, exp: now + 3600 }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  return `${header}.${claims}.${b64url(signer.sign(privateKeyPem))}`;
}

async function exchange(body: URLSearchParams): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch(tokenUrl(), { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, cache: "no-store" });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[sheets] token exchange failed", res.status, detail.slice(0, 300));
    throw new HttpError(502, "Google rejected the Sheets credentials. Check the service account key or sign in again.");
  }
  return (await res.json()) as { access_token: string; expires_in: number };
}

async function serviceAccountToken(): Promise<string> {
  if (saCache && saCache.exp - 60 > Date.now() / 1000) return saCache.token;
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL!;
  // Keys pasted into env vars usually carry literal "\n" sequences.
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n");
  let assertion: string;
  try {
    assertion = serviceAccountAssertion(email, key);
  } catch {
    throw new HttpError(500, "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not a valid private key (copy the private_key value from the JSON key file).");
  }
  const t = await exchange(new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }));
  saCache = { token: t.access_token, exp: Math.floor(Date.now() / 1000) + t.expires_in };
  return t.access_token;
}

/** Tokens stored in the encrypted NextAuth JWT when SHEETS_AUTH=user. */
export interface UserGoogleTokens {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  email?: string;
}

const userCache = new Map<string, { token: string; exp: number }>();

async function userToken(t: UserGoogleTokens | null): Promise<string> {
  if (!t?.accessToken) throw new HttpError(401, "Sign in with Google to use Sheets data.");
  if (t.expiresAt && t.expiresAt - 60 > Date.now() / 1000) return t.accessToken;
  const cached = t.email ? userCache.get(t.email) : undefined;
  if (cached && cached.exp - 60 > Date.now() / 1000) return cached.token;
  if (!t.refreshToken) throw new HttpError(401, "Your Google session expired — sign out and sign in again to reconnect Sheets.");
  const fresh = await exchange(new URLSearchParams({ grant_type: "refresh_token", refresh_token: t.refreshToken, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET! }));
  if (t.email) userCache.set(t.email, { token: fresh.access_token, exp: Math.floor(Date.now() / 1000) + fresh.expires_in });
  return fresh.access_token;
}

// ───────────────────────── client ─────────────────────────

export function colLetter(n: number): string {
  let s = "";
  let x = n + 1;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

const range = (title: string, a1: string) => encodeURIComponent(`'${title.replace(/'/g, "''")}'!${a1}`);

export class SheetsClient {
  constructor(private id: string, private getToken: () => Promise<string>) {}

  static async create(userTokens: UserGoogleTokens | null = null): Promise<SheetsClient> {
    const id = spreadsheetId();
    const mode = sheetsAuthMode();
    if (!id || mode === "none") throw new HttpError(503, "Google Sheets isn't connected yet. Set GOOGLE_SHEETS_ID and the Sheets credentials (see README → Google Sheets).");
    return new SheetsClient(id, mode === "service-account" ? serviceAccountToken : () => userToken(userTokens));
  }

  get spreadsheetUrl() {
    return `https://docs.google.com/spreadsheets/d/${this.id}/edit`;
  }

  private async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    const token = await this.getToken();
    const res = await fetch(`${apiBase()}/spreadsheets/${this.id}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init.headers ?? {}) },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[sheets]", res.status, path.split("?")[0], text.slice(0, 300));
      if (res.status === 404) throw new HttpError(404, "Spreadsheet not found — check GOOGLE_SHEETS_ID.");
      if (res.status === 403 || res.status === 401) {
        const who = sheetsAuthMode() === "service-account" ? `the service account (${process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL})` : "your Google account";
        throw new HttpError(403, `Google Sheets refused access. Share the spreadsheet with ${who} as an Editor.`);
      }
      if (res.status === 429) throw new HttpError(429, "Google Sheets rate limit reached — wait a minute and try again.");
      throw new HttpError(502, "Google Sheets returned an error. Try again shortly.");
    }
    return (await res.json()) as T;
  }

  async info(): Promise<{ title: string; tabs: string[] }> {
    const r = await this.call<{ properties: { title: string }; sheets: Array<{ properties: { title: string } }> }>("?fields=properties.title,sheets.properties.title");
    return { title: r.properties.title, tabs: r.sheets.map((s) => s.properties.title) };
  }

  private async values(title: string): Promise<string[][]> {
    const r = await this.call<{ values?: string[][] }>(`/values/${range(title, "A1:ZZ5000")}?majorDimension=ROWS`);
    return r.values ?? [];
  }

  /** Header positions: column key → index, using aliases for hand-made sheets. */
  private headerMap(tab: TabId, headers: string[]): Map<string, number> {
    const map = new Map<string, number>();
    headers.forEach((h, i) => {
      const key = columnForHeader(tab, h);
      if (key && !map.has(key)) map.set(key, i);
    });
    return map;
  }

  async read(tab: TabId): Promise<SheetRow[]> {
    const def = TABS[tab];
    const rows = await this.values(def.title);
    if (!rows.length) return [];
    const map = this.headerMap(tab, rows[0]);
    return rows.slice(1).flatMap((cells, i) => {
      if (!cells.some((c) => String(c ?? "").trim())) return [];
      const rec: SheetRow = { _row: String(i + 2) };
      for (const col of def.columns) {
        const idx = map.get(col.key);
        rec[col.key] = idx === undefined ? "" : String(cells[idx] ?? "").trim();
      }
      return [rec];
    });
  }

  /** Creates missing tabs, adds missing header columns, and assigns IDs to rows without one. */
  async setup(): Promise<{ created: string[]; columnsAdded: number; idsAssigned: number }> {
    const { tabs } = await this.info();
    const created: string[] = [];
    let columnsAdded = 0;
    let idsAssigned = 0;
    const missing = Object.values(TABS).filter((t) => !tabs.includes(t.title));
    if (missing.length) {
      await this.call(":batchUpdate", { method: "POST", body: JSON.stringify({ requests: missing.map((t) => ({ addSheet: { properties: { title: t.title, gridProperties: { frozenRowCount: 1 } } } })) }) });
      created.push(...missing.map((t) => t.title));
    }
    for (const def of Object.values(TABS)) {
      const rows = created.includes(def.title) ? [] : await this.values(def.title);
      const headers = rows[0] ?? [];
      const map = this.headerMap(def.id, headers);
      const add = def.columns.filter((c) => !map.has(c.key));
      if (add.length) {
        const start = headers.length;
        await this.call(`/values/${range(def.title, `${colLetter(start)}1:${colLetter(start + add.length - 1)}1`)}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [add.map((c) => c.label)] }) });
        add.forEach((c, i) => map.set(c.key, start + i));
        columnsAdded += add.length;
      }
      const idCol = map.get("id")!;
      const updates: Array<{ range: string; values: string[][] }> = [];
      rows.slice(1).forEach((cells, i) => {
        if (cells.some((c) => String(c ?? "").trim()) && !String(cells[idCol] ?? "").trim()) {
          updates.push({ range: `'${def.title.replace(/'/g, "''")}'!${colLetter(idCol)}${i + 2}`, values: [[newId(def.id)]] });
        }
      });
      if (updates.length) {
        await this.call("/values:batchUpdate", { method: "POST", body: JSON.stringify({ valueInputOption: "RAW", data: updates }) });
        idsAssigned += updates.length;
      }
    }
    return { created, columnsAdded, idsAssigned };
  }

  async append(tab: TabId, rec: SheetRecord): Promise<SheetRecord> {
    const def = TABS[tab];
    const rows = await this.values(def.title);
    if (!rows.length) throw new HttpError(409, `The "${def.title}" tab has no header row yet. Click “Prepare spreadsheet” first.`);
    const map = this.headerMap(tab, rows[0]);
    const full: SheetRecord = { ...rec, id: rec.id || newId(tab) };
    const width = Math.max(rows[0].length, ...[...map.values()].map((v) => v + 1));
    const cells = Array.from({ length: width }, () => "");
    for (const [key, idx] of map) cells[idx] = full[key] ?? "";
    await this.call(`/values/${range(def.title, "A1")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: "POST", body: JSON.stringify({ values: [cells] }) });
    return full;
  }

  /** Updates the row whose ID matches — never a bare row number, so edits can't land on the wrong person if rows moved. */
  async update(tab: TabId, id: string, patch: SheetRecord): Promise<SheetRecord> {
    const def = TABS[tab];
    const rows = await this.values(def.title);
    if (!rows.length) throw new HttpError(404, "Row not found");
    const map = this.headerMap(tab, rows[0]);
    const idCol = map.get("id");
    if (idCol === undefined) throw new HttpError(409, `The "${def.title}" tab has no ID column. Click “Prepare spreadsheet” first.`);
    const index = rows.findIndex((r, i) => i > 0 && String(r[idCol] ?? "").trim() === id);
    if (index < 1) throw new HttpError(404, "That row no longer exists in the spreadsheet — reload the list.");
    const current = rows[index];
    const width = Math.max(rows[0].length, current.length);
    const cells = Array.from({ length: width }, (_, i) => String(current[i] ?? ""));
    for (const [key, idx] of map) if (key !== "id" && patch[key] !== undefined) cells[idx] = patch[key];
    await this.call(`/values/${range(def.title, `A${index + 1}:${colLetter(width - 1)}${index + 1}`)}?valueInputOption=RAW`, { method: "PUT", body: JSON.stringify({ values: [cells] }) });
    const out: SheetRecord = {};
    for (const col of def.columns) out[col.key] = map.has(col.key) ? cells[map.get(col.key)!] : "";
    return out;
  }
}

export function newId(tab: TabId): string {
  return `${tab.slice(0, 2)}_${nanoid(10)}`;
}

/** Records (or refreshes) the signed-in person in the Users tab. Never throws — sign-in must not depend on Sheets. */
export async function recordSignIn(user: { email: string; name?: string | null; image?: string | null; isAdmin: boolean }, tokens: UserGoogleTokens | null): Promise<void> {
  if (!sheetsConfigured()) return;
  try {
    const client = await SheetsClient.create(tokens);
    const users = await client.read("users");
    const now = new Date().toISOString();
    const existing = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
    const role = user.isAdmin ? "Admin" : "Member";
    if (existing?.id) await client.update("users", existing.id, { name: user.name ?? existing.name, photo_url: user.image ?? existing.photo_url, role, last_seen: now });
    else if (!existing) await client.append("users", { email: user.email.toLowerCase(), name: user.name ?? "", photo_url: user.image ?? "", role, first_seen: now, last_seen: now });
  } catch (e) {
    console.warn("[sheets] could not record sign-in:", (e as Error).message);
  }
}

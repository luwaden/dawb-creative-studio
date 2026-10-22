import "server-only";
import { TABS, type SheetRecord, type TabId } from "@/lib/sheets/schema";
import { HttpError } from "./auth";

/** Keeps only known columns, trims, enforces lengths and required fields. */
export function cleanRecord(tab: TabId, input: unknown, { partial }: { partial: boolean }): SheetRecord {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new HttpError(400, "Expected an object of column values");
  const src = input as Record<string, unknown>;
  const out: SheetRecord = {};
  for (const col of TABS[tab].columns) {
    if (col.key === "id") continue;
    const v = src[col.key];
    if (v === undefined) {
      if (!partial && col.required) throw new HttpError(400, `${col.label} is required`);
      continue;
    }
    if (typeof v !== "string" && typeof v !== "number") throw new HttpError(400, `${col.label} must be text`);
    const s = String(v).replace(/\r\n/g, "\n").trim();
    if (s.length > col.max) throw new HttpError(400, `${col.label} is too long (max ${col.max} characters)`);
    if (col.required && !s) throw new HttpError(400, `${col.label} is required`);
    out[col.key] = s;
  }
  return out;
}

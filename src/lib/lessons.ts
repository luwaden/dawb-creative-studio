import type { SheetRecord } from "./sheets/schema";

/**
 * Lesson helpers shared by the class carousel (design) and formula explainer (video).
 * A lesson row describes one function or concept, its syntax, arguments and a
 * worked example as a small table ("|" between cells, one row per line).
 */

export interface LessonTable {
  header: string[];
  rows: string[][];
}

export function parseTable(src: string): LessonTable {
  const lines = (src ?? "")
    .split(/\r?\n|;(?=[^|;]*\|)/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 12);
  const cells = lines.map((l) => l.split("|").map((c) => c.trim()).slice(0, 6));
  const header = cells[0] ?? [];
  return { header, rows: cells.slice(1) };
}

export function colIndex(letters: string): number {
  return letters.toUpperCase().split("").reduce((n, ch) => n * 26 + (ch.charCodeAt(0) - 64), 0) - 1;
}

export function colName(i: number): string {
  let s = "";
  let x = i + 1;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

export interface CellRef {
  col: number;
  row: number; // 1-based spreadsheet row
}

/** "B6" → {col: 1, row: 6}. */
export function parseCell(ref: string): CellRef | null {
  const m = /^\s*\$?([A-Za-z]{1,2})\$?(\d{1,3})\s*$/.exec(ref ?? "");
  return m ? { col: colIndex(m[1]), row: Number(m[2]) } : null;
}

/** Every cell referenced by a formula, ranges expanded: "=SUM(B2:B5)" → B2,B3,B4,B5. */
export function referencedCells(formula: string): CellRef[] {
  const out: CellRef[] = [];
  const re = /\$?([A-Z]{1,2})\$?(\d{1,3})(?::\$?([A-Z]{1,2})\$?(\d{1,3}))?/g;
  // Ignore anything inside quotes, e.g. CONCATENATE(A2," ",B2).
  const clean = (formula ?? "").replace(/"[^"]*"/g, '""');
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean))) {
    const c1 = colIndex(m[1]);
    const r1 = Number(m[2]);
    const c2 = m[3] ? colIndex(m[3]) : c1;
    const r2 = m[4] ? Number(m[4]) : r1;
    for (let c = Math.min(c1, c2); c <= Math.max(c1, c2); c++) for (let r = Math.min(r1, r2); r <= Math.max(r1, r2); r++) out.push({ col: c, row: r });
  }
  return out.slice(0, 60);
}

export function lines(v: string | undefined, max = 3): string[] {
  return (v ?? "")
    .split(/\r?\n|•/)
    .map((s) => s.replace(/^[-*\d.)\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, max);
}

/** "number1: first value" lines → [{name, meaning}]. */
export function parseArguments(v: string | undefined): Array<{ name: string; meaning: string }> {
  return lines(v, 4).map((l) => {
    const i = l.indexOf(":");
    return i > 0 ? { name: l.slice(0, i).trim(), meaning: l.slice(i + 1).trim() } : { name: l, meaning: "" };
  });
}

export function isSpreadsheetTool(tool: string | undefined): boolean {
  return /excel|sheets/i.test(tool ?? "");
}

/** Grid model for spreadsheet examples: data, the result cell and highlighted refs. */
export function lessonGrid(rec: SheetRecord) {
  const table = parseTable(rec.example_table);
  const result = parseCell(rec.result_cell);
  const refs = referencedCells(rec.example_formula ?? "");
  const cols = Math.max(table.header.length, result ? result.col + 1 : 0, 1);
  const rowsCount = Math.max(table.rows.length + 1, result ? result.row : 0, 2);
  const cell = (col: number, row: number): string => {
    if (result && col === result.col && row === result.row) return rec.example_result ?? "";
    if (row === 1) return table.header[col] ?? "";
    return table.rows[row - 2]?.[col] ?? "";
  };
  return { table, result, refs, cols, rows: rowsCount, cell, isRef: (c: number, r: number) => refs.some((x) => x.col === c && x.row === r) };
}

/** "Week 6 of 8" / "6/8" → 0.75; null when there's no fraction to show. */
export function progressFraction(v: string | undefined): { value: number; label: string } | null {
  const m = /(\d+)\s*(?:of|\/|out of)\s*(\d+)/i.exec(v ?? "");
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (!b || a > b) return null;
  return { value: a / b, label: m[0] };
}

export function firstName(name: string | undefined): string {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

/** "3470" → "3,470"; leaves text and percentages alone. */
export function fmtCell(v: string | undefined): string {
  const s = (v ?? "").trim();
  return /^-?\d{4,}(\.\d+)?$/.test(s) ? Number(s).toLocaleString("en-US") : s;
}

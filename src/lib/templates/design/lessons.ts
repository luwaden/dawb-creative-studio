import type { DesignElement } from "@/lib/design/types";
import type { SheetRecord } from "@/lib/sheets/schema";
import { colName, fmtCell, isSpreadsheetTool, lessonGrid, lines, parseArguments, parseTable } from "@/lib/lessons";
import { logo, pill, texture, type K, type Pal } from "./kit";
import { defineDataArt, eyebrow, fitSize, pillW } from "./kit2";
import { LESSON_AVERAGE, LESSON_CALCULATE, LESSON_CONCATENATE, LESSON_DIVIDE, LESSON_PBI_MEASURE, LESSON_SUM } from "../records";

/**
 * Class learning carousels — six slides built from one Lessons row:
 * cover → what it does → syntax → worked example → pro tip → recap.
 * A progress thread runs along the bottom of every slide at the same height,
 * so swiping reads as one continuous strip.
 */
const W = 1080;
const H = 1350;
const SLIDES = 6;

type Mode = "light" | "dark";

function toolAccent(tool: string, mode: Mode): string {
  const t = tool.toLowerCase();
  const light = t.includes("excel") ? "#1F8A57" : t.includes("power bi") ? "#B7860B" : t.includes("sql") ? "#3B4FA0" : "#0097B2";
  const dark = t.includes("excel") ? "#45C486" : t.includes("power bi") ? "#E8B53A" : t.includes("sql") ? "#8EA2FF" : "#2FD3EE";
  return mode === "light" ? light : dark;
}

function palFor(mode: Mode, rec: SheetRecord): Pal {
  const acc = toolAccent(rec.tool ?? "", mode);
  return mode === "light"
    ? { paper: "#FFFFFF", surface: "#F2F6F7", ink: "#071C24", muted: "#5B6E75", primary: "#0097B2", accent: acc }
    : { paper: "#071C24", surface: "#0E2A33", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: acc };
}

function chrome(b: K, rec: SheetRecord, mode: Mode, n: number): DesignElement[] {
  const light = mode === "light";
  const fg = light ? "#071C24" : "#FFFFFF";
  const els: DesignElement[] = [
    ...texture(b, W, H, { light, dots: light ? 0.07 : 0.12 }),
    logo(b, light ? "light" : "dark", 60, 46, 96),
    b.text(`${rec.tool || "Class"} · Class notes`, { x: 520, y: 66, w: 496, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "$accent", align: "right", letterSpacing: 2, uppercase: true, label: "Course label", name: "Course label" }),
    b.text("@dawb_learn", { x: 520, y: 96, w: 496, fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: fg, opacity: 0.6, align: "right", name: "Handle" }),
    // Progress thread: same y on every slide, node moves along as you swipe.
    b.shape("line", { x: 0, y: 1270, w: W, h: 0, stroke: fg, strokeWidth: 3, dotted: true, dash: [0.1, 12], fill: "transparent", opacity: 0.28, name: "Progress thread", locked: true }),
    b.rect({ x: 0, y: 1268, w: 64 + ((W - 128) * (n - 1)) / (SLIDES - 1), h: 4, fill: "$accent", name: "Progress fill", locked: true }),
    b.shape("ellipse", { x: 64 + ((W - 128) * (n - 1)) / (SLIDES - 1) - 11, y: 1259, w: 22, h: 22, fill: "$accent", stroke: light ? "#FFFFFF" : "#071C24", strokeWidth: 4, name: "Progress node" }),
    b.text(`${String(n).padStart(2, "0")} / ${String(SLIDES).padStart(2, "0")}`, { x: 64, y: 1290, w: 300, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: fg, opacity: 0.6, name: "Counter" }),
  ];
  if (n < SLIDES) els.push(b.text("Swipe →", { x: 716, y: 1286, w: 300, fontFamily: "Nunito", fontSize: 26, fontWeight: 900, fill: fg, align: "right", name: "Swipe hint" }));
  return els;
}

function heading(b: K, kicker: string, title: string, mode: Mode): DesignElement[] {
  return [
    eyebrow(b, kicker, 64, 190, 952, "$accent", { label: "Slide kicker" }),
    b.text(title, { x: 60, y: 226, w: 960, fontFamily: "Nunito", fontSize: 72, fontWeight: 900, fill: mode === "light" ? "#071C24" : "#FFFFFF", letterSpacing: -1.5, lineHeight: 1.04, label: "Slide title", name: "Slide title" }),
  ];
}

/** Spreadsheet example: formula bar + grid with highlighted references and the result cell. */
function sheetExample(b: K, rec: SheetRecord, x: number, y: number, w: number, mode: Mode): DesignElement[] {
  const light = mode === "light";
  const g = lessonGrid(rec);
  const fg = light ? "#071C24" : "#FFFFFF";
  const line = light ? "#071C24" : "#FFFFFF";
  const els: DesignElement[] = [];
  const barH = 76;
  els.push(b.rect({ x, y, w, h: barH, fill: "$surface", cornerRadius: 18, name: "Formula bar" }));
  els.push(b.text(rec.result_cell?.toUpperCase() || "", { x: x + 20, y, w: 90, h: barH, verticalAlign: "middle", fontFamily: "IBM Plex Mono", fontSize: 24, fontWeight: 500, fill: fg, opacity: 0.6, name: "Name box" }));
  els.push(b.text("fx", { x: x + 100, y, w: 60, h: barH, verticalAlign: "middle", fontFamily: "Fraunces", fontSize: 30, fontWeight: 600, italic: true, fill: "$accent", name: "fx" }));
  els.push(b.text(rec.example_formula, { x: x + 160, y, w: w - 180, h: barH, verticalAlign: "middle", fontFamily: "JetBrains Mono", fontSize: fitSize(rec.example_formula, w - 180, 1, 32, 20, 0.6), fontWeight: 700, fill: fg, label: "Example formula", name: "Example formula" }));
  const gy = y + barH + 24;
  const rowHead = 56;
  const colW = (w - rowHead) / Math.max(2, g.cols);
  const rh = Math.min(84, (560 - 50) / (g.rows + 0));
  // column letters
  for (let c = 0; c < g.cols; c++) els.push(b.text(colName(c), { x: x + rowHead + c * colW, y: gy, w: colW, h: 44, verticalAlign: "middle", align: "center", fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: fg, opacity: 0.45, name: `Col ${colName(c)}` }));
  for (let r = 1; r <= g.rows; r++) {
    const yy = gy + 44 + (r - 1) * rh;
    els.push(b.text(String(r), { x, y: yy, w: rowHead, h: rh, verticalAlign: "middle", align: "center", fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: fg, opacity: 0.45, name: `Row ${r}` }));
    for (let c = 0; c < g.cols; c++) {
      const isResult = g.result && g.result.col === c && g.result.row === r;
      const isRef = g.isRef(c, r);
      const xx = x + rowHead + c * colW;
      els.push(b.rect({ x: xx, y: yy, w: colW, h: rh, fill: isResult ? "$accent" : isRef ? "$accent" : r === 1 ? "$surface" : "transparent", opacity: isResult ? 1 : isRef ? 0.16 : 1, name: "Cell bg" }));
      els.push(b.rect({ x: xx, y: yy, w: colW, h: rh, fill: "transparent", stroke: line, strokeWidth: 1, opacity: 0.16, name: "Cell border" }));
      const v = fmtCell(g.cell(c, r));
      const numeric = /^-?[\d,.]+%?$/.test(v);
      els.push(b.text(v, { x: xx + 14, y: yy, w: colW - 28, h: rh, verticalAlign: "middle", align: numeric && r > 1 ? "right" : "left", fontFamily: r === 1 ? "Nunito Sans" : "IBM Plex Sans", fontSize: Math.min(28, rh * 0.36), fontWeight: r === 1 || isResult ? 800 : 500, fill: isResult ? (light ? "#FFFFFF" : "#071C24") : fg, name: isResult ? "Result cell" : "Cell" }));
    }
  }
  if (g.result) {
    const rx = x + rowHead + g.result.col * colW;
    const ry = gy + 44 + (g.result.row - 1) * rh;
    els.push(b.rect({ x: rx - 3, y: ry - 3, w: colW + 6, h: rh + 6, fill: "transparent", stroke: fg, strokeWidth: 3, cornerRadius: 4, name: "Result outline" }));
  }
  return els;
}

/** Power BI example: data table + DAX bar + KPI card with the result. */
function pbiExample(b: K, rec: SheetRecord, x: number, y: number, w: number, mode: Mode): DesignElement[] {
  const light = mode === "light";
  const fg = light ? "#071C24" : "#FFFFFF";
  const t = parseTable(rec.example_table);
  const els: DesignElement[] = [];
  els.push(b.rect({ x, y, w, h: 96, fill: "$surface", cornerRadius: 18, name: "DAX bar" }));
  els.push(b.text(rec.example_formula, { x: x + 28, y, w: w - 56, h: 96, verticalAlign: "middle", fontFamily: "JetBrains Mono", fontSize: fitSize(rec.example_formula, w - 56, 2, 28, 18, 0.6), fontWeight: 700, fill: fg, lineHeight: 1.3, label: "Example formula", name: "Example formula", multiline: true }));
  const ty = y + 130;
  const tw = w * 0.52;
  const cw = tw / Math.max(1, t.header.length);
  const rh = 66;
  t.header.forEach((h, c) => {
    els.push(b.text(h, { x: x + c * cw + 16, y: ty, w: cw - 24, h: rh, verticalAlign: "middle", fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 800, fill: fg, opacity: 0.7, name: "Header" }));
  });
  els.push(b.rect({ x, y: ty + rh - 2, w: tw, h: 2, fill: fg, opacity: 0.3, name: "Header rule" }));
  t.rows.slice(0, 6).forEach((row, r) => {
    row.forEach((v, c) => {
      const num = /^-?[\d,.]+%?$/.test(v);
      els.push(b.text(fmtCell(v), { x: x + c * cw + 16, y: ty + rh + r * rh, w: cw - 24, h: rh, verticalAlign: "middle", align: num ? "right" : "left", fontFamily: "IBM Plex Sans", fontSize: 24, fontWeight: 500, fill: fg, name: "Cell" }));
    });
    els.push(b.rect({ x, y: ty + rh * (r + 2) - 1, w: tw, h: 1, fill: fg, opacity: 0.12, name: "Row rule" }));
  });
  const kx = x + tw + 40;
  const kw = w - tw - 40;
  const measure = (rec.example_formula.split("=")[0] || rec.function_name).trim();
  els.push(b.rect({ x: kx, y: ty, w: kw, h: 300, fill: "$accent", cornerRadius: 26, name: "KPI card" }));
  els.push(b.text(fmtCell(rec.example_result), { x: kx + 30, y: ty + 70, w: kw - 60, fontFamily: "Manrope", fontSize: fitSize(fmtCell(rec.example_result), kw - 60, 1, 110, 50, 0.6), fontWeight: 800, fill: light ? "#FFFFFF" : "#071C24", label: "Result", name: "Result" }));
  els.push(b.text(measure, { x: kx + 30, y: ty + 210, w: kw - 60, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 800, fill: light ? "#FFFFFF" : "#071C24", opacity: 0.85, label: "Measure name", name: "Measure name" }));
  els.push(b.text("Card visual", { x: kx + 30, y: ty + 30, w: kw - 60, fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 500, fill: light ? "#FFFFFF" : "#071C24", opacity: 0.7, letterSpacing: 2, uppercase: true, name: "Card label" }));
  return els;
}

function carousel(mode: Mode) {
  return (b: K, rec: SheetRecord) => {
    const light = mode === "light";
    const fg = light ? "#071C24" : "#FFFFFF";
    const fn = rec.function_name || "Topic";
    const fnSize = Math.min(300, 952 / (Math.max(3, fn.length) * 0.74));
    const uses = lines(rec.use_when, 3);
    const args = parseArguments(rec.arguments);
    const isSheet = isSpreadsheetTool(rec.tool);
    const bg = light ? "#FFFFFF" : "#071C24";
    const flipAcc = toolAccent(rec.tool ?? "", light ? "dark" : "light");
    return [
      {
        name: "1 · Cover",
        bg,
        els: [
          ...chrome(b, rec, mode, 1),
          ...pill(b, `${rec.tool || "Class"} · Learn it in 6 slides`, 64, 200, { fill: "$accent", color: light ? "#FFFFFF" : "#071C24", size: 22, w: pillW(`${rec.tool || "Class"} · Learn it in 6 slides`, 22), label: "Cover pill" }),
          b.text(fn.toUpperCase(), { x: 52, y: 320, w: 1000, fontFamily: "Nunito", fontSize: fnSize, fontWeight: 900, fill: fg, letterSpacing: -fnSize * 0.03, lineHeight: 1, label: "Function name", name: "Function name" }),
          b.text(rec.topic || "", { x: 64, y: 340 + fnSize * 1.02, w: 952, fontFamily: "Fraunces", fontSize: 60, fontWeight: 400, italic: true, fill: "$accent", lineHeight: 1.1, label: "Topic", name: "Topic" }),
          b.text(rec.what_it_does, { x: 64, y: 470 + fnSize * 1.02, w: 820, fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 600, fill: fg, opacity: 0.8, lineHeight: 1.4, label: "Summary", name: "Summary", multiline: true }),
          b.rect({ x: 64, y: 1010, w: 952, h: 150, fill: "$surface", cornerRadius: 24, name: "Syntax teaser" }),
          b.text(rec.syntax, { x: 100, y: 1010, w: 880, h: 150, verticalAlign: "middle", fontFamily: "JetBrains Mono", fontSize: fitSize(rec.syntax, 880, 2, 36, 22, 0.6), fontWeight: 700, fill: fg, label: "Syntax", name: "Syntax" }),
        ],
      },
      {
        name: "2 · What it does",
        bg,
        els: [
          ...chrome(b, rec, mode, 2),
          ...heading(b, "What it does", fn, mode),
          b.text(rec.what_it_does, { x: 64, y: 340, w: 952, fontFamily: "Nunito", fontSize: fitSize(rec.what_it_does, 952, 5, 52, 34, 0.5), fontWeight: 800, fill: fg, lineHeight: 1.25, label: "What it does", name: "What it does", multiline: true }),
          b.text("USE IT WHEN", { x: 64, y: 760, w: 600, fontFamily: "IBM Plex Mono", fontSize: 22, fontWeight: 500, fill: fg, opacity: 0.6, letterSpacing: 3, name: "Use when title" }),
          ...uses.flatMap((u, i): DesignElement[] => [
            b.rect({ x: 64, y: 812 + i * 120, w: 952, h: 100, fill: "$surface", cornerRadius: 20, name: `Use ${i + 1} card` }),
            b.shape("ellipse", { x: 92, y: 840 + i * 120, w: 44, h: 44, fill: "$accent", name: `Use ${i + 1} tick bg` }),
            b.text("✓", { x: 92, y: 840 + i * 120, w: 44, h: 44, verticalAlign: "middle", align: "center", fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 900, fill: light ? "#FFFFFF" : "#071C24", name: `Use ${i + 1} tick` }),
            b.text(u, { x: 160, y: 812 + i * 120, w: 830, h: 100, verticalAlign: "middle", fontFamily: "Nunito Sans", fontSize: fitSize(u, 830, 2, 30, 22, 0.52), fontWeight: 700, fill: fg, label: `Use case ${i + 1}`, name: `Use case ${i + 1}` }),
          ]),
        ],
      },
      {
        name: "3 · Syntax",
        bg,
        els: [
          ...chrome(b, rec, mode, 3),
          ...heading(b, "The syntax", "How to write it", mode),
          b.rect({ x: 64, y: 360, w: 952, h: 190, fill: light ? "#071C24" : "#0B1D24", cornerRadius: 26, name: "Syntax panel" }),
          b.text("fx", { x: 100, y: 360, w: 70, h: 190, verticalAlign: "middle", fontFamily: "Fraunces", fontSize: 40, fontWeight: 600, italic: true, fill: "$accent", name: "fx" }),
          b.text(rec.syntax, { x: 180, y: 360, w: 800, h: 190, verticalAlign: "middle", fontFamily: "JetBrains Mono", fontSize: fitSize(rec.syntax, 800, 2, 40, 22, 0.6), fontWeight: 700, fill: "#FFFFFF", lineHeight: 1.3, label: "Syntax", name: "Syntax", multiline: true }),
          ...args.flatMap((a, i): DesignElement[] => {
            const y = 610 + i * 150;
            const cw = Math.min(380, a.name.length * 26 * 0.62 + 50);
            return [
              b.rect({ x: 64, y, w: cw, h: 60, fill: "$accent", opacity: light ? 0.14 : 0.2, cornerRadius: 12, name: `Arg ${i + 1} chip` }),
              b.text(a.name, { x: 64, y, w: cw, h: 60, verticalAlign: "middle", align: "center", fontFamily: "JetBrains Mono", fontSize: 26, fontWeight: 700, fill: "$accent", label: `Argument ${i + 1}`, name: `Argument ${i + 1}` }),
              b.text(a.meaning, { x: 64, y: y + 74, w: 952, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 600, fill: fg, opacity: 0.85, lineHeight: 1.3, label: `Argument ${i + 1} meaning`, name: `Argument ${i + 1} meaning` }),
            ];
          }),
          b.rect({ x: 64, y: 1060, w: 952, h: 150, fill: "$surface", cornerRadius: 24, name: "In practice card" }),
          b.text("IN PRACTICE", { x: 100, y: 1084, w: 400, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "$accent", letterSpacing: 3, name: "In practice label" }),
          b.text(`${rec.example_formula}   →   ${fmtCell(rec.example_result)}`, { x: 100, y: 1124, w: 880, fontFamily: "JetBrains Mono", fontSize: fitSize(`${rec.example_formula}   →   ${rec.example_result}`, 880, 2, 32, 20, 0.6), fontWeight: 700, fill: fg, lineHeight: 1.25, label: "In practice", name: "In practice", multiline: true }),
        ],
      },
      {
        name: "4 · Example",
        bg,
        els: [
          ...chrome(b, rec, mode, 4),
          ...heading(b, "Worked example", isSheet ? "Try it on this data" : "See it in a report", mode),
          ...(isSheet ? sheetExample(b, rec, 64, 350, 952, mode) : pbiExample(b, rec, 64, 350, 952, mode)),
          b.rect({ x: 64, y: 1080, w: 952, h: 120, fill: light ? "#071C24" : "#FFFFFF", cornerRadius: 60, name: "Result bar" }),
          b.text("Result", { x: 110, y: 1080, w: 300, h: 120, verticalAlign: "middle", fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 700, fill: light ? "#FFFFFF" : "#071C24", opacity: 0.7, name: "Result label" }),
          b.text(fmtCell(rec.example_result), { x: 400, y: 1080, w: 570, h: 120, verticalAlign: "middle", align: "right", fontFamily: "Manrope", fontSize: 54, fontWeight: 800, fill: light ? "#FFFFFF" : "#071C24", label: "Result value", name: "Result value" }),
        ],
      },
      {
        name: "5 · Pro tip",
        bg: light ? "#071C24" : "#FFFFFF",
        els: [
          ...chrome(b, rec, light ? "dark" : "light", 5),
          b.shape("ellipse", { x: 64, y: 210, w: 150, h: 150, fill: flipAcc, name: "Tip badge" }),
          b.text("!", { x: 64, y: 210, w: 150, h: 150, verticalAlign: "middle", align: "center", fontFamily: "Nunito", fontSize: 100, fontWeight: 900, fill: light ? "#071C24" : "#FFFFFF", name: "Tip mark" }),
          b.text("PRO TIP · COMMON MISTAKE", { x: 250, y: 266, w: 760, fontFamily: "IBM Plex Mono", fontSize: 24, fontWeight: 500, fill: flipAcc, letterSpacing: 3, name: "Tip label" }),
          b.text(rec.tip, { x: 64, y: 440, w: 952, fontFamily: "Nunito", fontSize: fitSize(rec.tip, 952, 8, 64, 36, 0.5), fontWeight: 800, fill: light ? "#FFFFFF" : "#071C24", lineHeight: 1.25, label: "Tip", name: "Tip", multiline: true }),
          b.text(fn.toUpperCase(), { x: 40, y: 1040, w: 1040, fontFamily: "Nunito", fontSize: Math.min(200, fnSize * 0.7), fontWeight: 900, fill: "transparent", stroke: light ? "#FFFFFF" : "#071C24", strokeWidth: 2, opacity: 0.18, letterSpacing: 4, name: "Watermark" }),
        ],
      },
      {
        name: "6 · Recap",
        bg,
        els: [
          ...chrome(b, rec, mode, 6),
          ...heading(b, "Recap", `${fn} in one look`, mode),
          b.rect({ x: 64, y: 360, w: 952, h: 520, fill: "$surface", cornerRadius: 30, name: "Recap card" }),
          b.text(fn.toUpperCase(), { x: 104, y: 400, w: 880, fontFamily: "Nunito", fontSize: Math.min(110, fnSize * 0.5), fontWeight: 900, fill: "$accent", label: "Recap function", name: "Recap function" }),
          b.text(rec.syntax, { x: 104, y: 540, w: 880, fontFamily: "JetBrains Mono", fontSize: fitSize(rec.syntax, 880, 2, 30, 20, 0.6), fontWeight: 700, fill: fg, label: "Recap syntax", name: "Recap syntax" }),
          b.text(rec.what_it_does, { x: 104, y: 640, w: 880, fontFamily: "Nunito Sans", fontSize: fitSize(rec.what_it_does, 880, 4, 30, 22, 0.5), fontWeight: 600, fill: fg, opacity: 0.85, lineHeight: 1.4, label: "Recap summary", name: "Recap summary", multiline: true }),
          ...(rec.next_topic ? pill(b, `Next class: ${rec.next_topic}`, 64, 930, { fill: "$accent", color: light ? "#FFFFFF" : "#071C24", size: 24, w: pillW(`Next class: ${rec.next_topic}`, 24), label: "Next class" }) : []),
          b.text("Save this post · Share it with a classmate", { x: 64, y: 1040, w: 952, fontFamily: "Nunito", fontSize: 40, fontWeight: 900, fill: fg, label: "Call to action", name: "Call to action" }),
          b.text("www.dawblearn.org", { x: 64, y: 1100, w: 952, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 700, fill: "$accent", name: "Website" }),
        ],
      },
    ];
  };
}

function lessonTemplate(id: string, name: string, sample: SheetRecord, mode: Mode, extra: string[]) {
  return defineDataArt({
    id,
    name,
    category: "lessons",
    alsoIn: ["training"],
    format: "ig-portrait",
    dataSource: "lessons",
    style: `${mode === "light" ? "White" : "Night"} · 6-slide carousel · formula bar · worked example · progress thread`,
    tags: ["class", "carousel", "lesson", "tutorial", (sample.tool ?? "").toLowerCase(), (sample.function_name ?? "").toLowerCase(), ...extra],
    description: `Six-slide class carousel: cover, what ${sample.function_name} does, syntax with arguments, a worked example, a pro tip and a recap. Rebuild it from any Lessons row.`,
    pal: (rec) => palFor(mode, rec),
    sample,
    pages: carousel(mode),
  });
}

export const LESSON_CAROUSELS = [
  lessonTemplate("lc-excel-sum", "Class Carousel — Excel SUM", LESSON_SUM, "light", ["formula", "total"]),
  lessonTemplate("lc-excel-average", "Class Carousel — Excel AVERAGE", LESSON_AVERAGE, "dark", ["formula", "mean"]),
  lessonTemplate("lc-excel-concatenate", "Class Carousel — Excel CONCATENATE", LESSON_CONCATENATE, "light", ["text", "join"]),
  lessonTemplate("lc-pbi-measures", "Class Carousel — Power BI Measures", LESSON_PBI_MEASURE, "dark", ["dax", "measure"]),
  lessonTemplate("lc-pbi-calculate", "Class Carousel — Power BI CALCULATE", LESSON_CALCULATE, "light", ["dax", "filter context"]),
  lessonTemplate("lc-pbi-divide", "Class Carousel — Power BI DIVIDE", LESSON_DIVIDE, "dark", ["dax", "ratio"]),
];

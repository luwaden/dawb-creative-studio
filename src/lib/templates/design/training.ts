import type { DesignElement } from "@/lib/design/types";
import { TRAINING_TOOLS, TRAINING_TOOL_IDS, type TrainingTool } from "@/lib/training";
import { defineArt, dottedLine, handles, logo, pill, texture, type K, type Pal } from "./kit";
import { codeBlock, eyebrow } from "./kit2";

/**
 * Training announcements — one flyer per track plus a catalogue.
 * Tool names are used descriptively; illustrations are original (no product logos).
 * Dates, fees and durations are placeholders.
 */
const W = 1080;
const H = 1350;
const ink = "#071C24";

const MODULES: Record<TrainingTool, string[]> = {
  powerbi: ["Power Query", "Data modelling", "DAX measures", "Dashboard design"],
  excel: ["Formulas & lookups", "PivotTables", "Data cleaning", "Charts"],
  sql: ["SELECT & filters", "JOINs", "GROUP BY", "Window functions"],
  spss: ["Data entry & coding", "Descriptives", "t-tests & ANOVA", "Regression"],
  python: ["pandas", "Data cleaning", "Matplotlib", "Notebooks"],
  r: ["tidyverse", "ggplot2", "Statistics", "R Markdown"],
  tableau: ["Connecting data", "Calculated fields", "Dashboards", "Storytelling"],
  writing: ["Structure", "Clarity", "Data stories", "Publishing"],
  research: ["Research questions", "Questionnaires", "Sampling", "Analysis & reporting"],
};

type Tone = "light" | "dark" | "cyan" | "paper";

function toneColors(tone: Tone, accent: string) {
  if (tone === "dark") return { bg: "#071C24", panel: "#0E2A33", fg: "#FFFFFF", muted: "#9FC0C7", acc: accent, logo: "dark" as const };
  if (tone === "cyan") return { bg: "#0097B2", panel: "#FFFFFF", fg: "#FFFFFF", muted: "#D6F3F8", acc: "#071C24", logo: "cyan" as const };
  if (tone === "paper") return { bg: "#F6F1E8", panel: "#FFFDF8", fg: "#1E1A16", muted: "#7A6D5E", acc: accent, logo: "light" as const };
  return { bg: "#FFFFFF", panel: "#F3F7F8", fg: ink, muted: "#5B6E75", acc: accent, logo: "light" as const };
}

/** Original illustration of each discipline, drawn with editable shapes. */
function motif(b: K, tool: TrainingTool, x: number, y: number, w: number, h: number, c: ReturnType<typeof toneColors>, panelInk: string): DesignElement[] {
  const acc = c.acc;
  const els: DesignElement[] = [];
  const code = (lines: Parameters<typeof codeBlock>[1]) => codeBlock(b, lines, x, y, w, { bg: "#0B1D24", ink: "#FFFFFF", accent: tool === "sql" ? "#8EA2FF" : tool === "python" ? "#7FB6FF" : "#7FC4FF", string: "#F2C14E", size: Math.min(28, w / 26), h });
  switch (tool) {
    case "sql":
      return code([[["SELECT ", "k"], ["state,", "t"]], [["       COUNT", "k"], ["(*) ", "t"], ["AS ", "k"], ["applicants", "t"]], [["FROM ", "k"], ["applications", "t"]], [["GROUP BY ", "k"], ["state", "t"]], [["ORDER BY ", "k"], ["applicants ", "t"], ["DESC", "k"], [";", "t"]]]);
    case "python":
      return code([[["import ", "k"], ["pandas ", "t"], ["as ", "k"], ["pd", "t"]], [["", "t"]], [["df = pd.read_csv(", "t"], ["\"survey.csv\"", "s"], [")", "t"]], [["df.groupby(", "t"], ["\"gender\"", "s"], [").size()", "t"]], [["# clean → analyse → share", "c"]]]);
    case "r":
      return code([[["library", "k"], ["(ggplot2)", "t"]], [["", "t"]], [["ggplot", "k"], ["(df, ", "t"], ["aes", "k"], ["(age, score)) +", "t"]], [["  geom_point", "k"], ["() +", "t"]], [["  geom_smooth", "k"], ["()", "t"]]]);
    case "excel": {
      els.push(b.rect({ x, y, w, h, fill: c.panel, cornerRadius: 26, name: "Sheet panel" }));
      els.push(b.text("fx", { x: x + 28, y: y + 26, w: 50, fontFamily: "Fraunces", fontSize: 30, fontWeight: 600, italic: true, fill: acc, name: "fx" }));
      els.push(b.text("=SUM(B2:B6)", { x: x + 84, y: y + 28, w: w - 120, fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 500, fill: panelInk, label: "Formula", name: "Formula" }));
      const cols = ["A", "B", "C", "D"];
      const gx = x + 24;
      const gy = y + 90;
      const cw = (w - 48 - 40) / cols.length;
      const rh = (h - 120) / 7;
      cols.forEach((col, i) => els.push(b.text(col, { x: gx + 40 + i * cw, y: gy, w: cw, h: rh, verticalAlign: "middle", align: "center", fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: panelInk, opacity: 0.45, name: `Col ${col}` })));
      els.push(b.rect({ x: gx + 40 + cw, y: gy + rh * 2, w: cw, h: rh * 5, fill: acc, opacity: 0.16, name: "Selection" }));
      els.push(b.rect({ x: gx + 40 + cw, y: gy + rh * 2, w: cw, h: rh * 5, fill: "transparent", stroke: acc, strokeWidth: 3, name: "Selection border" }));
      const vals = [["Region", "Count", "Share", "Trend"], ["North", "214", "18%", "▲"], ["South", "388", "33%", "▲"], ["East", "197", "17%", "▼"], ["West", "251", "21%", "▲"], ["FCT", "121", "11%", "▲"]];
      vals.forEach((row, r) => {
        els.push(b.text(String(r + 1), { x: gx, y: gy + rh * (r + 1), w: 40, h: rh, verticalAlign: "middle", align: "center", fontFamily: "Nunito Sans", fontSize: 18, fontWeight: 800, fill: panelInk, opacity: 0.45, name: `Row ${r + 1}` }));
        row.forEach((v, ci) => {
          els.push(b.rect({ x: gx + 40 + ci * cw, y: gy + rh * (r + 1), w: cw, h: rh, fill: "transparent", stroke: panelInk, strokeWidth: 1, opacity: 0.14, name: "Cell" }));
          els.push(b.text(v, { x: gx + 40 + ci * cw + 10, y: gy + rh * (r + 1), w: cw - 20, h: rh, verticalAlign: "middle", align: r === 0 || ci === 0 ? "left" : "right", fontFamily: r === 0 ? "Nunito Sans" : "IBM Plex Mono", fontSize: 21, fontWeight: r === 0 ? 800 : 500, fill: panelInk, name: "Cell value" }));
        });
      });
      return els;
    }
    case "powerbi": {
      els.push(b.rect({ x, y, w, h, fill: c.panel, cornerRadius: 26, name: "Dashboard panel" }));
      const pad = 26;
      const tw = (w - pad * 3) / 2;
      [["Applicants", "1,862"], ["Completion", "87%"]].forEach(([k, v], i) => {
        els.push(b.rect({ x: x + pad + i * (tw + pad), y: y + pad, w: tw, h: 110, fill: i ? panelInk : acc, opacity: i ? 0.06 : 0.16, cornerRadius: 16, name: "KPI tile" }));
        els.push(b.text(k.toUpperCase(), { x: x + pad * 2 + i * (tw + pad), y: y + pad + 18, w: tw - pad, fontFamily: "IBM Plex Mono", fontSize: 16, fontWeight: 500, fill: panelInk, opacity: 0.6, letterSpacing: 2, name: "KPI label" }));
        els.push(b.text(v, { x: x + pad * 2 + i * (tw + pad), y: y + pad + 46, w: tw - pad, fontFamily: "Manrope", fontSize: 42, fontWeight: 800, fill: panelInk, name: "KPI value" }));
      });
      els.push(b.chart("bar", { x: x + pad, y: y + 170, w: w * 0.58, h: h - 200, values: [32, 45, 38, 56, 49, 71], labels: [], showLabels: false, showValues: false, color: acc, secondaryColor: panelInk === ink ? "#C9D6DA" : "#2C4A53", labelColor: panelInk, name: "Mini columns" }));
      const ds = Math.min(w * 0.3, h - 200);
      els.push(b.chart("donut", { x: x + w * 0.66 + (w * 0.3 - ds) / 2, y: y + 170, w: ds, h: ds, values: [62, 38], labels: [""], colors: [acc, panelInk === ink ? "#C9D6DA" : "#2C4A53"], showLabels: false, showValues: true, color: acc, secondaryColor: "#C9D6DA", labelColor: panelInk, fontFamily: "Manrope", name: "Mini donut" }));
      return els;
    }
    case "spss": {
      els.push(b.rect({ x, y, w, h, fill: c.panel, cornerRadius: 26, name: "Output panel" }));
      els.push(b.chart("histogram", { x: x + 30, y: y + 90, w: w - 60, h: h - 120, values: [3, 7, 14, 24, 33, 38, 33, 24, 14, 7, 3], labels: [], showLabels: false, showValues: false, color: acc, secondaryColor: acc, labelColor: panelInk, name: "Distribution" }));
      ["Descriptives", "Crosstabs", "Regression"].forEach((t, i) => els.push(...pill(b, t, x + 26 + i * ((w - 52) / 3), y + 24, { fill: "transparent", stroke: panelInk, color: panelInk, size: 16, w: (w - 52) / 3 - 12, label: `Method ${i + 1}` })));
      return els;
    }
    case "tableau": {
      els.push(b.rect({ x, y, w, h, fill: c.panel, cornerRadius: 26, name: "Viz panel" }));
      const tiles = [[0, 0, 0.58, 0.6, 1], [0.6, 0, 0.4, 0.34, 0.7], [0.6, 0.36, 0.4, 0.24, 0.4], [0, 0.62, 0.32, 0.38, 0.55], [0.34, 0.62, 0.3, 0.38, 0.25], [0.66, 0.62, 0.34, 0.38, 0.85]];
      const p = 24;
      tiles.forEach(([tx, ty, tw, th, o], i) => els.push(b.rect({ x: x + p + tx * (w - p * 2), y: y + p + ty * (h - p * 2), w: tw * (w - p * 2) - 8, h: th * (h - p * 2) - 8, fill: i % 3 === 2 ? panelInk : acc, opacity: o, cornerRadius: 14, name: "Mosaic tile" })));
      return els;
    }
    case "writing": {
      els.push(b.rect({ x, y, w, h, fill: "#FFFFFF", cornerRadius: 10, stroke: "#1E1A16", strokeWidth: 2, name: "Page" }));
      els.push(b.text("Writing that\ngets read.", { x: x + 40, y: y + 36, w: w - 80, fontFamily: "Fraunces", fontSize: 54, fontWeight: 600, fill: "#1E1A16", lineHeight: 1.05, name: "Page heading" }));
      [0.92, 0.98, 0.86, 0.94, 0.6, 0, 0.96, 0.9, 0.72].forEach((lw, i) => {
        if (lw) els.push(b.rect({ x: x + 40, y: y + 200 + i * 30, w: (w - 80) * lw, h: 10, fill: i === 0 ? acc : "#1E1A16", opacity: i === 0 ? 1 : 0.14, cornerRadius: 5, name: "Text line" }));
      });
      els.push(b.rect({ x: x + 40 + (w - 80) * 0.72 + 8, y: y + 200 + 8 * 30 - 8, w: 6, h: 26, fill: acc, name: "Cursor" }));
      return els;
    }
    case "research":
    default: {
      els.push(b.rect({ x, y, w, h, fill: c.panel, cornerRadius: 26, name: "Checklist panel" }));
      ["Define the question", "Design the questionnaire", "Collect & clean data", "Analyse & report"].forEach((t, i) => {
        const yy = y + 40 + i * ((h - 80) / 4);
        const done = i < 3;
        els.push(b.rect({ x: x + 34, y: yy, w: 46, h: 46, fill: done ? acc === "#071C24" ? ink : acc : "transparent", stroke: done ? "transparent" : panelInk, strokeWidth: 3, cornerRadius: 12, name: "Checkbox" }));
        if (done) els.push(b.text("✓", { x: x + 34, y: yy, w: 46, h: 46, verticalAlign: "middle", align: "center", fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 900, fill: "#FFFFFF", name: "Tick" }));
        els.push(b.text(t, { x: x + 104, y: yy, w: w - 130, h: 46, verticalAlign: "middle", fontFamily: "Nunito Sans", fontSize: Math.min(30, w / 18), fontWeight: 800, fill: panelInk, label: `Step ${i + 1}`, name: `Step ${i + 1}` }));
      });
      return els;
    }
  }
}

function infoRow(b: K, y: number, c: ReturnType<typeof toneColors>, items: Array<[string, string]>): DesignElement[] {
  const colW = 952 / items.length;
  return items.flatMap(([k, v], i): DesignElement[] => [
    b.text(k.toUpperCase(), { x: 64 + i * colW, y, w: colW - 20, fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 500, fill: c.muted, letterSpacing: 3, label: `${k} label`, name: `${k} label` }),
    b.text(v, { x: 64 + i * colW, y: y + 30, w: colW - 20, fontFamily: "Nunito", fontSize: 32, fontWeight: 900, fill: c.fg, label: k, name: k }),
    ...(i < items.length - 1 ? [b.rect({ x: 64 + (i + 1) * colW - 14, y: y + 4, w: 1.5, h: 66, fill: c.fg, opacity: 0.15, name: "Divider" })] : []),
  ]);
}

const INFO: Array<[string, string]> = [["Starts", "00 Month"], ["Duration", "6 weeks"], ["Mode", "Online"], ["Fee", "₦00,000"]];

function trainingFlyer(tool: TrainingTool, tone: Tone, layout: "split" | "stack" | "poster") {
  const t = TRAINING_TOOLS[tool];
  const c = toneColors(tone, t.accent);
  const pal: Pal = { paper: c.bg, surface: c.panel, ink: c.fg, muted: c.muted, primary: "#0097B2", accent: c.acc };
  const light = tone === "light" || tone === "paper";
  const headFont = tool === "writing" ? "Fraunces" : layout === "poster" ? "Nunito" : "Plus Jakarta Sans";
  const nameSize = layout === "poster" ? Math.min(230, 1350 / Math.max(3, t.name.length)) : Math.min(170, 1900 / Math.max(3, t.name.length));
  return defineArt({
    id: `tr-${tool}`,
    name: `Training — ${t.name}`,
    category: "training",
    format: "ig-portrait",
    style: `${tone === "light" ? "White" : tone === "dark" ? "Dark" : tone === "cyan" ? "DAWB cyan" : "Warm paper"} · ${layout} layout · original ${t.motif} illustration`,
    tags: ["training", "course", "cohort", t.name.toLowerCase(), "register", "class"],
    description: `${t.name} training announcement: ${t.blurb} Modules, start date, duration, mode, fee and a registration call to action.`,
    pal,
    pages: (b) => {
      const panelInk = tone === "cyan" ? ink : c.fg;
      const head: DesignElement[] = [
        ...texture(b, W, H, { light, dots: light ? 0.08 : 0.13, grain: tone === "paper" ? 1.6 : undefined, contours: layout === "poster" ? (light ? "#0097B2" : c.acc) : undefined, glow: layout === "split" && !light ? { color: c.acc, x: 900, y: 700, size: 900, opacity: 0.2 } : undefined }),
        logo(b, c.logo, 60, 46, 110),
        ...handles(b, 560, 64, 460, c.fg),
      ];
      const reg: DesignElement[] = [
        b.rect({ x: 64, y: 1190, w: 952, h: 100, fill: tone === "cyan" ? ink : light ? ink : "#0097B2", cornerRadius: 50, name: "CTA bar" }),
        b.text("Register now", { x: 110, y: 1190, w: 500, h: 100, verticalAlign: "middle", fontFamily: "Nunito", fontSize: 36, fontWeight: 900, fill: "#FFFFFF", label: "Call to action", name: "Call to action" }),
        b.text("www.dawblearn.org →", { x: 500, y: 1190, w: 470, h: 100, verticalAlign: "middle", align: "right", fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 800, fill: "#FFFFFF", label: "Registration link", name: "Registration link" }),
      ];
      // Module chips wrap onto a second row when needed (each row is 56px).
      const chips = (y: number, maxW = 952) => {
        let cx = 64;
        let cy = y;
        return MODULES[tool].flatMap((m, i) => {
          const wpx = Math.round(m.length * 18 * 0.8 + 18 * 2.4);
          if (cx + wpx > 64 + maxW) { cx = 64; cy += 56; }
          const out = pill(b, m, cx, cy, { fill: "transparent", stroke: c.fg, color: c.fg, size: 18, w: wpx, label: `Module ${i + 1}` });
          cx += wpx + 10;
          return out;
        });
      };
      if (layout === "split") {
        return [{ name: "Flyer", els: [
          ...head,
          ...pill(b, "New cohort · Training", 64, 200, { fill: c.acc === "#071C24" ? ink : c.acc, color: "#FFFFFF", size: 22 }),
          b.text(t.name, { x: 58, y: 262, w: 980, fontFamily: headFont, fontSize: nameSize, fontWeight: 800, fill: c.fg, letterSpacing: -nameSize * 0.03, lineHeight: 1, label: "Track name", name: "Track name" }),
          b.text(t.blurb, { x: 64, y: 290 + nameSize * 1.05, w: 900, fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 600, fill: c.fg, opacity: 0.8, lineHeight: 1.35, label: "Description", name: "Description", multiline: true }),
          ...motif(b, tool, 64, 560, 952, 360, c, panelInk),
          ...chips(950),
          ...infoRow(b, 1090, c, INFO),
          ...reg,
        ] }];
      }
      if (layout === "stack") {
        return [{ name: "Flyer", els: [
          ...head,
          eyebrow(b, "DAWB Training · Cohort 00", 64, 204, 520, tone === "dark" ? c.muted : c.acc === "#071C24" ? ink : c.acc, { label: "Eyebrow" }),
          b.text(`Learn\n${t.name}`, { x: 58, y: 244, w: 560, fontFamily: headFont, fontSize: Math.min(110, nameSize), fontWeight: 800, fill: c.fg, lineHeight: 1.0, letterSpacing: -2, label: "Headline", name: "Headline", multiline: true }),
          ...motif(b, tool, 600, 220, 416, 420, c, panelInk),
          b.text(t.blurb, { x: 64, y: 690, w: 952, fontFamily: "Nunito Sans", fontSize: 34, fontWeight: 600, fill: c.fg, lineHeight: 1.35, label: "Description", name: "Description", multiline: true }),
          dottedLine(b, 64, 830, 952, c.fg, { dot: 3, gap: 11, opacity: 0.35 }),
          b.text("WHAT YOU'LL LEARN", { x: 64, y: 860, w: 600, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: c.muted, letterSpacing: 3, name: "Modules title" }),
          ...chips(900),
          ...infoRow(b, 1060, c, INFO),
          ...reg,
        ] }];
      }
      // poster
      return [{ name: "Flyer", els: [
        ...head,
        ...pill(b, "Now enrolling", 64, 200, { fill: tone === "cyan" ? ink : "#0097B2", color: "#FFFFFF", dot: "#FFFFFF", size: 22 }),
        b.text(t.name.toUpperCase(), { x: 52, y: 250, w: 1000, fontFamily: "Nunito", fontSize: nameSize, fontWeight: 900, fill: "transparent", stroke: c.fg, strokeWidth: 3, letterSpacing: 2, lineHeight: 0.95, label: "Track name (outline)", name: "Track name outline" }),
        b.text("TRAINING", { x: 56, y: 250 + nameSize * 0.95, w: 1000, fontFamily: "Nunito", fontSize: 120, fontWeight: 900, fill: tone === "cyan" ? ink : c.acc, letterSpacing: 4, label: "Headline", name: "Headline" }),
        ...motif(b, tool, 64, 636, 952, 330, c, panelInk),
        ...chips(990),
        ...infoRow(b, 1106, c, INFO),
        ...reg,
      ] }];
    },
  });
}

const PLAN: Array<[TrainingTool, Tone, "split" | "stack" | "poster"]> = [
  ["powerbi", "dark", "split"],
  ["excel", "light", "split"],
  ["sql", "dark", "stack"],
  ["spss", "paper", "split"],
  ["python", "cyan", "stack"],
  ["r", "light", "stack"],
  ["tableau", "dark", "poster"],
  ["writing", "paper", "stack"],
  ["research", "cyan", "poster"],
];

export const TRAINING_FLYERS = PLAN.map(([tool, tone, layout]) => trainingFlyer(tool, tone, layout));

export const trainingCatalogue = defineArt({
  id: "tr-catalogue",
  name: "Training — All Tracks (Catalogue)",
  category: "training",
  format: "ig-portrait",
  style: "White · 3×3 track grid · colour keys",
  tags: ["training", "catalogue", "courses", "tracks", "all programmes"],
  description: "All nine training tracks on one flyer — Power BI, Excel, SQL, SPSS, Python, R, Tableau, Article Writing and Research Methods.",
  pal: { paper: "#FFFFFF", surface: "#F3F7F8", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => {
    const gap = 18;
    const cw = (952 - gap * 2) / 3;
    const ch = 250;
    return [{ name: "Flyer", els: [
      ...texture(b, W, H, { light: true, dots: 0.08 }),
      logo(b, "light", 60, 46, 110),
      ...handles(b, 560, 64, 460, "$ink"),
      eyebrow(b, "DAWB Training · 2026", 64, 200, 952, "$primary"),
      b.text("Pick your track.", { x: 60, y: 236, w: 960, fontFamily: "Plus Jakarta Sans", fontSize: 96, fontWeight: 800, fill: "$ink", letterSpacing: -3, label: "Headline", name: "Headline" }),
      ...TRAINING_TOOL_IDS.flatMap((id, i): DesignElement[] => {
        const t = TRAINING_TOOLS[id];
        const x = 64 + (i % 3) * (cw + gap);
        const y = 380 + Math.floor(i / 3) * (ch + gap);
        return [
          b.rect({ x, y, w: cw, h: ch, fill: "$surface", cornerRadius: 24, name: `${t.name} card` }),
          b.rect({ x: x + 24, y: y + 26, w: 44, h: 8, fill: t.accent, cornerRadius: 4, name: `${t.name} key` }),
          b.text(`0${i + 1}`, { x: x + cw - 80, y: y + 18, w: 56, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "$muted", align: "right", name: "Index" }),
          b.text(t.name, { x: x + 24, y: y + 58, w: cw - 48, fontFamily: "Plus Jakarta Sans", fontSize: t.name.length > 12 ? 34 : 42, fontWeight: 800, fill: "$ink", lineHeight: 1.05, label: `Track ${i + 1}`, name: `Track ${i + 1}`, multiline: true }),
          b.text(t.blurb, { x: x + 24, y: y + 150, w: cw - 48, fontFamily: "Nunito Sans", fontSize: 19, fontWeight: 600, fill: "$muted", lineHeight: 1.3, label: `Track ${i + 1} summary`, name: `Track ${i + 1} summary`, multiline: true }),
        ];
      }),
      b.rect({ x: 64, y: 1190, w: 952, h: 100, fill: "$ink", cornerRadius: 50, name: "CTA bar" }),
      b.text("Applications open · 00 Month", { x: 110, y: 1190, w: 560, h: 100, verticalAlign: "middle", fontFamily: "Nunito", fontSize: 32, fontWeight: 900, fill: "#FFFFFF", label: "Call to action", name: "Call to action" }),
      b.text("www.dawblearn.org →", { x: 560, y: 1190, w: 410, h: 100, verticalAlign: "middle", align: "right", fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 800, fill: "#FFFFFF", label: "Registration link", name: "Registration link" }),
    ] }];
  },
});

export const TRAINING = [trainingCatalogue, ...TRAINING_FLYERS];

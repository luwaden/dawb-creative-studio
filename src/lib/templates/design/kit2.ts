import type { DesignElement } from "@/lib/design/types";
import type { K } from "./kit";

/**
 * Helpers for the research, data and training templates.
 * Default QR value is the DAWB website (a working, safe link) — the Quick-edit
 * field "Questionnaire link" replaces it with the real form URL.
 */
export const DEFAULT_QR = "https://www.dawblearn.org";
export const FORM_TEXT = "[your form link]";

/** QR on a white card with animated-looking corner brackets. */
export function qrCard(b: K, x: number, y: number, size: number, o: { bracket: string; card?: string; pad?: number; label?: string; radius?: number }): DesignElement[] {
  const pad = o.pad ?? size * 0.08;
  const total = size + pad * 2;
  const L = total * 0.2;
  const t = Math.max(6, total * 0.022);
  const off = t * 1.6;
  const els: DesignElement[] = [
    b.rect({ x, y, w: total, h: total, fill: o.card ?? "#FFFFFF", cornerRadius: o.radius ?? total * 0.08, name: "QR card" }),
    b.qr(DEFAULT_QR, { x: x + pad, y: y + pad, w: size, h: size, label: o.label ?? "Questionnaire link", name: "QR code", margin: 1 }),
  ];
  const corners: Array<[number, number, number, number]> = [
    [x - off, y - off, 1, 1],
    [x + total + off, y - off, -1, 1],
    [x - off, y + total + off, 1, -1],
    [x + total + off, y + total + off, -1, -1],
  ];
  corners.forEach(([cx, cy, sx, sy], i) => {
    els.push(
      b.rect({ x: sx > 0 ? cx : cx - L, y: sy > 0 ? cy : cy - t, w: L, h: t, fill: o.bracket, cornerRadius: t / 2, name: `Scan bracket ${i + 1}` }),
      b.rect({ x: sx > 0 ? cx : cx - t, y: sy > 0 ? cy : cy - L, w: t, h: L, fill: o.bracket, cornerRadius: t / 2, name: `Scan bracket ${i + 1}` }),
    );
  });
  return els;
}

/** Map-pin glyph built from shapes (no icon font needed). */
export function pin(b: K, x: number, y: number, size: number, color: string): DesignElement[] {
  return [
    b.shape("triangle", { x: x + size * 0.18, y: y + size * 0.45, w: size * 0.64, h: size * 0.55, fill: color, rotation: 0, name: "Pin tip" }),
    b.shape("ellipse", { x, y, w: size, h: size, fill: color, name: "Pin" }),
    b.shape("ellipse", { x: x + size * 0.32, y: y + size * 0.32, w: size * 0.36, h: size * 0.36, fill: "#FFFFFF", name: "Pin hole" }),
  ];
}

export interface Member {
  name: string;
  role: string;
  location: string;
}

export const SAMPLE_MEMBERS: Member[] = [
  { name: "Member Name", role: "Lead Researcher", location: "Lagos, Nigeria" },
  { name: "Member Name", role: "Data Analyst", location: "Abuja, Nigeria" },
  { name: "Member Name", role: "Statistician", location: "Ibadan, Nigeria" },
  { name: "Member Name", role: "Field Coordinator", location: "Kano, Nigeria" },
  { name: "Member Name", role: "Research Assistant", location: "Enugu, Nigeria" },
  { name: "Member Name", role: "Data Visualisation", location: "Port Harcourt, Nigeria" },
];

/** Team member card: circular photo, name, profession, location. */
export function memberCard(b: K, m: Member, i: number, x: number, y: number, w: number, o: { ink: string; muted: string; accent: string; card?: string; stroke?: string; photo?: number; font?: string }): DesignElement[] {
  const ph = o.photo ?? w * 0.5;
  const els: DesignElement[] = [];
  const pad = w * 0.09;
  const h = ph + 230;
  if (o.card) els.push(b.rect({ x, y, w, h, fill: o.card, stroke: o.stroke ?? "transparent", strokeWidth: o.stroke ? 2 : 0, cornerRadius: 26, name: `Card ${i + 1}` }));
  els.push(
    b.shape("ellipse", { x: x + pad - 10, y: y + pad - 10, w: ph + 20, h: ph + 20, fill: "transparent", stroke: o.accent, strokeWidth: 4, dotted: true, dash: [0.1, 11], opacity: 0.8, name: "Photo ring" }),
    b.image({ x: x + pad, y: y + pad, w: ph, h: ph, circle: true, placeholderFill: "$surface", hint: "Team member photo", label: `Member ${i + 1} photo`, name: `Member ${i + 1} photo` }),
    b.text(m.name, { x: x + pad, y: y + pad + ph + 26, w: w - pad * 2, fontFamily: o.font ?? "Nunito", fontSize: 34, fontWeight: 900, fill: o.ink, label: `Member ${i + 1} name`, name: `Member ${i + 1} name` }),
    b.text(m.role, { x: x + pad, y: y + pad + ph + 70, w: w - pad * 2, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 700, fill: o.ink, opacity: 0.85, label: `Member ${i + 1} profession`, name: `Member ${i + 1} profession` }),
    ...pin(b, x + pad, y + pad + ph + 116, 22, o.accent),
    b.text(m.location, { x: x + pad + 32, y: y + pad + ph + 111, w: w - pad * 2 - 32, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 700, fill: o.muted, label: `Member ${i + 1} location`, name: `Member ${i + 1} location` }),
  );
  return els;
}

/** Code panel with keyword highlighting (each line is one text element). */
export function codeBlock(b: K, lines: Array<Array<[string, "k" | "t" | "s" | "c"]>>, x: number, y: number, w: number, o: { bg: string; ink: string; accent: string; string?: string; size?: number; h?: number }): DesignElement[] {
  const fs = o.size ?? 26;
  const lh = fs * 1.7;
  const h = o.h ?? lines.length * lh + 120;
  const els: DesignElement[] = [b.rect({ x, y, w, h, fill: o.bg, cornerRadius: 26, name: "Code panel" })];
  [0, 1, 2].forEach((i) => els.push(b.shape("ellipse", { x: x + 30 + i * 26, y: y + 26, w: 14, h: 14, fill: o.ink, opacity: 0.2, name: "Window dot" })));
  const charW = fs * 0.6;
  lines.forEach((tokens, li) => {
    let cx = x + 34;
    tokens.forEach(([txt, kind], ti) => {
      const color = kind === "k" ? o.accent : kind === "s" ? o.string ?? o.accent : kind === "c" ? o.ink : o.ink;
      els.push(b.text(txt, { x: cx, y: y + 70 + li * lh, w: txt.length * charW + 4, fontFamily: "JetBrains Mono", fontSize: fs, fontWeight: kind === "k" ? 700 : 400, fill: color, opacity: kind === "c" ? 0.45 : 1, name: `Code ${li + 1}.${ti + 1}` }));
      cx += txt.length * charW;
    });
  });
  return els;
}

export function sampleNote(b: K, x: number, y: number, w: number, color: string, text = "Sample data for layout — replace with your figures and cite the source.", align: "left" | "right" | "center" = "left"): DesignElement {
  return b.text(text, { x, y, w, fontFamily: "IBM Plex Sans", fontSize: 20, fontWeight: 500, fill: color, opacity: 0.7, align, label: "Data note / source", name: "Data note" });
}

export function eyebrow(b: K, text: string, x: number, y: number, w: number, color: string, o: { font?: string; size?: number; label?: string } = {}): DesignElement {
  return b.text(text, { x, y, w, fontFamily: o.font ?? "IBM Plex Mono", fontSize: o.size ?? 22, fontWeight: 500, fill: color, letterSpacing: 3, uppercase: true, label: o.label ?? "Eyebrow", name: o.label ?? "Eyebrow" });
}

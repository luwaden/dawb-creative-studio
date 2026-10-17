import { createBuilder, doc, page } from "@/lib/design/build";
import type { DesignElement } from "@/lib/design/types";
import type { CategoryId, DesignTemplate, FormatId } from "../types";
import { DESIGN_FORMATS } from "../types";
import { HANDLES } from "./common";

export type K = ReturnType<typeof createBuilder>;

/** Palette for an art-directed template. Keys double as Quick-edit colour swatches. */
export interface Pal {
  paper: string;
  surface: string;
  ink: string;
  muted: string;
  primary: string;
  accent: string;
}

const LABELS = { paper: "Background", surface: "Panels", ink: "Main text", muted: "Secondary text", primary: "DAWB teal", accent: "Accent" };

export function defineArt(meta: Omit<DesignTemplate, "kind" | "build" | "phase" | "post"> & { pal: Pal; pages: (b: K) => Array<{ name: string; bg?: string; els: DesignElement[] }> }): DesignTemplate {
  const { pal, pages, ...rest } = meta;
  const f = DESIGN_FORMATS[meta.format as FormatId];
  return {
    ...rest,
    kind: "design",
    phase: null,
    post: null,
    build: () => {
      const b = createBuilder(`${meta.id.slice(0, 12)}-`);
      return doc(f.width, f.height, { palette: { ...pal }, paletteLabels: LABELS }, pages(b).map((p) => page(p.bg ?? "$paper", p.els, { name: p.name })));
    },
  };
}

const lock = { locked: true } as const;

/** Layered surface texture: grain + dot grid (+ optional contours/halftone/orbits/glow). */
export function texture(b: K, W: number, H: number, o: { light: boolean; grain?: number; dots?: number; contours?: string; halftone?: string; glow?: { color: string; x: number; y: number; size: number; opacity: number }; orbits?: { color: string; x: number; y: number; r: number[] } }): DesignElement[] {
  const ink = o.light ? "#071C24" : "#FFFFFF";
  const els: DesignElement[] = [];
  if (o.glow) els.push(b.rect({ x: o.glow.x - o.glow.size / 2, y: o.glow.y - o.glow.size / 2, w: o.glow.size, h: o.glow.size, fill: o.glow.color, fade: "radial", opacity: o.glow.opacity, name: "Glow", ...lock }));
  if (o.contours) els.push(b.pattern("contours", { x: 0, y: 0, w: W, h: H, color: o.contours, spacing: 46, size: 1.6, opacity: 0.22, name: "Contour lines", ...lock }));
  if (o.halftone) els.push(b.pattern("halftone", { x: W * 0.35, y: 0, w: W * 0.65, h: H * 0.55, color: o.halftone, spacing: 26, size: 4.2, opacity: 0.35, name: "Halftone", ...lock }));
  if (o.dots !== 0) els.push(b.pattern("dotgrid", { x: 0, y: 0, w: W, h: H, color: ink, spacing: 36, size: 1.3, opacity: o.dots ?? 0.12, name: "Dot grid", ...lock }));
  if (o.orbits) {
    o.orbits.r.forEach((r, i) => els.push(b.shape("ellipse", { x: o.orbits!.x - r, y: o.orbits!.y - r, w: r * 2, h: r * 2, fill: "transparent", stroke: i === 1 ? o.orbits!.color : ink, strokeWidth: i === 1 ? 4 : 2.5, dotted: true, dash: [0.1, i === 1 ? 16 : 12], opacity: i === 1 ? 0.6 : 0.22, name: "Dotted orbit", ...lock })));
  }
  els.push(b.pattern("noise", { x: 0, y: 0, w: W, h: H, color: o.light ? "#000000" : "#FFFFFF", spacing: 40, size: o.grain ?? (o.light ? 1.3 : 1.8), opacity: 0.7, name: "Film grain", ...lock }));
  return els;
}

/** Official logo file. On colours other than black/white/cyan it sits on its own badge. */
export function logo(b: K, variant: "dark" | "light" | "cyan", x: number, y: number, size = 120): DesignElement {
  return b.logo(variant, { x, y, w: size, name: "Logo" });
}

export function badgeLogo(b: K, x: number, y: number, size = 120, variant: "light" | "dark" = "light"): DesignElement[] {
  return [
    b.rect({ x, y, w: size, h: size, fill: variant === "light" ? "#FFFFFF" : "#000000", cornerRadius: size * 0.22, name: "Logo badge" }),
    { ...b.logo(variant, { x: x + size * 0.04, y: y + size * 0.04, w: size * 0.92, name: "Logo" }) },
  ];
}

export function handles(b: K, x: number, y: number, w: number, color: string, align: "left" | "right" | "center" = "right", size = 22): DesignElement[] {
  return [
    b.text(`${HANDLES.social}  ·  ${HANDLES.pro}`, { x, y, w, fontFamily: "Nunito Sans", fontSize: size, fontWeight: 800, fill: color, align, name: "Handles", label: "Social handles" }),
    b.text(HANDLES.website, { x, y: y + size * 1.45, w, fontFamily: "Nunito Sans", fontSize: size * 0.9, fontWeight: 600, fill: color, opacity: 0.75, align, letterSpacing: 1.5, name: "Website" }),
  ];
}

export function pill(b: K, text: string, x: number, y: number, o: { fill: string; color: string; size?: number; w?: number; label?: string; dot?: string; stroke?: string }): DesignElement[] {
  const fs = o.size ?? 24;
  const h = fs * 2.1;
  const w = o.w ?? Math.round(text.length * fs * 0.68 + fs * 2.6 + (o.dot ? fs : 0));
  const els: DesignElement[] = [b.rect({ x, y, w, h, fill: o.fill, cornerRadius: h / 2, stroke: o.stroke ?? "transparent", strokeWidth: o.stroke ? 2 : 0, name: "Pill" })];
  if (o.dot) els.push(b.shape("ellipse", { x: x + fs * 1.1, y: y + h / 2 - fs * 0.3, w: fs * 0.6, h: fs * 0.6, fill: o.dot, name: "Pill dot" }));
  els.push(b.text(text, { x: x + (o.dot ? fs * 1.4 : 0), y, w: w - (o.dot ? fs * 1.4 : 0), h, verticalAlign: "middle", fontFamily: "Nunito Sans", fontSize: fs, fontWeight: 900, fill: o.color, align: "center", letterSpacing: fs * 0.12, uppercase: true, label: o.label ?? "Label", name: o.label ?? "Label" }));
  return els;
}

/** Scatter of celebration shapes (deterministic). */
export function confetti(b: K, W: number, H: number, colors: string[], count = 34, seed = 3, area?: { x: number; y: number; w: number; h: number }): DesignElement[] {
  let s = seed * 7919;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  const a = area ?? { x: 0, y: 0, w: W, h: H };
  const out: DesignElement[] = [];
  for (let i = 0; i < count; i++) {
    const kind = i % 4;
    const size = 14 + r() * 26;
    const x = a.x + r() * a.w;
    const y = a.y + r() * a.h;
    const fill = colors[i % colors.length];
    if (kind === 0) out.push(b.rect({ x, y, w: size * 0.5, h: size * 1.4, fill, cornerRadius: 3, rotation: r() * 180, name: "Confetti" }));
    else if (kind === 1) out.push(b.shape("ellipse", { x, y, w: size * 0.7, h: size * 0.7, fill, name: "Confetti" }));
    else if (kind === 2) out.push(b.shape("triangle", { x, y, w: size, h: size * 0.9, fill, rotation: r() * 180, name: "Confetti" }));
    else out.push(b.shape("star", { x, y, w: size * 1.2, h: size * 1.2, fill, points: 4, innerRatio: 0.32, rotation: r() * 45, name: "Sparkle" }));
  }
  return out;
}

export function sparkle(b: K, x: number, y: number, size: number, fill: string, rotation = 0): DesignElement {
  return b.shape("star", { x: x - size / 2, y: y - size / 2, w: size, h: size, fill, points: 4, innerRatio: 0.28, rotation, name: "Sparkle" });
}

export function dottedLine(b: K, x: number, y: number, w: number, color: string, o: { rotation?: number; gap?: number; dot?: number; opacity?: number } = {}): DesignElement {
  return b.shape("line", { x, y, w, h: 0, rotation: o.rotation ?? 0, stroke: color, strokeWidth: o.dot ?? 4, dotted: true, dash: [0.1, o.gap ?? 14], fill: "transparent", opacity: o.opacity ?? 0.7, name: "Dotted line" });
}

export function dottedRing(b: K, cx: number, cy: number, r: number, color: string, o: { dot?: number; gap?: number; opacity?: number } = {}): DesignElement {
  return b.shape("ellipse", { x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill: "transparent", stroke: color, strokeWidth: o.dot ?? 4, dotted: true, dash: [0.1, o.gap ?? 16], opacity: o.opacity ?? 0.6, name: "Dotted ring" });
}

/** Info row: icon-ish dot + label + value, separated by dotted rules. */
export function infoRows(b: K, x: number, y: number, w: number, rows: Array<[string, string]>, o: { ink: string; muted: string; accent: string; size?: number; gap?: number }): DesignElement[] {
  const fs = o.size ?? 34;
  const gap = o.gap ?? fs * 2.6;
  const els: DesignElement[] = [];
  rows.forEach(([k, v], i) => {
    const yy = y + i * gap;
    els.push(
      b.text(k, { x, y: yy, w: w * 0.32, fontFamily: "Nunito Sans", fontSize: fs * 0.55, fontWeight: 800, fill: o.muted, letterSpacing: 3, uppercase: true, label: `${k} label`, name: `${k} label` }),
      b.text(v, { x: x + w * 0.32, y: yy - fs * 0.2, w: w * 0.68, fontFamily: "Nunito", fontSize: fs, fontWeight: 900, fill: o.ink, label: k, name: k }),
    );
    if (i < rows.length - 1) els.push(dottedLine(b, x, yy + gap * 0.62, w, o.accent, { dot: 3, gap: 10, opacity: 0.5 }));
  });
  return els;
}

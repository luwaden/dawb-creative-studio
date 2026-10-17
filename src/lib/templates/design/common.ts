import { createBuilder } from "@/lib/design/build";
import type { DesignElement } from "@/lib/design/types";

export type B = ReturnType<typeof createBuilder>;

/** Campaign design system colours (DAWB Full Campaign, May–Aug 2025). */
export const C = {
  teal: "#0097B2",
  deepTeal: "#006070",
  deepTeal2: "#004F60",
  nearBlack: "#0D1F26",
  midnight: "#1A3A47",
  offWhite: "#F2F9FB",
  lightTeal: "#E0F5F9",
  amber: "#D9A04A",
  ochre: "#B9772F",
  espresso: "#2A1C14",
  parchment: "#EFE3CC",
  cream: "#FBF6EC",
  burgundy: "#6E2433",
  charcoal: "#16191C",
  navy: "#0B1630",
  red: "#D9534F",
} as const;

export const HANDLES = {
  social: "@dawb_learn",
  socialPlatforms: "Instagram · TikTok · X",
  pro: "@DAWB",
  proPlatforms: "LinkedIn · YouTube",
  website: "www.dawblearn.org",
};

export interface Theme {
  /** palette tokens */
  paper: string;
  surface: string;
  ink: string;
  muted: string;
  primary: string;
  accent: string;
  display: string;
  displayWeight: number;
  body: string;
  quote: string;
  /** which official logo file matches this theme's surfaces */
  logo: "dark" | "light" | "cyan";
  /** brand tone: drives the signature backdrop */
  tone: "white" | "cyan" | "dark";
}

export const paletteLabels = {
  paper: "Background",
  surface: "Panel / photo area",
  ink: "Main text",
  muted: "Secondary text",
  primary: "DAWB teal",
  accent: "Highlight",
};

export function palette(t: Theme) {
  return { paper: t.paper, surface: t.surface, ink: t.ink, muted: t.muted, primary: t.primary, accent: t.accent };
}

export const W = 1080;
export const H = 1350;
export const M = 84;

/** Rough text height so stacked blocks don't collide (verified visually per template). */
export function textHeight(text: string, width: number, fontSize: number, lineHeight = 1.15, charWidth = 0.52) {
  const perLine = Math.max(1, Math.floor(width / (fontSize * charWidth)));
  const lines = text.split("\n").reduce((n, para) => n + Math.max(1, Math.ceil(para.length / perLine)), 0);
  return lines * fontSize * lineHeight;
}

/**
 * Header used on DAWB posts: official logo (as a neat chip on its own background)
 * top-left, handles top-right.
 */
export function header(b: B, t: Theme, opts: { width?: number; top?: number; scale?: number; handles?: boolean } = {}): DesignElement[] {
  const s = opts.scale ?? 1;
  const width = opts.width ?? W;
  const top = opts.top ?? 56 * s;
  const els: DesignElement[] = [];
  const logo = b.logo(t.logo, { x: M * s - 18 * s, y: top - 18 * s, w: 132 * s, name: "Logo" });
  els.push(logo);
  if (opts.handles !== false) {
    els.push(
      b.text(`${HANDLES.social}  ·  ${HANDLES.pro}`, { x: width - M * s - 520 * s, y: top + 22 * s, w: 520 * s, fontFamily: "Nunito Sans", fontSize: 24 * s, fontWeight: 700, fill: "$ink", align: "right", name: "Handles", label: "Social handles" }),
      b.text(HANDLES.website, { x: width - M * s - 520 * s, y: top + 58 * s, w: 520 * s, fontFamily: "Nunito Sans", fontSize: 21 * s, fontWeight: 500, fill: "$muted", align: "right", letterSpacing: 1.5 * s, name: "Website" }),
    );
  }
  return els;
}

export function footer(b: B, t: Theme, label: string, opts: { counter?: string; height?: number; width?: number } = {}): DesignElement[] {
  const height = opts.height ?? H;
  const width = opts.width ?? W;
  const els: DesignElement[] = [];
  if (opts.counter) {
    els.push(b.text(opts.counter, { x: M, y: height - 88, w: 200, fontFamily: "JetBrains Mono", fontSize: 22, fontWeight: 500, fill: "$muted", name: "Slide number" }));
  }
  if (label) {
    els.push(b.text(label, { x: width - M - 420, y: height - 90, w: 420, fontFamily: t.body, fontSize: 24, fontWeight: 700, fill: "$ink", align: "right", letterSpacing: 3, uppercase: true, name: "Footer label", label: "Footer label" }));
  }
  return els;
}

/** Thin accent rule. */
export function rule(b: B, x: number, y: number, w: number, color = "$primary", thickness = 6) {
  return b.rect({ x, y, w, h: thickness, fill: color, name: "Accent rule" });
}

/** Highlight bar with text on it (the cyan bars from DAWB's published flyers). */
export function bar(b: B, text: string, opts: { x: number; y: number; w: number; fontSize: number; font: string; fill?: string; color?: string; label?: string; weight?: number; padX?: number }): DesignElement[] {
  const padX = opts.padX ?? opts.fontSize * 0.6;
  const h = opts.fontSize * 1.65;
  return [
    b.rect({ x: opts.x, y: opts.y, w: opts.w, h, fill: opts.fill ?? "$primary", name: "Highlight bar" }),
    b.text(text, { x: opts.x + padX, y: opts.y, w: opts.w - padX * 2, h, verticalAlign: "middle", fontFamily: opts.font, fontSize: opts.fontSize, fontWeight: opts.weight ?? 700, fill: opts.color ?? "#FFFFFF", align: "center", label: opts.label, name: opts.label ?? "Bar text" }),
  ];
}

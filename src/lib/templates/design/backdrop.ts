import type { DesignElement } from "@/lib/design/types";
import type { B } from "./common";

/**
 * DAWB signature backdrops. Three brand tones, each built from layered, editable
 * elements: film grain, a data dot-grid, dotted orbits, isometric hexagons taken
 * from the emblem's geometry, a soft light source and editorial micro-marks.
 * `variant` (0–3) moves the composition so consecutive slides never look cloned.
 */
export type Tone = "white" | "cyan" | "dark";

export const TONE_BG: Record<Tone, string> = { white: "#FFFFFF", cyan: "#0097B2", dark: "#000000" };

export function toneOf(color: string): Tone {
  const c = color.toLowerCase();
  if (c === "#0097b2") return "cyan";
  const m = /^#([0-9a-f]{6})$/i.exec(c);
  if (!m) return "dark";
  const n = parseInt(m[1], 16);
  const l = 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
  return l > 150 ? "white" : "dark";
}

interface Opts {
  W: number;
  H: number;
  variant?: number;
  /** Lighter treatment behind dense text or full-bleed photos. */
  quiet?: boolean;
  label?: string;
}

const lock = { locked: true } as const;

export function backdrop(b: B, tone: Tone, o: Opts): DesignElement[] {
  const { W, H } = o;
  const v = (o.variant ?? 0) % 4;
  const s = Math.min(W, H) / 1080;
  const ink = tone === "white" ? "#071C24" : "#FFFFFF";
  const accent = tone === "cyan" ? "#FFFFFF" : "#0097B2";
  const els: DesignElement[] = [];
  const corner = [
    { x: W * 0.78, y: -H * 0.12 },
    { x: -W * 0.25, y: H * 0.62 },
    { x: W * 0.62, y: H * 0.7 },
    { x: -W * 0.2, y: -H * 0.18 },
  ][v];

  // 1 · light source
  const glowColor = tone === "white" ? "#0097B2" : tone === "cyan" ? "#7FE3F2" : "#0097B2";
  const glow = W * 1.15;
  els.push(b.rect({ x: corner.x - glow / 2 + W * 0.1, y: corner.y - glow / 2 + H * 0.1, w: glow, h: glow, fill: glowColor, fade: "radial", opacity: tone === "white" ? 0.12 : tone === "cyan" ? 0.45 : 0.55, name: "Glow", ...lock }));
  if (tone === "cyan") {
    const g2 = W * 1.3;
    els.push(b.rect({ x: W - corner.x - g2 / 2, y: H - corner.y - g2 / 2, w: g2, h: g2, fill: "#005A6B", fade: "radial", opacity: 0.55, name: "Depth shadow", ...lock }));
  }

  // 2 · data dot-grid
  els.push(b.pattern("dotgrid", { x: 0, y: 0, w: W, h: H, color: ink, spacing: 36 * s, size: 1.3 * s, opacity: o.quiet ? 0.06 : tone === "white" ? 0.1 : 0.12, name: "Dot grid", ...lock }));

  // 3 · dotted orbits around the light source
  if (!o.quiet) {
    [0.42, 0.62, 0.86].forEach((r, i) => {
      const d = W * r * 2;
      els.push(b.shape("ellipse", { x: corner.x + W * 0.1 - d / 2, y: corner.y + H * 0.1 - d / 2, w: d, h: d, fill: "transparent", stroke: i === 1 ? accent : ink, strokeWidth: (i === 1 ? 4 : 2.5) * s, dotted: true, dash: [0.1, (i === 1 ? 16 : 12) * s], opacity: i === 1 ? 0.55 : 0.22, name: "Dotted orbit", ...lock }));
    });
  }

  // 4 · isometric hexagons (from the emblem)
  const hx = [
    { x: W * 0.06, y: H * 0.72, size: 0.34 },
    { x: W * 0.66, y: H * 0.04, size: 0.3 },
    { x: W * 0.08, y: H * 0.08, size: 0.26 },
    { x: W * 0.7, y: H * 0.66, size: 0.32 },
  ][v];
  const hs = W * hx.size;
  els.push(
    b.shape("hexagon", { x: hx.x, y: hx.y, w: hs, h: hs * 1.15, fill: "transparent", stroke: accent, strokeWidth: 2 * s, opacity: tone === "cyan" ? 0.35 : 0.3, name: "Hexagon outline", ...lock }),
    b.shape("hexagon", { x: hx.x + hs * 0.18, y: hx.y + hs * 0.2, w: hs * 0.64, h: hs * 0.74, fill: "transparent", stroke: ink, strokeWidth: 2 * s, dotted: true, dash: [0.1, 10 * s], opacity: 0.25, name: "Hexagon dotted", ...lock }),
  );

  // 5 · editorial micro-marks: crop crosses + dotted guide + index label
  if (!o.quiet) {
    const m = 40 * s;
    for (const [x, y] of [[m, H - m], [W - m, H - m]] as const) {
      els.push(
        b.shape("line", { x: x - 10 * s, y, w: 20 * s, h: 0, stroke: ink, strokeWidth: 1.5 * s, fill: "transparent", opacity: 0.35, name: "Crop mark", ...lock }),
        b.shape("line", { x: x, y: y - 10 * s, w: 20 * s, h: 0, rotation: 90, stroke: ink, strokeWidth: 1.5 * s, fill: "transparent", opacity: 0.35, name: "Crop mark", ...lock }),
      );
    }
    els.push(b.shape("line", { x: m + 24 * s, y: H - m, w: W - 2 * m - 48 * s, h: 0, stroke: ink, strokeWidth: 2 * s, dotted: true, dash: [0.1, 9 * s], fill: "transparent", opacity: 0.25, name: "Dotted guide", ...lock }));
  }

  // 6 · film grain on top of everything in the backdrop
  els.push(b.pattern("noise", { x: 0, y: 0, w: W, h: H, color: tone === "white" ? "#000000" : "#FFFFFF", spacing: 40, size: tone === "white" ? 1.4 : 1.8, opacity: tone === "cyan" ? 0.55 : 0.7, name: "Film grain", ...lock }));
  if (tone === "cyan") els.push(b.pattern("noise", { x: 0, y: 0, w: W, h: H, color: "#003E4A", spacing: 40, size: 1.6, opacity: 0.6, name: "Film grain (deep)", ...lock }));
  return els;
}

/** Palette per tone. `accent` is the single vivid colour; celebrations swap in sunshine. */
export const TONE_PALETTE: Record<Tone, { paper: string; surface: string; ink: string; muted: string; primary: string; accent: string }> = {
  white: { paper: "#FFFFFF", surface: "#E9F4F6", ink: "#071C24", muted: "#4F646C", primary: "#0097B2", accent: "#0097B2" },
  cyan: { paper: "#0097B2", surface: "#0A7F96", ink: "#FFFFFF", muted: "#D4F3F8", primary: "#071C24", accent: "#FFFFFF" },
  dark: { paper: "#000000", surface: "#0B1A20", ink: "#FFFFFF", muted: "#A7BCC3", primary: "#0097B2", accent: "#3CD3EC" },
};

export const LOGO_FOR: Record<Tone, "light" | "cyan" | "dark"> = { white: "light", cyan: "cyan", dark: "dark" };

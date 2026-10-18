/**
 * Shared chart helpers for the design canvas (Konva) and video scenes (Remotion).
 * Categorical palettes were checked with the dataviz validator (lightness band,
 * chroma, colour-blind separation, contrast) against white and the DAWB dark surface.
 */
export const CHART_COLORS = {
  light: ["#0097B2", "#E8684A", "#3B4FA0", "#D9A21B", "#2E9E6A"],
  dark: ["#0FA3BD", "#E8684A", "#6F80D6", "#B08516", "#33A673"],
};

export function formatValue(v: number, unit = ""): string {
  const abs = Math.abs(v);
  const n = abs >= 10000 ? `${(v / 1000).toFixed(abs >= 100000 ? 0 : 1)}k` : Number.isInteger(v) ? v.toLocaleString("en-US") : v.toFixed(1);
  return `${n}${unit}`;
}

/** "Nice" axis maximum and step for gridlines, e.g. 87 → {max: 100, step: 25}. */
export function niceScale(maxValue: number, ticks = 4): { max: number; step: number } {
  const m = maxValue > 0 ? maxValue : 1;
  const raw = m / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  return { max: Math.ceil(m / step) * step, step };
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})/i.exec(hex.trim());
  const n = m ? parseInt(m[1], 16) : 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Sequential single-hue ramp: t=0 → light tint of `color` toward `base`, t=1 → full colour. */
export function rampColor(color: string, base: string, t: number): string {
  const a = hexToRgb(base);
  const b = hexToRgb(color);
  const k = 0.12 + 0.88 * Math.max(0, Math.min(1, t));
  const mix = a.map((x, i) => Math.round(x + (b[i] - x) * k));
  return `#${mix.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

export function isLightColor(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150;
}

/** Waterfall geometry: each step floats from the running total; optional final total. */
export function waterfallSteps(values: number[], withTotal: boolean): Array<{ from: number; to: number; kind: "start" | "up" | "down" | "total" }> {
  const out: Array<{ from: number; to: number; kind: "start" | "up" | "down" | "total" }> = [];
  let run = 0;
  values.forEach((v, i) => {
    if (i === 0) {
      out.push({ from: 0, to: v, kind: "start" });
      run = v;
    } else {
      out.push({ from: run, to: run + v, kind: v >= 0 ? "up" : "down" });
      run += v;
    }
  });
  if (withTotal && values.length) out.push({ from: 0, to: run, kind: "total" });
  return out;
}

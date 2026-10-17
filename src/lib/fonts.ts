/**
 * Fonts available inside designs and videos. All are self-hosted via @fontsource
 * (imported in globals.css) so the canvas exporter and the video renderer draw
 * exactly what the editor shows — no network font fetches at export time.
 */
export interface FontOption {
  family: string;
  label: string;
  weights: number[];
  category: "sans" | "display" | "serif" | "script" | "mono";
}

export const FONTS: FontOption[] = [
  { family: "Nunito Sans", label: "Nunito Sans (DAWB)", weights: [300, 400, 500, 600, 700, 800, 900], category: "sans" },
  { family: "Nunito", label: "Nunito (DAWB)", weights: [400, 500, 600, 700, 800, 900], category: "sans" },
  { family: "JetBrains Mono", label: "JetBrains Mono (code)", weights: [400, 500, 700], category: "mono" },
];

export const FONT_FAMILIES = FONTS.map((f) => f.family);

export function fontStack(family: string): string {
  const f = FONTS.find((x) => x.family === family);
  const fallback = f?.category === "serif" ? "Georgia, serif" : f?.category === "mono" ? "monospace" : "Arial, sans-serif";
  return `"${family}", ${fallback}`;
}

/** Nearest weight the family actually ships, so the browser never fakes bold. */
export function nearestWeight(family: string, weight: number): number {
  const f = FONTS.find((x) => x.family === family);
  if (!f) return weight;
  return f.weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best), f.weights[0]);
}

/** Wait until the given font faces are decoded so canvas text measures correctly. */
export async function ensureFontsLoaded(specs: Array<{ family: string; weight: number; italic?: boolean }>): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  const unique = new Map<string, string>();
  for (const s of specs) {
    const w = nearestWeight(s.family, s.weight);
    const key = `${s.italic ? "italic " : ""}${w} 48px "${s.family}"`;
    unique.set(key, key);
  }
  await Promise.all([...unique.values()].map((k) => document.fonts.load(k).catch(() => [])));
  await document.fonts.ready;
}

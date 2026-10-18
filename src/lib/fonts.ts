/**
 * Fonts available inside designs and videos. All are self-hosted via @fontsource
 * (imported in globals.css) so the canvas exporter and the video renderer draw
 * exactly what the editor shows — no network font fetches at export time.
 */
export interface FontOption {
  family: string;
  label: string;
  weights: number[];
  /** Weights that also ship an italic face. */
  italics?: number[];
  category: "sans" | "display" | "serif" | "script" | "mono";
  /** One-line guidance shown on the Brand page. */
  use?: string;
}

/**
 * To add a font: `npm i @fontsource/<name>`, add an entry here, then run
 * `npm run fonts:sync` — that rewrites src/app/fonts.css (editor + export) and
 * src/remotion/fonts.ts (server video renders) from this list.
 * Only add open-licence (OFL) fonts; @fontsource packages are all OFL/Apache.
 */
export const FONTS: FontOption[] = [
  { family: "Nunito Sans", label: "Nunito Sans (DAWB)", weights: [300, 400, 500, 600, 700, 800, 900], italics: [400, 600, 700, 800, 900], category: "sans", use: "Brand body and UI type" },
  { family: "Nunito", label: "Nunito (DAWB)", weights: [400, 500, 600, 700, 800, 900], italics: [400, 700, 800, 900], category: "sans", use: "Brand display type" },
  { family: "Inter", label: "Inter", weights: [300, 400, 500, 600, 700, 800], italics: [400], category: "sans", use: "Neutral, data-dense layouts and tables" },
  { family: "Manrope", label: "Manrope", weights: [300, 400, 500, 600, 700, 800], category: "sans", use: "Modern geometric headlines" },
  { family: "DM Sans", label: "DM Sans", weights: [400, 500, 600, 700, 800], italics: [400], category: "sans", use: "Friendly, compact training flyers" },
  { family: "Plus Jakarta Sans", label: "Plus Jakarta Sans", weights: [400, 500, 600, 700, 800], italics: [400], category: "sans", use: "Premium product-style headlines" },
  { family: "IBM Plex Sans", label: "IBM Plex Sans", weights: [300, 400, 500, 600, 700], italics: [400], category: "sans", use: "Research, reports and charts" },
  { family: "Space Grotesk", label: "Space Grotesk", weights: [400, 500, 700], category: "display", use: "Technical, slightly futuristic accents" },
  { family: "Fraunces", label: "Fraunces (serif)", weights: [300, 400, 600, 800], italics: [400, 600], category: "serif", use: "Editorial headlines with character" },
  { family: "Source Serif 4", label: "Source Serif 4", weights: [400, 600, 700], italics: [400], category: "serif", use: "Long-form research and articles" },
  { family: "Playfair Display", label: "Playfair Display", weights: [400, 700, 900], italics: [400, 700], category: "serif", use: "Elegant, high-contrast titles" },
  { family: "Instrument Serif", label: "Instrument Serif", weights: [400], italics: [400], category: "serif", use: "Refined accent words (one weight)" },
  { family: "Cormorant Garamond", label: "Cormorant Garamond", weights: [400, 600, 700], italics: [400], category: "serif", use: "Classic, formal occasions" },
  { family: "JetBrains Mono", label: "JetBrains Mono (code)", weights: [400, 500, 700], category: "mono", use: "Code and SQL snippets" },
  { family: "IBM Plex Mono", label: "IBM Plex Mono", weights: [400, 500, 700], category: "mono", use: "Data labels, figures, captions" },
];

export const FONT_GROUPS: Array<{ label: string; categories: FontOption["category"][] }> = [
  { label: "Sans serif", categories: ["sans", "display"] },
  { label: "Serif", categories: ["serif"] },
  { label: "Monospace", categories: ["mono"] },
];

/** fontsource package slug for a family, e.g. "Source Serif 4" → "source-serif-4". */
export function fontPackage(family: string): string {
  return family.toLowerCase().replace(/\s+/g, "-");
}

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

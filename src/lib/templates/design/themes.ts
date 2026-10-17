import type { DesignElement } from "@/lib/design/types";
import { type Theme } from "./common";

import { TONE_PALETTE, LOGO_FOR, type Tone } from "./backdrop";

const type = { display: "Nunito Sans", displayWeight: 900, body: "Nunito Sans", quote: "Nunito" };
const rounded = { display: "Nunito", displayWeight: 900, body: "Nunito Sans", quote: "Nunito" };
const tone = (t: Tone, font = type, accent?: string): Theme => ({ ...font, ...TONE_PALETTE[t], ...(accent ? { accent } : {}), logo: LOGO_FOR[t], tone: t });

/**
 * Brand themes. Every template sits on one of three DAWB tones — white, cyan
 * (#0097B2) or dark — so the feed reads as one family. Names are kept so each
 * post can be re-toned in one place.
 */
export const THEMES = {
  cosmic: tone("dark", rounded),
  archive: tone("cyan"),
  alexandria: tone("dark"),
  museum: tone("white"),
  heritage: tone("cyan", rounded),
  golden: tone("dark", rounded),
  journalism: tone("dark"),
  stark: tone("white"),
  advocacy: tone("cyan"),
  gallery: tone("white", rounded),
  tech: tone("dark"),
  twilight: tone("cyan", rounded),
  corporate: tone("white"),
  humanist: tone("dark"),
  field: tone("white"),
  fintech: tone("dark"),
  health: tone("cyan"),
  manifesto: tone("cyan"),
  profile: tone("white", rounded),
  journal: tone("white"),
  results: tone("dark"),
  community: tone("white", rounded),
  final: tone("dark"),
  brand: tone("dark"),
  brandLight: tone("white"),
  celebrateWhite: tone("white", rounded, "#FFB800"),
  celebrateCyan: tone("cyan", rounded, "#FFD24A"),
  celebrateDark: tone("dark", rounded, "#FFC83D"),
} satisfies Record<string, Theme>;

/**
 * Flip a page to the theme's opposite tone (e.g. a dark DAWB closing slide in an
 * otherwise light carousel). Swaps text/background tokens and the logo file.
 */
export function swapTones(els: DesignElement[]): DesignElement[] {
  const map = (v: string) => (v === "$ink" ? "$paper" : v === "$paper" ? "$ink" : v === "$muted" ? "$paper" : v);
  return els.map((el) => {
    if (el.type === "text") return { ...el, fill: map(el.fill), opacity: el.fill === "$muted" ? 0.8 : el.opacity };
    if (el.type === "shape") return { ...el, fill: map(el.fill), stroke: map(el.stroke) };
    if (el.type === "pattern") return { ...el, color: map(el.color) };
    if (el.type === "image" && el.role === "logo") {
      return { ...el, src: el.src.includes("dark") ? el.src.replace("dark", "light") : el.src.replace(/light|cyan/, "dark") };
    }
    return el;
  });
}

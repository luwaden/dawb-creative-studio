import type { DesignElement } from "@/lib/design/types";
import { C, type Theme } from "./common";

const serif = { display: "Playfair Display", displayWeight: 700, body: "Inter", quote: "Cormorant Garamond" };
const grotesk = { display: "Space Grotesk", displayWeight: 700, body: "Inter", quote: "Cormorant Garamond" };

/** One theme per post, taken from each post's "Color Mood" in the campaign calendar. */
export const THEMES = {
  cosmic: { ...serif, paper: C.navy, surface: "#1B2B4D", ink: "#FFFFFF", muted: "#C8D2E6", primary: C.teal, accent: "#E6BA62", logo: "dark" },
  archive: { ...serif, paper: C.espresso, surface: "#4A3423", ink: "#F6EAD4", muted: "#D9C4A2", primary: C.teal, accent: C.amber, logo: "dark" },
  alexandria: { ...serif, paper: C.charcoal, surface: "#2D2722", ink: "#F7EFE4", muted: "#C9B9A6", primary: C.teal, accent: "#E08A3C", logo: "dark" },
  museum: { ...grotesk, paper: "#F3E5D0", surface: "#D8B88E", ink: "#1E1A17", muted: "#5B4F45", primary: C.teal, accent: "#B4552E", logo: "light" },
  heritage: { ...serif, paper: C.deepTeal2, surface: "#0A3D49", ink: C.cream, muted: "#CFE3E6", primary: C.teal, accent: "#E6BA62", logo: "dark" },
  golden: { ...serif, paper: "#1B120C", surface: "#5A3A1F", ink: "#FFFFFF", muted: "#F0D9BF", primary: C.teal, accent: "#F2B35C", logo: "dark" },
  journalism: { ...grotesk, paper: C.nearBlack, surface: C.midnight, ink: "#FFFFFF", muted: "#A9BAC2", primary: C.teal, accent: C.amber, logo: "dark" },
  stark: { ...grotesk, paper: "#0A0C0D", surface: "#15191B", ink: "#FFFFFF", muted: "#9AA3A8", primary: C.teal, accent: C.teal, logo: "dark" },
  advocacy: { ...grotesk, paper: C.navy, surface: "#16254A", ink: "#FFFFFF", muted: "#B9C3DA", primary: C.teal, accent: "#E5534B", logo: "dark" },
  gallery: { ...serif, paper: "#FBF3E6", surface: "#E8D5B8", ink: "#2A211B", muted: "#6B5B4E", primary: C.teal, accent: "#A8742F", logo: "light" },
  tech: { ...grotesk, paper: "#070B14", surface: "#111A2E", ink: "#FFFFFF", muted: "#9FB0C8", primary: C.teal, accent: "#7E8BFF", logo: "dark" },
  twilight: { ...serif, paper: "#10163A", surface: "#2A2F5C", ink: "#FFFFFF", muted: "#C7CCEB", primary: C.teal, accent: "#5FD0E3", logo: "dark" },
  corporate: { ...grotesk, paper: C.nearBlack, surface: "#123039", ink: "#FFFFFF", muted: "#A4B6BD", primary: C.teal, accent: "#4FC3D9", logo: "dark" },
  humanist: { ...grotesk, paper: "#0A1220", surface: "#14223A", ink: "#FFFFFF", muted: "#AEBBD0", primary: C.teal, accent: "#E9B872", logo: "dark" },
  field: { ...grotesk, paper: "#121C15", surface: "#2F4A2C", ink: "#FFFFFF", muted: "#C9D6C2", primary: C.teal, accent: "#E3B04B", logo: "dark" },
  fintech: { ...grotesk, paper: "#05090A", surface: "#0E1A1C", ink: "#FFFFFF", muted: "#9DB3B6", primary: C.teal, accent: "#3BE8A0", logo: "dark" },
  health: { ...grotesk, display: "Space Grotesk", paper: "#0A1C2A", surface: "#123447", ink: "#FFFFFF", muted: "#B3C7D3", primary: C.teal, accent: "#5FD0E3", logo: "dark" },
  manifesto: { ...grotesk, paper: C.deepTeal2, surface: "#063C48", ink: "#FFFFFF", muted: "#BFE3EA", primary: "#3CC3DA", accent: "#E6BA62", logo: "dark" },
  profile: { ...serif, paper: "#F7EFE3", surface: "#C99C6E", ink: "#2B2119", muted: "#6E5D4F", primary: C.teal, accent: "#B07A3B", logo: "light" },
  journal: { ...grotesk, paper: "#FFFFFF", surface: C.lightTeal, ink: C.nearBlack, muted: "#4E5F66", primary: C.teal, accent: C.deepTeal, logo: "light" },
  results: { ...grotesk, paper: C.nearBlack, surface: C.midnight, ink: "#FFFFFF", muted: "#A9BAC2", primary: C.teal, accent: "#E6BA62", logo: "dark" },
  community: { ...grotesk, display: "Space Grotesk", paper: "#FBF6EC", surface: "#E9DCC7", ink: "#2B2119", muted: "#6E5D4F", primary: C.teal, accent: C.teal, logo: "light" },
  final: { ...grotesk, paper: "#0A0F12", surface: "#162229", ink: "#FFFFFF", muted: "#9FB0B7", primary: C.teal, accent: "#E6BA62", logo: "dark" },
  brand: { ...grotesk, paper: C.nearBlack, surface: C.midnight, ink: "#FFFFFF", muted: "#A9BAC2", primary: C.teal, accent: C.teal, logo: "dark" },
  brandLight: { ...grotesk, paper: C.offWhite, surface: C.lightTeal, ink: C.nearBlack, muted: "#4E5F66", primary: C.teal, accent: C.deepTeal, logo: "light" },
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
      return { ...el, src: el.src.includes("dark") ? el.src.replace("dark", "light") : el.src.replace("light", "dark") };
    }
    return el;
  });
}

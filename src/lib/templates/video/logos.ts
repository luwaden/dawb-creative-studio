import { scene, video } from "@/lib/video/build";
import type { VideoTemplate } from "../types";

function logo(id: string, name: string, style: "assemble" | "signal" | "prism", bg: string, description: string, styleLabel: string): VideoTemplate {
  return {
    kind: "video",
    id,
    name,
    post: null,
    phase: null,
    category: "motion",
    alsoIn: ["logo"],
    aspect: "landscape",
    tags: ["logo", "sting", "intro", "outro", "sound", style],
    style: styleLabel,
    description,
    build: () => video([scene("logo-reveal", { style, tagline: "www.dawblearn.org", sound: true }, { id: `${id}-s1`, duration: 150, background: { color: bg } })], { aspect: "landscape", logo: "none" }),
  };
}

export const logoAssemble = logo("logo-assemble", "Logo Motion — Assemble", "assemble", "#000000", "Dark sting: a scan line crosses the void, the emblem outline draws, facets punch out with clicks, data dots pop and the letters slam in on an impact with a light sweep.", "Dark · scan, draw, impact");
export const logoSignal = logo("logo-signal", "Logo Motion — Signal", "signal", "#0097B2", "Cyan sting: a pulse ripples through a halftone field, the mark arrives as glitching slices, locks in on a scan line and chimes.", "Cyan · halftone pulse, glitch lock");
export const logoPrism = logo("logo-prism", "Logo Motion — Prism", "prism", "#FFFFFF", "White sting: a wall of emblem hexagons flips away in a diagonal wave, the mark rises with a soft 3D tilt, letters typeset and a shimmer finishes it.", "White · hexagon flip, 3D rise");

export const LOGO_MOTIONS = [logoAssemble, logoSignal, logoPrism];

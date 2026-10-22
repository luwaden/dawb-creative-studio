import type { DesignElement } from "@/lib/design/types";
import type { SheetRecord } from "@/lib/sheets/schema";
import { progressFraction } from "@/lib/lessons";
import { dottedLine, dottedRing, handles, logo, pill, texture, type K } from "./kit";
import { defineDataArt, estLines, eyebrow, fitSize, pillW, pin } from "./kit2";
import { SAMPLE_TRAINEE, SAMPLE_TRAINEE_2 } from "../records";

/**
 * Trainee learning quotes — built from a Trainees row (name, photo, occupation,
 * location, track, quote, progress). Only rows with consent = Yes are generated.
 */
const W = 1080;
const H = 1350;
const ink = "#071C24";

const quoteText = (r: SheetRecord) => `“${r.quote.replace(/^[“"]|[”"]$/g, "")}”`;
const meta = (r: SheetRecord) => [r.occupation, r.location].filter(Boolean).join(" · ");

function photo(b: K, r: SheetRecord, g: { x: number; y: number; w: number; h: number; circle?: boolean; radius?: number; fill?: string; rotation?: number }): DesignElement {
  return b.image({ x: g.x, y: g.y, w: g.w, h: g.h, src: r.photo_url, circle: g.circle, cornerRadius: g.radius ?? 0, rotation: g.rotation ?? 0, placeholderFill: g.fill ?? "$surface", hint: "Trainee photo", label: "Trainee photo", name: "Trainee photo" });
}

/** Progress bar from "Week 6 of 8"; falls back to plain text. */
function progress(b: K, r: SheetRecord, x: number, y: number, w: number, o: { track: string; fill: string; text: string }): DesignElement[] {
  if (!r.progress) return [];
  const p = progressFraction(r.progress);
  const fs = 20;
  const textH = estLines(r.progress, fs, w, 0.52) * fs * 1.3;
  const els: DesignElement[] = [b.text(r.progress, { x, y, w, fontFamily: "Nunito Sans", fontSize: fs, fontWeight: 800, fill: o.text, lineHeight: 1.3, label: "Progress", name: "Progress" })];
  if (p) {
    els.push(b.rect({ x, y: y + textH + 12, w, h: 10, fill: o.track, cornerRadius: 5, name: "Progress track" }));
    els.push(b.rect({ x, y: y + textH + 12, w: Math.max(10, w * p.value), h: 10, fill: o.fill, cornerRadius: 5, name: "Progress fill" }));
  }
  return els;
}

export const tqEditorial = defineDataArt({
  id: "tq-editorial",
  name: "Trainee Quote — Editorial (White)",
  category: "quotes",
  format: "ig-portrait",
  dataSource: "trainees",
  style: "White · giant teal quote mark · serif quote · photo signature",
  tags: ["trainee", "testimonial", "quote", "learning", "student voice"],
  description: "A trainee's words set large in an editorial serif under a giant quote mark, signed with their photo, name, occupation, location, track and progress.",
  pal: { paper: "#FFFFFF", surface: "#EEF4F5", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  sample: SAMPLE_TRAINEE,
  pages: (b, r) => {
    const q = quoteText(r);
    const fs = fitSize(q, 940, 8, 60, 34, 0.48);
    return [
      {
        name: "Flyer",
        els: [
          ...texture(b, W, H, { light: true, dots: 0.07, contours: "#0097B2" }),
          logo(b, "light", 60, 46, 110),
          ...handles(b, 560, 64, 460, "$ink"),
          b.text("“", { x: 40, y: 170, w: 300, fontFamily: "Fraunces", fontSize: 360, fontWeight: 600, fill: "$primary", lineHeight: 1, name: "Quote mark" }),
          ...pill(b, r.track ? `${r.track} trainee` : "DAWB trainee", 1016 - pillW(r.track ? `${r.track} trainee` : "DAWB trainee", 20), 250, { fill: "transparent", stroke: "#071C24", color: "$ink", size: 20, w: pillW(r.track ? `${r.track} trainee` : "DAWB trainee", 20), label: "Track" }),
          b.text(q, { x: 64, y: 400, w: 950, fontFamily: "Fraunces", fontSize: fs, fontWeight: 400, fill: "$ink", lineHeight: 1.22, label: "Quote", name: "Quote", multiline: true }),
          dottedLine(b, 64, 1018, 952, "#071C24", { dot: 3, gap: 10, opacity: 0.25 }),
          dottedRing(b, 134, 1144, 82, "#0097B2", { dot: 4, gap: 11, opacity: 0.9 }),
          photo(b, r, { x: 64, y: 1074, w: 140, h: 140, circle: true }),
          b.text(r.name, { x: 236, y: 1074, w: 500, fontFamily: "Nunito", fontSize: 40, fontWeight: 900, fill: "$ink", label: "Trainee name", name: "Trainee name" }),
          b.text(r.occupation, { x: 236, y: 1126, w: 500, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 700, fill: "$ink", opacity: 0.8, label: "Occupation", name: "Occupation" }),
          ...pin(b, 236, 1172, 22, "#0097B2"),
          b.text(r.location, { x: 268, y: 1167, w: 470, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 700, fill: "$muted", label: "Location", name: "Location" }),
          ...progress(b, r, 760, 1090, 256, { track: "#E1ECEF", fill: "#0097B2", text: ink }),
        ],
      },
    ];
  },
});

export const tqCyanPolaroid = defineDataArt({
  id: "tq-cyan-polaroid",
  name: "Trainee Quote — Polaroid (Cyan)",
  category: "quotes",
  format: "ig-portrait",
  dataSource: "trainees",
  style: "DAWB cyan · tilted polaroid · bold quote",
  tags: ["trainee", "quote", "polaroid", "cyan", "testimonial"],
  description: "A tilted polaroid photo with the trainee's name on the frame, their quote in bold type and their track and location.",
  pal: { paper: "#0097B2", surface: "#0A7F95", ink: "#FFFFFF", muted: "#D6F3F8", primary: "#071C24", accent: "#FFFFFF" },
  sample: SAMPLE_TRAINEE_2,
  pages: (b, r) => {
    const q = quoteText(r);
    const fs = fitSize(q, 950, 6, 52, 30, 0.52);
    return [
      {
        name: "Flyer",
        els: [
          ...texture(b, W, H, { light: false, dots: 0.14, halftone: "#FFFFFF" }),
          logo(b, "cyan", 60, 46, 110),
          ...handles(b, 560, 64, 460, "#FFFFFF"),
          b.rect({ x: 120, y: 210, w: 470, h: 560, fill: "#FFFFFF", cornerRadius: 10, rotation: -5, name: "Polaroid frame" }),
          photo(b, r, { x: 146, y: 234, w: 420, h: 420, rotation: -5, fill: "#D6F3F8" }),
          b.text(r.name, { x: 150, y: 680, w: 420, fontFamily: "Nunito", fontSize: fitSize(r.name, 420, 1, 36, 24, 0.55), fontWeight: 900, fill: ink, align: "center", rotation: -5, label: "Trainee name", name: "Trainee name" }),
          b.text("WHAT I\nLEARNED", { x: 650, y: 260, w: 380, fontFamily: "Nunito", fontSize: 72, fontWeight: 900, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 2.5, lineHeight: 0.98, label: "Headline", name: "Headline", multiline: true }),
          ...pill(b, r.track || "DAWB", 654, 470, { fill: "#071C24", color: "#FFFFFF", size: 20, w: pillW(r.track || "DAWB", 20), label: "Track" }),
          b.text(q, { x: 64, y: 820, w: 950, fontFamily: "Nunito", fontSize: fs, fontWeight: 800, fill: "#FFFFFF", lineHeight: 1.22, label: "Quote", name: "Quote", multiline: true }),
          b.text(meta(r), { x: 64, y: 1236, w: 950, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 800, fill: "#071C24", label: "Occupation and location", name: "Occupation and location" }),
        ],
      },
    ];
  },
});

export const tqDarkPhoto = defineDataArt({
  id: "tq-dark-photo",
  name: "Trainee Quote — Photo Hero (Dark)",
  category: "quotes",
  format: "ig-portrait",
  dataSource: "trainees",
  style: "Dark · full-width photo with fade · quote on night",
  tags: ["trainee", "quote", "photo", "dark", "testimonial"],
  description: "Full-width trainee photo fading into night, then their quote, name, occupation, location and a progress bar.",
  pal: { paper: "#071C24", surface: "#0E2A33", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: "#2FD3EE" },
  sample: SAMPLE_TRAINEE,
  pages: (b, r) => {
    const q = quoteText(r);
    const fs = fitSize(q, 952, 5, 46, 28, 0.5);
    return [
      {
        name: "Flyer",
        els: [
          photo(b, r, { x: 0, y: 0, w: W, h: 700, fill: "#0E2A33" }),
          b.rect({ x: 0, y: 380, w: W, h: 330, fill: "#071C24", fade: "up", name: "Photo fade" }),
          ...texture(b, W, H, { light: false, dots: 0.08 }),
          logo(b, "dark", 60, 46, 110),
          ...pill(b, r.track ? `${r.track} · ${r.cohort || "DAWB"}` : "DAWB trainee", 64, 600, { fill: "$primary", color: "#FFFFFF", size: 20, w: pillW(r.track ? `${r.track} · ${r.cohort || "DAWB"}` : "DAWB trainee", 20), label: "Track" }),
          b.text(q, { x: 64, y: 690, w: 952, fontFamily: "Nunito", fontSize: fs, fontWeight: 800, fill: "#FFFFFF", lineHeight: 1.25, label: "Quote", name: "Quote", multiline: true }),
          b.rect({ x: 64, y: 1090, w: 60, h: 6, fill: "$accent", cornerRadius: 3, name: "Rule" }),
          b.text(r.name, { x: 64, y: 1116, w: 640, fontFamily: "Nunito", fontSize: 44, fontWeight: 900, fill: "#FFFFFF", label: "Trainee name", name: "Trainee name" }),
          b.text(meta(r), { x: 64, y: 1176, w: 640, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 700, fill: "#FFFFFF", opacity: 0.75, label: "Occupation and location", name: "Occupation and location" }),
          ...progress(b, r, 740, 1124, 276, { track: "#1F3B44", fill: "#2FD3EE", text: "#FFFFFF" }),
          b.text("@dawb_learn · www.dawblearn.org", { x: 64, y: 1270, w: 952, fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: "#FFFFFF", opacity: 0.55, name: "Handles" }),
        ],
      },
    ];
  },
});

export const tqSquare = defineDataArt({
  id: "tq-square-minimal",
  name: "Trainee Quote — Minimal Square",
  category: "quotes",
  format: "ig-square",
  dataSource: "trainees",
  style: "Square · warm paper · centred quote · small portrait",
  tags: ["trainee", "quote", "square", "minimal"],
  description: "A calm square card: small portrait, the quote centred in serif type, name and details below.",
  pal: { paper: "#F6F1E8", surface: "#ECE3D3", ink: "#1E1A16", muted: "#7A6D5E", primary: "#0097B2", accent: "#0097B2" },
  sample: SAMPLE_TRAINEE_2,
  pages: (b, r) => {
    const q = quoteText(r);
    const fs = fitSize(q, 860, 6, 60, 28, 0.48);
    return [
      {
        name: "Post",
        els: [
          ...texture(b, 1080, 1080, { light: true, dots: 0.07, grain: 1.6 }),
          logo(b, "light", 56, 44, 90),
          b.text(r.track ? `${r.track} trainee` : "DAWB trainee", { x: 560, y: 70, w: 464, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "$primary", align: "right", letterSpacing: 2, uppercase: true, label: "Track", name: "Track" }),
          dottedRing(b, 540, 270, 92, "#0097B2", { dot: 4, gap: 11 }),
          photo(b, r, { x: 460, y: 190, w: 160, h: 160, circle: true }),
          b.text(q, { x: 110, y: 410, w: 860, fontFamily: "Fraunces", fontSize: fs, fontWeight: 400, italic: true, fill: "$ink", align: "center", lineHeight: 1.25, label: "Quote", name: "Quote", multiline: true }),
          b.text(r.name, { x: 110, y: 880, w: 860, fontFamily: "Nunito", fontSize: 38, fontWeight: 900, fill: "$ink", align: "center", label: "Trainee name", name: "Trainee name" }),
          b.text(meta(r), { x: 110, y: 932, w: 860, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 700, fill: "$muted", align: "center", label: "Occupation and location", name: "Occupation and location" }),
        ],
      },
    ];
  },
});

export const tqStory = defineDataArt({
  id: "tq-story",
  name: "Trainee Quote — Story (Progress)",
  category: "quotes",
  format: "story",
  dataSource: "trainees",
  style: "Story 9:16 · large portrait · progress tracker",
  tags: ["trainee", "quote", "story", "progress", "status"],
  description: "Vertical story with a large portrait, the trainee's quote, and a progress tracker drawn from their progress note (e.g. Week 6 of 8).",
  pal: { paper: "#FFFFFF", surface: "#EEF4F5", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  sample: SAMPLE_TRAINEE,
  pages: (b, r) => {
    const SH = 1920;
    const q = quoteText(r);
    const fs = fitSize(q, 952, 7, 64, 32, 0.5);
    return [
      {
        name: "Story",
        els: [
          ...texture(b, W, SH, { light: true, dots: 0.08, glow: { color: "#0097B2", x: 540, y: 520, size: 900, opacity: 0.14 } }),
          logo(b, "light", 60, 60, 120),
          eyebrow(b, "Learning journey", 64, 240, 952, "$primary", { label: "Eyebrow" }),
          dottedRing(b, 540, 560, 270, "#0097B2", { dot: 5, gap: 15 }),
          photo(b, r, { x: 300, y: 320, w: 480, h: 480, circle: true }),
          b.text(r.name, { x: 64, y: 870, w: 952, fontFamily: "Nunito", fontSize: fitSize(r.name, 952, 1, 84, 50, 0.55), fontWeight: 900, fill: "$ink", align: "center", letterSpacing: -1.5, label: "Trainee name", name: "Trainee name" }),
          b.text(meta(r), { x: 64, y: 976, w: 952, fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 700, fill: "$muted", align: "center", label: "Occupation and location", name: "Occupation and location" }),
          b.text(q, { x: 64, y: 1080, w: 952, fontFamily: "Nunito", fontSize: fs, fontWeight: 800, fill: "$ink", align: "center", lineHeight: 1.25, label: "Quote", name: "Quote", multiline: true }),
          b.rect({ x: 64, y: 1640, w: 952, h: 180, fill: "$ink", cornerRadius: 30, name: "Progress card" }),
          b.text(r.track ? `${r.track} track` : "DAWB track", { x: 104, y: 1668, w: 600, fontFamily: "IBM Plex Mono", fontSize: 22, fontWeight: 500, fill: "#2FD3EE", letterSpacing: 2, uppercase: true, label: "Track", name: "Track" }),
          ...progress(b, r, 104, 1716, 872, { track: "#1F3B44", fill: "#2FD3EE", text: "#FFFFFF" }),
        ],
      },
    ];
  },
});

export const QUOTE_FLYERS = [tqEditorial, tqCyanPolaroid, tqDarkPhoto, tqSquare, tqStory];

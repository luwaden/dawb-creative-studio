import type { DesignElement } from "@/lib/design/types";
import type { SheetRecord } from "@/lib/sheets/schema";
import { dottedLine, dottedRing, handles, logo, pill, texture, type K } from "./kit";
import { chipRow, defineDataArt, estLines, eyebrow, fitSize, pillW, splitList } from "./kit2";
import { SAMPLE_SPEAKER } from "../records";

/**
 * Webinar speaker profiles — built from a Speakers row (name, photo, role, bio,
 * expertise, webinar details). Sample values are placeholders.
 */
const W = 1080;
const H = 1350;
const ink = "#071C24";

const roleLine = (r: SheetRecord) => [r.role, r.organisation].filter(Boolean).join(" · ");
const whenLine = (r: SheetRecord) => [r.webinar_date, r.webinar_time].filter(Boolean).join("  ·  ");

function photo(b: K, r: SheetRecord, g: { x: number; y: number; w: number; h: number; circle?: boolean; radius?: number; fill?: string }): DesignElement {
  return b.image({ x: g.x, y: g.y, w: g.w, h: g.h, src: r.photo_url, circle: g.circle, cornerRadius: g.radius ?? 0, placeholderFill: g.fill ?? "$surface", hint: "Speaker portrait", label: "Speaker photo", name: "Speaker photo" });
}

export const spEditorial = defineDataArt({
  id: "sp-editorial",
  name: "Speaker Profile — Editorial (White)",
  category: "speakers",
  alsoIn: ["btd"],
  format: "ig-portrait",
  dataSource: "speakers",
  style: "White editorial · tall portrait · bio · expertise chips · webinar card",
  tags: ["speaker", "webinar", "profile", "bio", "btd", "introduction"],
  description: "An editorial speaker introduction: tall portrait, name, role, a short bio, expertise chips and a dark webinar card with date, time and platform.",
  pal: { paper: "#FFFFFF", surface: "#EEF4F5", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  sample: SAMPLE_SPEAKER,
  pages: (b, r) => {
    const nameSize = fitSize(r.name, 540, 2, 84, 48, 0.55);
    const nameLines = estLines(r.name, nameSize, 540, 0.55);
    const roleY = 300 + nameLines * nameSize * 1.04 + 14;
    const bioY = roleY + 74;
    const bioSize = r.bio.length > 300 ? 24 : 27;
    const bioH = estLines(r.bio, bioSize, 520, 0.5) * bioSize * 1.45;
    const chips = chipRow(b, splitList(r.expertise), 64, Math.min(bioY + bioH + 34, 860), 540, { color: "$ink", size: 20, label: "Expertise" });
    return [
      {
        name: "Flyer",
        els: [
          ...texture(b, W, H, { light: true, dots: 0.07 }),
          logo(b, "light", 60, 46, 110),
          ...handles(b, 560, 64, 460, "$ink"),
          ...pill(b, r.series || "Webinar speaker", 64, 200, { fill: "$primary", color: "#FFFFFF", size: 20, w: Math.min(560, pillW(r.series || "Webinar speaker", 20)), label: "Series" }),
          b.text(r.name, { x: 60, y: 290, w: 560, fontFamily: "Nunito", fontSize: nameSize, fontWeight: 900, fill: "$ink", lineHeight: 1.02, letterSpacing: -1.5, label: "Speaker name", name: "Speaker name" }),
          b.text(roleLine(r), { x: 64, y: roleY, w: 560, fontFamily: "Nunito Sans", fontSize: fitSize(roleLine(r), 560, 1, 28, 20, 0.52), fontWeight: 800, fill: "$primary", label: "Role and organisation", name: "Role and organisation" }),
          b.text(r.bio, { x: 64, y: bioY, w: 520, fontFamily: "Nunito Sans", fontSize: bioSize, fontWeight: 500, fill: "$ink", opacity: 0.82, lineHeight: 1.45, label: "Bio", name: "Bio", multiline: true }),
          ...chips.els,
          b.rect({ x: 650, y: 190, w: 366, h: 690, fill: "$surface", cornerRadius: 200, name: "Photo arch" }),
          photo(b, r, { x: 650, y: 190, w: 366, h: 690, radius: 183 }),
          dottedRing(b, 833, 880, 70, "#0097B2", { dot: 4, gap: 12, opacity: 0.9 }),
          b.rect({ x: 64, y: 940, w: 952, h: 330, fill: "$ink", cornerRadius: 32, name: "Webinar card" }),
          eyebrow(b, "Webinar", 104, 976, 600, "#2FD3EE", { label: "Card label" }),
          b.text(r.webinar_title, { x: 100, y: 1014, w: 880, fontFamily: "Nunito", fontSize: fitSize(r.webinar_title, 880, 2, 52, 34, 0.55), fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.08, label: "Webinar title", name: "Webinar title", multiline: true }),
          dottedLine(b, 104, 1162, 872, "#FFFFFF", { dot: 3, gap: 10, opacity: 0.3 }),
          b.text(whenLine(r), { x: 104, y: 1188, w: 560, fontFamily: "Nunito", fontSize: 32, fontWeight: 900, fill: "#FFFFFF", label: "Date and time", name: "Date and time" }),
          b.text(r.platform, { x: 640, y: 1192, w: 336, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 700, fill: "#2FD3EE", align: "right", label: "Platform", name: "Platform" }),
        ],
      },
    ];
  },
});

export const spCyanSpotlight = defineDataArt({
  id: "sp-cyan-spotlight",
  name: "Speaker Profile — Spotlight (Cyan)",
  category: "speakers",
  alsoIn: ["btd"],
  format: "ig-portrait",
  dataSource: "speakers",
  style: "DAWB cyan · circular portrait in dotted orbits · outlined SPEAKER",
  tags: ["speaker", "webinar", "spotlight", "cyan", "announcement"],
  description: "Centred portrait inside dotted orbits on DAWB cyan, outlined SPEAKER type, name, role, expertise and the webinar details bar.",
  pal: { paper: "#0097B2", surface: "#0A7F95", ink: "#FFFFFF", muted: "#D6F3F8", primary: "#071C24", accent: "#FFFFFF" },
  sample: SAMPLE_SPEAKER,
  pages: (b, r) => {
    const chips = splitList(r.expertise, 3);
    const chipEls = chipRow(b, chips, 0, 0, 2000, { color: "#FFFFFF", size: 20, label: "Expertise" });
    const chipsW = chipEls.els.filter((e) => e.type === "shape").reduce((m, e) => Math.max(m, e.x + e.width), 0);
    const off = (W - chipsW) / 2;
    return [
      {
        name: "Flyer",
        els: [
          ...texture(b, W, H, { light: false, dots: 0.14, halftone: "#FFFFFF", orbits: { color: "#071C24", x: 540, y: 520, r: [230, 270, 330] } }),
          logo(b, "cyan", 60, 46, 110),
          ...handles(b, 560, 64, 460, "#FFFFFF"),
          b.text("SPEAKER", { x: 40, y: 180, w: 1000, fontFamily: "Nunito", fontSize: 170, fontWeight: 900, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 2.5, align: "center", letterSpacing: 6, opacity: 0.55, label: "Background word", name: "Background word" }),
          photo(b, r, { x: 340, y: 320, w: 400, h: 400, circle: true, fill: "#0A7F95" }),
          b.text(r.name, { x: 64, y: 790, w: 952, fontFamily: "Nunito", fontSize: fitSize(r.name, 952, 1, 84, 48, 0.55), fontWeight: 900, fill: "#FFFFFF", align: "center", letterSpacing: -1.5, label: "Speaker name", name: "Speaker name" }),
          b.text(roleLine(r), { x: 64, y: 896, w: 952, fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 800, fill: "#071C24", align: "center", label: "Role and organisation", name: "Role and organisation" }),
          ...chipEls.els.map((e) => ({ ...e, x: e.x + off, y: e.y + 960 })),
          b.rect({ x: 64, y: 1080, w: 952, h: 190, fill: "#071C24", cornerRadius: 28, name: "Details bar" }),
          b.text(r.webinar_title, { x: 100, y: 1104, w: 880, fontFamily: "Nunito", fontSize: fitSize(r.webinar_title, 880, 1, 40, 28, 0.55), fontWeight: 900, fill: "#FFFFFF", label: "Webinar title", name: "Webinar title" }),
          b.text(whenLine(r), { x: 100, y: 1170, w: 560, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 800, fill: "#2FD3EE", label: "Date and time", name: "Date and time" }),
          b.text(r.platform, { x: 640, y: 1170, w: 336, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 700, fill: "#FFFFFF", align: "right", label: "Platform", name: "Platform" }),
          b.text(r.series ? `${r.series} · Live webinar` : "Live webinar", { x: 100, y: 1222, w: 880, fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 500, fill: "#FFFFFF", opacity: 0.6, letterSpacing: 2, uppercase: true, label: "Series", name: "Series" }),
        ],
      },
    ];
  },
});

export const spDarkSplit = defineDataArt({
  id: "sp-dark-split",
  name: "Speaker Profile — Split Portrait (Dark)",
  category: "speakers",
  alsoIn: ["btd"],
  format: "ig-portrait",
  dataSource: "speakers",
  style: "Dark · full-height portrait panel · numbered expertise list",
  tags: ["speaker", "webinar", "dark", "split", "bio"],
  description: "Half-frame portrait with a soft fade, then name, role, bio and a numbered expertise list beside the date, time and platform.",
  pal: { paper: "#071C24", surface: "#0E2A33", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: "#2FD3EE" },
  sample: SAMPLE_SPEAKER,
  pages: (b, r) => {
    const nameSize = fitSize(r.name, 520, 2, 76, 44, 0.55);
    const nameLines = estLines(r.name, nameSize, 520, 0.55);
    const roleY = 250 + nameLines * nameSize * 1.04 + 10;
    const bioSize = r.bio.length > 300 ? 22 : 25;
    const bioY = roleY + 70;
    const bioH = estLines(r.bio, bioSize, 500, 0.5) * bioSize * 1.45;
    const listY = Math.min(bioY + bioH + 40, 900);
    return [
      {
        name: "Flyer",
        els: [
          photo(b, r, { x: 0, y: 0, w: 470, h: H, fill: "#0E2A33" }),
          b.rect({ x: 300, y: 0, w: 170, h: H, fill: "#071C24", gradient: ["#071C2400", "#071C24"], gradientAngle: 0, name: "Photo fade" }),
          ...texture(b, W, H, { light: false, dots: 0.1 }),
          logo(b, "dark", 520, 46, 100),
          b.text("@DAWB · @dawb_learn", { x: 640, y: 80, w: 380, fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: "#FFFFFF", align: "right", name: "Handles" }),
          eyebrow(b, r.series || "Webinar speaker", 524, 200, 500, "$accent", { label: "Series" }),
          b.text(r.name, { x: 520, y: 240, w: 520, fontFamily: "Nunito", fontSize: nameSize, fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.02, letterSpacing: -1.5, label: "Speaker name", name: "Speaker name" }),
          b.text(roleLine(r), { x: 524, y: roleY, w: 500, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 800, fill: "$accent", label: "Role and organisation", name: "Role and organisation" }),
          b.text(r.bio, { x: 524, y: bioY, w: 500, fontFamily: "Nunito Sans", fontSize: bioSize, fontWeight: 500, fill: "#FFFFFF", opacity: 0.8, lineHeight: 1.45, label: "Bio", name: "Bio", multiline: true }),
          ...splitList(r.expertise, 3).flatMap((t, i): DesignElement[] => [
            b.text(`0${i + 1}`, { x: 524, y: listY + i * 62, w: 60, fontFamily: "IBM Plex Mono", fontSize: 22, fontWeight: 500, fill: "$accent", name: `Expertise ${i + 1} number` }),
            b.text(t, { x: 584, y: listY - 4 + i * 62, w: 440, fontFamily: "Nunito", fontSize: 28, fontWeight: 900, fill: "#FFFFFF", label: `Expertise ${i + 1}`, name: `Expertise ${i + 1}` }),
          ]),
          b.rect({ x: 520, y: 1090, w: 496, h: 196, fill: "$surface", cornerRadius: 24, name: "Details card" }),
          b.text(r.webinar_title, { x: 548, y: 1112, w: 440, fontFamily: "Nunito", fontSize: fitSize(r.webinar_title, 440, 2, 30, 22, 0.55), fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.1, label: "Webinar title", name: "Webinar title", multiline: true }),
          b.text(whenLine(r), { x: 548, y: 1200, w: 440, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 800, fill: "$accent", label: "Date and time", name: "Date and time" }),
          b.text(r.platform, { x: 548, y: 1236, w: 440, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 700, fill: "#FFFFFF", opacity: 0.75, label: "Platform", name: "Platform" }),
        ],
      },
    ];
  },
});

export const spStory = defineDataArt({
  id: "sp-story",
  name: "Speaker Profile — Story (Arch)",
  category: "speakers",
  format: "story",
  dataSource: "speakers",
  style: "Story 9:16 · arch portrait · countdown-ready details",
  tags: ["speaker", "story", "status", "webinar"],
  description: "Vertical story: arch-framed portrait, name and role, expertise chips and a details stack for stories and WhatsApp status.",
  pal: { paper: "#F3F8F9", surface: "#E1ECEF", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  sample: SAMPLE_SPEAKER,
  pages: (b, r) => {
    const SH = 1920;
    const chips = chipRow(b, splitList(r.expertise, 3), 64, 1250, 952, { color: "$ink", size: 24, label: "Expertise" });
    return [
      {
        name: "Story",
        els: [
          ...texture(b, W, SH, { light: true, dots: 0.09 }),
          logo(b, "light", 60, 60, 120),
          ...pill(b, r.series || "Live webinar", 64, 240, { fill: "$primary", color: "#FFFFFF", dot: "#FFFFFF", size: 24, w: pillW(r.series || "Live webinar", 24) + 24, label: "Series" }),
          b.rect({ x: 190, y: 340, w: 700, h: 640, fill: "$surface", cornerRadius: 350, name: "Arch" }),
          photo(b, r, { x: 190, y: 340, w: 700, h: 640, radius: 350 }),
          b.text(r.name, { x: 64, y: 1020, w: 952, fontFamily: "Nunito", fontSize: fitSize(r.name, 952, 2, 96, 56, 0.55), fontWeight: 900, fill: "$ink", align: "center", letterSpacing: -2, lineHeight: 1.02, label: "Speaker name", name: "Speaker name" }),
          b.text(roleLine(r), { x: 64, y: 1150, w: 952, fontFamily: "Nunito Sans", fontSize: 34, fontWeight: 800, fill: "$primary", align: "center", label: "Role and organisation", name: "Role and organisation" }),
          ...chips.els.map((e) => ({ ...e, x: e.x + (952 - chips.els.filter((c) => c.type === "shape").reduce((m, c) => Math.max(m, c.x + c.width - 64), 0)) / 2 })),
          b.rect({ x: 64, y: 1400, w: 952, h: 360, fill: "$ink", cornerRadius: 36, name: "Details card" }),
          b.text(r.webinar_title, { x: 110, y: 1440, w: 860, fontFamily: "Nunito", fontSize: fitSize(r.webinar_title, 860, 2, 54, 36, 0.55), fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.08, label: "Webinar title", name: "Webinar title", multiline: true }),
          b.text(whenLine(r), { x: 110, y: 1610, w: 860, fontFamily: "Nunito", fontSize: 38, fontWeight: 900, fill: "#2FD3EE", label: "Date and time", name: "Date and time" }),
          b.text(`${r.platform}${r.registration_link ? `  ·  ${r.registration_link}` : ""}`, { x: 110, y: 1672, w: 860, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 700, fill: "#FFFFFF", opacity: 0.8, label: "Platform and link", name: "Platform and link" }),
        ],
      },
    ];
  },
});

export const spLinkedin = defineDataArt({
  id: "sp-linkedin",
  name: "Speaker Profile — LinkedIn / Event Banner",
  category: "speakers",
  format: "linkedin",
  dataSource: "speakers",
  style: "1200×627 · portrait circle · webinar title",
  tags: ["speaker", "linkedin", "banner", "event", "webinar"],
  description: "Wide banner for LinkedIn posts and events: portrait, name, role, webinar title and date.",
  pal: { paper: "#071C24", surface: "#0E2A33", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: "#2FD3EE" },
  sample: SAMPLE_SPEAKER,
  pages: (b, r) => [
    {
      name: "Banner",
      els: [
        ...texture(b, 1200, 627, { light: false, dots: 0.12, orbits: { color: "#2FD3EE", x: 960, y: 314, r: [200, 230, 270] } }),
        photo(b, r, { x: 790, y: 144, w: 340, h: 340, circle: true, fill: "#0E2A33" }),
        logo(b, "dark", 50, 40, 80),
        eyebrow(b, r.series ? `${r.series} · Speaker` : "Webinar speaker", 54, 150, 680, "$accent", { label: "Series" }),
        b.text(r.name, { x: 50, y: 188, w: 700, fontFamily: "Nunito", fontSize: fitSize(r.name, 700, 1, 68, 40, 0.55), fontWeight: 900, fill: "#FFFFFF", letterSpacing: -1, label: "Speaker name", name: "Speaker name" }),
        b.text(roleLine(r), { x: 54, y: 272, w: 680, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 800, fill: "$accent", label: "Role and organisation", name: "Role and organisation" }),
        b.text(r.webinar_title, { x: 54, y: 350, w: 680, fontFamily: "Nunito", fontSize: fitSize(r.webinar_title, 680, 2, 40, 28, 0.55), fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.1, label: "Webinar title", name: "Webinar title", multiline: true }),
        b.text(`${whenLine(r)}  ·  ${r.platform}`, { x: 54, y: 470, w: 680, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 800, fill: "#FFFFFF", opacity: 0.85, label: "Date, time and platform", name: "Date, time and platform" }),
        b.text("@DAWB · www.dawblearn.org", { x: 54, y: 560, w: 680, fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: "#FFFFFF", opacity: 0.6, name: "Handles" }),
      ],
    },
  ],
});

export const SPEAKER_FLYERS = [spEditorial, spCyanSpotlight, spDarkSplit, spStory, spLinkedin];

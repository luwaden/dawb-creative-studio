import type { DesignElement } from "@/lib/design/types";
import { badgeLogo, confetti, defineArt, dottedLine, dottedRing, handles, infoRows, logo, pill, sparkle, texture, type K } from "./kit";

/**
 * Beyond The Dashboard (BTD) — DAWB's webinar series. Ten distinct concepts.
 * Sample copy (topic, speaker, date) is placeholder text to be replaced.
 */

const TOPIC = "Turning Dashboards Into Decisions";
const SPEAKER = "Speaker Name";
const ROLE = "Role, Organisation";
const DATE = "Sat, 00 Month";
const TIME = "4:00 PM WAT";
const WHERE = "Google Meet";
const W = 1080;
const H = 1350;

function miniDashboard(b: K, x: number, y: number, w: number, h: number, o: { card: string; ink: string; accent: string; muted: string }): DesignElement[] {
  // Abstract dashboard: KPI tiles + bar chart + line chart. Pure decoration — no real data.
  const pad = 20;
  const tileH = Math.min(70, h * 0.18);
  const inner = h - pad * 2 - tileH - 12;
  const barsH = inner * 0.55;
  const lineH = inner - barsH - 10;
  return [
    b.rect({ x, y, w, h, fill: o.card, cornerRadius: 26, name: "Dashboard card" }),
    b.rect({ x: x + pad, y: y + pad, w: (w - pad * 3) / 2, h: tileH, fill: o.accent, opacity: 0.16, cornerRadius: 12, name: "KPI tile" }),
    b.rect({ x: x + pad * 2 + (w - pad * 3) / 2, y: y + pad, w: (w - pad * 3) / 2, h: tileH, fill: o.ink, opacity: 0.08, cornerRadius: 12, name: "KPI tile" }),
    b.chart("bar", { x: x + pad, y: y + pad + tileH + 12, w: w - pad * 2, h: barsH, values: [4, 7, 5, 9, 6, 11, 8], labels: [], showLabels: false, showValues: false, color: o.accent, secondaryColor: o.muted, name: "Decorative bars" }),
    b.chart("line", { x: x + pad, y: y + pad + tileH + 22 + barsH, w: w - pad * 2, h: Math.max(10, lineH), values: [3, 5, 4, 7, 6, 9, 12], labels: [], showLabels: false, showValues: false, color: o.ink, labelColor: o.ink, name: "Decorative line" }),
  ];
}

export const btdSplit = defineArt({
  id: "btd-split-dashboard",
  name: "BTD — Beyond the Dashboard (Bento)",
  category: "btd",
  format: "ig-portrait",
  style: "White bento grid · outlined display type",
  tags: ["btd", "webinar", "beyond the dashboard", "speaker", "bento"],
  description: "Outlined BEYOND over a bento grid: speaker portrait, episode card, date and time tiles and an abstract dashboard.",
  pal: { paper: "#FFFFFF", surface: "#EEF7F9", ink: "#071C24", muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, glow: { color: "#0097B2", x: 1000, y: 120, size: 900, opacity: 0.14 } }),
        logo(b, "light", 52, 40, 128),
        ...handles(b, 560, 70, 456, "$ink"),
        ...pill(b, "Live webinar", 64, 196, { fill: "$primary", color: "#FFFFFF", dot: "#FF4D4F", size: 22 }),
        b.text("BEYOND", { x: 56, y: 252, w: 980, fontFamily: "Nunito", fontSize: 212, fontWeight: 900, fill: "transparent", stroke: "$ink", strokeWidth: 3, letterSpacing: 2, label: "Series line 1", name: "Series line 1" }),
        b.text("THE DASHBOARD", { x: 60, y: 470, w: 980, fontFamily: "Nunito", fontSize: 104, fontWeight: 900, fill: "$primary", letterSpacing: -2, label: "Series line 2", name: "Series line 2" }),
        b.image({ x: 64, y: 610, w: 430, h: 560, cornerRadius: 30, placeholderFill: "$surface", hint: "Speaker portrait", label: "Speaker photo", name: "Speaker photo" }),
        b.rect({ x: 64, y: 1010, w: 430, h: 160, fill: "#071C24", fade: "up", cornerRadius: 30, opacity: 0.85, name: "Photo fade" }),
        b.text(SPEAKER, { x: 92, y: 1066, w: 380, fontFamily: "Nunito", fontSize: 38, fontWeight: 900, fill: "#FFFFFF", label: "Speaker name", name: "Speaker name" }),
        b.text(ROLE, { x: 92, y: 1112, w: 380, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 600, fill: "#FFFFFF", opacity: 0.8, label: "Speaker role", name: "Speaker role" }),
        b.rect({ x: 516, y: 610, w: 500, h: 300, fill: "$ink", cornerRadius: 30, name: "Topic card" }),
        b.text("EP. 07  ·  TOPIC", { x: 548, y: 640, w: 440, fontFamily: "JetBrains Mono", fontSize: 22, fontWeight: 700, fill: "$primary", letterSpacing: 2, label: "Episode", name: "Episode" }),
        b.text(TOPIC, { x: 548, y: 684, w: 440, fontFamily: "Nunito", fontSize: 50, fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.05, label: "Topic", name: "Topic" }),
        b.rect({ x: 516, y: 930, w: 240, h: 240, fill: "$primary", cornerRadius: 30, name: "Date tile" }),
        b.text("DATE", { x: 544, y: 956, w: 190, fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 900, fill: "#FFFFFF", opacity: 0.75, letterSpacing: 3, name: "Date label" }),
        b.text(DATE, { x: 544, y: 1040, w: 190, fontFamily: "Nunito", fontSize: 38, fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.05, label: "Date", name: "Date" }),
        ...miniDashboard(b, 776, 930, 240, 240, { card: "#EEF7F9", ink: "#071C24", accent: "#0097B2", muted: "#9FC9D2" }),
        b.text(`${TIME}  ·  ${WHERE}`, { x: 64, y: 1206, w: 700, fontFamily: "Nunito", fontSize: 34, fontWeight: 900, fill: "$ink", label: "Time & platform", name: "Time & platform" }),
        b.text("Register — link in bio", { x: 64, y: 1256, w: 700, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 700, fill: "$primary", label: "Call to action", name: "Call to action" }),
        dottedLine(b, 780, 1232, 236, "$primary", { gap: 12 }),
      ],
    },
  ],
});

export const btdCyan = defineArt({
  id: "btd-cyan-signal",
  name: "BTD — Cyan Signal",
  category: "btd",
  format: "ig-portrait",
  style: "Cyan · giant monogram · halftone · orbit portrait",
  tags: ["btd", "webinar", "cyan", "monogram", "halftone"],
  description: "Giant BTD monogram on brand cyan with a halftone field; speaker portrait in dotted orbits; navy info pills.",
  pal: { paper: "#0097B2", surface: "#0A7F96", ink: "#FFFFFF", muted: "#D4F3F8", primary: "#071C24", accent: "#FFFFFF" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, halftone: "#FFFFFF", glow: { color: "#003E4A", x: 100, y: 1300, size: 1300, opacity: 0.5 }, grain: 1.6 }),
        b.text("BTD", { x: -20, y: 150, w: 1120, fontFamily: "Nunito", fontSize: 470, fontWeight: 900, fill: "#FFFFFF", opacity: 0.14, letterSpacing: -30, name: "Monogram" }),
        logo(b, "cyan", 52, 40, 128),
        ...handles(b, 560, 70, 456, "#FFFFFF"),
        dottedRing(b, 760, 640, 310, "#FFFFFF", { opacity: 0.55, gap: 18 }),
        dottedRing(b, 760, 640, 370, "#071C24", { opacity: 0.4, dot: 3, gap: 12 }),
        b.image({ x: 510, y: 390, w: 500, h: 500, circle: true, placeholderFill: "$surface", hint: "Speaker portrait", label: "Speaker photo", name: "Speaker photo", stroke: "#FFFFFF", strokeWidth: 10 }),
        ...pill(b, "Beyond The Dashboard", 64, 220, { fill: "#071C24", color: "#FFFFFF", size: 22, label: "Series" }),
        b.text("WEBINAR\nSERIES", { x: 64, y: 300, w: 470, fontFamily: "Nunito", fontSize: 84, fontWeight: 900, fill: "#FFFFFF", lineHeight: 0.95, label: "Kicker", name: "Kicker" }),
        b.text("EP.07", { x: 64, y: 500, w: 400, fontFamily: "JetBrains Mono", fontSize: 54, fontWeight: 700, fill: "#071C24", label: "Episode", name: "Episode" }),
        b.text(TOPIC, { x: 64, y: 930, w: 952, fontFamily: "Nunito", fontSize: 78, fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.02, letterSpacing: -1, label: "Topic", name: "Topic" }),
        b.text(`with ${SPEAKER} · ${ROLE}`, { x: 64, y: 1110, w: 952, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 700, fill: "#D4F3F8", label: "Speaker line", name: "Speaker line" }),
        ...pill(b, DATE, 64, 1190, { fill: "#071C24", color: "#FFFFFF", size: 24, w: 300, label: "Date" }),
        ...pill(b, TIME, 380, 1190, { fill: "#071C24", color: "#FFFFFF", size: 24, w: 260, label: "Time" }),
        ...pill(b, WHERE, 656, 1190, { fill: "transparent", stroke: "#FFFFFF", color: "#FFFFFF", size: 24, w: 300, label: "Platform" }),
      ],
    },
  ],
});

export const btdTerminal = defineArt({
  id: "btd-night-terminal",
  name: "BTD — Night Terminal",
  category: "btd",
  format: "ig-portrait",
  style: "Dark · code terminal · neon cyan",
  tags: ["btd", "webinar", "dark", "sql", "terminal"],
  description: "A query in a terminal window asks the session question; outlined episode number; neon cyan glow and contour lines.",
  pal: { paper: "#000000", surface: "#0B1A20", ink: "#FFFFFF", muted: "#9FB4BB", primary: "#0097B2", accent: "#3CD3EC" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, contours: "#0097B2", glow: { color: "#0097B2", x: 980, y: 80, size: 1200, opacity: 0.5 } }),
        logo(b, "dark", 52, 40, 128),
        ...handles(b, 560, 70, 456, "#FFFFFF"),
        b.text("/// BEYOND THE DASHBOARD", { x: 64, y: 210, w: 952, fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 700, fill: "$accent", letterSpacing: 2, label: "Series", name: "Series" }),
        b.text("EP.07", { x: 56, y: 250, w: 980, fontFamily: "Nunito", fontSize: 250, fontWeight: 900, fill: "transparent", stroke: "$accent", strokeWidth: 3, letterSpacing: 0, label: "Episode", name: "Episode" }),
        b.rect({ x: 64, y: 540, w: 952, h: 330, fill: "$surface", cornerRadius: 26, stroke: "#0097B2", strokeWidth: 2, name: "Terminal" }),
        ...["#FF5F57", "#FEBC2E", "#28C840"].map((c, i) => b.shape("ellipse", { x: 96 + i * 34, y: 570, w: 18, h: 18, fill: c, name: "Window dot" })),
        b.text("> SELECT insight\n  FROM your_dashboard\n  WHERE question = 'so what?';", { x: 96, y: 624, w: 900, fontFamily: "JetBrains Mono", fontSize: 40, fontWeight: 500, fill: "#E6EDF3", lineHeight: 1.5, label: "Query", name: "Query" }),
        b.rect({ x: 96, y: 818, w: 22, h: 34, fill: "$accent", name: "Cursor" }),
        b.text(TOPIC, { x: 64, y: 910, w: 952, fontFamily: "Nunito", fontSize: 70, fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.04, label: "Topic", name: "Topic" }),
        b.image({ x: 64, y: 1100, w: 110, h: 110, circle: true, placeholderFill: "$surface", hint: "Speaker", label: "Speaker photo", name: "Speaker photo", stroke: "#0097B2", strokeWidth: 4 }),
        b.text(SPEAKER, { x: 196, y: 1112, w: 400, fontFamily: "Nunito", fontSize: 34, fontWeight: 900, fill: "#FFFFFF", label: "Speaker name", name: "Speaker name" }),
        b.text(ROLE, { x: 196, y: 1158, w: 400, fontFamily: "Nunito Sans", fontSize: 22, fill: "$muted", label: "Speaker role", name: "Speaker role" }),
        b.text(`${DATE}\n${TIME} · ${WHERE}`, { x: 600, y: 1112, w: 416, fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: 700, fill: "$accent", align: "right", lineHeight: 1.6, label: "When & where", name: "When & where" }),
        dottedLine(b, 64, 1250, 952, "#0097B2", { gap: 12, opacity: 0.6 }),
        b.text("REGISTER · LINK IN BIO", { x: 64, y: 1270, w: 952, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 900, fill: "#FFFFFF", letterSpacing: 4, align: "center", label: "Call to action", name: "Call to action" }),
      ],
    },
  ],
});

export const btdEditorial = defineArt({
  id: "btd-editorial-issue",
  name: "BTD — Editorial Issue",
  category: "btd",
  format: "ig-portrait",
  style: "Warm paper · magazine masthead · arch portrait",
  tags: ["btd", "webinar", "editorial", "magazine", "warm"],
  description: "Magazine-cover treatment on warm paper: tight masthead, arch portrait, fact list on dotted rules and a FREE sticker.",
  pal: { paper: "#F4EFE6", surface: "#E3D9C8", ink: "#141414", muted: "#6F675B", primary: "#0097B2", accent: "#FF6B3D" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.08 }),
        b.text("BTD", { x: 50, y: 40, w: 700, fontFamily: "Nunito", fontSize: 250, fontWeight: 900, fill: "$ink", letterSpacing: -16, lineHeight: 0.9, label: "Masthead", name: "Masthead" }),
        b.text("BEYOND THE DASHBOARD\nWEBINAR SERIES · ISSUE 07", { x: 600, y: 74, w: 416, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 900, fill: "$ink", letterSpacing: 3, align: "right", lineHeight: 1.5, label: "Masthead line", name: "Masthead line" }),
        ...badgeLogo(b, 916, 160, 100),
        b.rect({ x: 56, y: 290, w: 968, h: 4, fill: "$ink", name: "Rule" }),
        b.image({ x: 540, y: 330, w: 484, h: 760, cornerRadius: 242, placeholderFill: "$surface", hint: "Speaker portrait (vertical)", label: "Speaker photo", name: "Speaker photo" }),
        b.shape("star", { x: 430, y: 980, w: 190, h: 190, fill: "$accent", points: 18, innerRatio: 0.84, rotation: -12, name: "Sticker" }),
        b.text("FREE\nENTRY", { x: 430, y: 1040, w: 190, fontFamily: "Nunito", fontSize: 30, fontWeight: 900, fill: "#FFFFFF", align: "center", lineHeight: 1, rotation: -12, label: "Sticker text", name: "Sticker text" }),
        b.text("In this issue", { x: 56, y: 340, w: 440, fontFamily: "Nunito", fontSize: 30, fontWeight: 400, italic: true, fill: "$primary", label: "Kicker", name: "Kicker" }),
        b.text(TOPIC, { x: 56, y: 390, w: 460, fontFamily: "Nunito", fontSize: 74, fontWeight: 900, fill: "$ink", lineHeight: 1, letterSpacing: -2, label: "Topic", name: "Topic" }),
        b.text(`A conversation with ${SPEAKER}, ${ROLE}.`, { x: 56, y: 760, w: 440, fontFamily: "Nunito Sans", fontSize: 28, fill: "$muted", lineHeight: 1.4, label: "Standfirst", name: "Standfirst" }),
        ...infoRows(b, 56, 1150, 968, [["Date", DATE], ["Time", `${TIME} · ${WHERE}`]], { ink: "#141414", muted: "#6F675B", accent: "#141414", size: 34, gap: 80 }),
        b.text("www.dawblearn.org  ·  @dawb_learn", { x: 56, y: 1290, w: 968, fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: "$muted", letterSpacing: 2, name: "Footer" }),
      ],
    },
  ],
});

export const btdStory = defineArt({
  id: "btd-speaker-story",
  name: "BTD — Speaker Spotlight Story",
  category: "btd",
  alsoIn: ["story"],
  format: "story",
  style: "Dark story · orbit portrait · kinetic type",
  tags: ["btd", "story", "speaker", "instagram story"],
  description: "9:16 story: portrait inside triple dotted orbits, huge name, date chips and a swipe-up cue.",
  pal: { paper: "#020B10", surface: "#0B1A20", ink: "#FFFFFF", muted: "#9FB4BB", primary: "#0097B2", accent: "#3CD3EC" },
  pages: (b) => [
    {
      name: "Story",
      els: [
        ...texture(b, 1080, 1920, { light: false, glow: { color: "#0097B2", x: 540, y: 760, size: 1500, opacity: 0.45 }, contours: "#0097B2" }),
        logo(b, "dark", 60, 230, 120),
        ...pill(b, "BTD · Meet the speaker", 380, 262, { fill: "transparent", stroke: "#3CD3EC", color: "#FFFFFF", size: 22, w: 640 }),
        dottedRing(b, 540, 800, 330, "#3CD3EC", { opacity: 0.7 }),
        dottedRing(b, 540, 800, 400, "#FFFFFF", { opacity: 0.25, dot: 3, gap: 12 }),
        dottedRing(b, 540, 800, 470, "#0097B2", { opacity: 0.45, dot: 5, gap: 22 }),
        b.image({ x: 270, y: 530, w: 540, h: 540, circle: true, placeholderFill: "$surface", hint: "Speaker portrait", label: "Speaker photo", name: "Speaker photo" }),
        sparkle(b, 830, 520, 60, "#3CD3EC", 10),
        sparkle(b, 250, 1060, 40, "#FFFFFF"),
        b.text(SPEAKER.toUpperCase(), { x: 60, y: 1180, w: 960, fontFamily: "Nunito", fontSize: 104, fontWeight: 900, fill: "#FFFFFF", align: "center", lineHeight: 0.95, letterSpacing: -2, label: "Speaker name", name: "Speaker name" }),
        b.text(ROLE, { x: 60, y: 1300, w: 960, fontFamily: "Nunito Sans", fontSize: 34, fill: "$muted", align: "center", label: "Speaker role", name: "Speaker role" }),
        b.text(`“${TOPIC}”`, { x: 100, y: 1380, w: 880, fontFamily: "Nunito", fontSize: 50, fontWeight: 800, italic: true, fill: "$accent", align: "center", lineHeight: 1.1, label: "Topic", name: "Topic" }),
        ...pill(b, DATE, 170, 1560, { fill: "#0097B2", color: "#FFFFFF", size: 26, w: 360, label: "Date" }),
        ...pill(b, TIME, 550, 1560, { fill: "#FFFFFF", color: "#020B10", size: 26, w: 360, label: "Time" }),
        b.text("↑  SWIPE UP TO REGISTER", { x: 60, y: 1680, w: 960, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 900, fill: "#FFFFFF", align: "center", letterSpacing: 5, label: "Call to action", name: "Call to action" }),
      ],
    },
  ],
});

export const btdTomorrow = defineArt({
  id: "btd-tomorrow",
  name: "BTD — Tomorrow Reminder",
  category: "btd",
  format: "ig-square",
  style: "Cyan square · outlined countdown type",
  tags: ["btd", "reminder", "tomorrow", "square"],
  description: "Square reminder: TOMORROW in outline, the start time solid and huge, a LIVE pill.",
  pal: { paper: "#0097B2", surface: "#0A7F96", ink: "#FFFFFF", muted: "#D4F3F8", primary: "#071C24", accent: "#FFFFFF" },
  pages: (b) => [
    {
      name: "Reminder",
      els: [
        ...texture(b, 1080, 1080, { light: false, halftone: "#FFFFFF", glow: { color: "#003E4A", x: 0, y: 1080, size: 1200, opacity: 0.55 } }),
        logo(b, "cyan", 40, 30, 120),
        ...pill(b, "Live", 860, 64, { fill: "#E5484D", color: "#FFFFFF", dot: "#FFFFFF", size: 24, w: 160 }),
        b.text("TOMORROW", { x: 30, y: 216, w: 1040, fontFamily: "Nunito", fontSize: 158, fontWeight: 900, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 3, letterSpacing: 0, label: "Headline", name: "Headline" }),
        b.text("4PM", { x: 40, y: 380, w: 1000, fontFamily: "Nunito", fontSize: 330, fontWeight: 900, fill: "#071C24", letterSpacing: -14, lineHeight: 1, label: "Time", name: "Time" }),
        b.text("WAT", { x: 800, y: 440, w: 240, fontFamily: "Nunito", fontSize: 70, fontWeight: 900, fill: "#FFFFFF", label: "Time zone", name: "Time zone" }),
        b.text(`Beyond The Dashboard · ${TOPIC}`, { x: 44, y: 800, w: 992, fontFamily: "Nunito", fontSize: 44, fontWeight: 800, fill: "#FFFFFF", lineHeight: 1.15, label: "Session", name: "Session" }),
        b.text(`with ${SPEAKER}  ·  ${WHERE}`, { x: 44, y: 930, w: 992, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 700, fill: "#D4F3F8", label: "Speaker line", name: "Speaker line" }),
        dottedLine(b, 44, 1010, 992, "#FFFFFF", { gap: 14, opacity: 0.5 }),
      ],
    },
  ],
});

export const btdPanel = defineArt({
  id: "btd-panel",
  name: "BTD — Panel Discussion",
  category: "btd",
  format: "ig-portrait",
  style: "White · three-up portraits · hexagon accents",
  tags: ["btd", "panel", "speakers", "white"],
  description: "Three panellists in hexagon-ringed portraits, a bold title band and a dark details footer.",
  pal: { paper: "#FFFFFF", surface: "#E9F4F6", ink: "#071C24", muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, orbits: { color: "#0097B2", x: 1000, y: 120, r: [260, 380, 520] } }),
        b.shape("hexagon", { x: -120, y: 860, w: 420, h: 480, fill: "transparent", stroke: "#0097B2", strokeWidth: 3, opacity: 0.35, name: "Hexagon" }),
        logo(b, "light", 52, 40, 128),
        ...handles(b, 560, 70, 456, "$ink"),
        ...pill(b, "Beyond The Dashboard · Panel", 64, 210, { fill: "$ink", color: "#FFFFFF", size: 22, w: 520, label: "Series" }),
        b.text("Data, Decisions &\nthe People Behind Them", { x: 64, y: 290, w: 952, fontFamily: "Nunito", fontSize: 84, fontWeight: 900, fill: "$ink", lineHeight: 1, letterSpacing: -2, label: "Title", name: "Title" }),
        ...[0, 1, 2].flatMap((i) => {
          const x = 64 + i * 330;
          return [
            b.image({ x: x + 20, y: 560, w: 260, h: 260, circle: true, placeholderFill: "$surface", hint: `Panellist ${i + 1}`, label: `Panellist ${i + 1} photo`, name: `Panellist ${i + 1} photo`, stroke: i === 1 ? "#0097B2" : "#071C24", strokeWidth: 6 }),
            dottedRing(b, x + 150, 690, 158, "#0097B2", { opacity: 0.5, dot: 3, gap: 12 }),
            b.text(`Panellist ${i + 1}`, { x, y: 860, w: 300, fontFamily: "Nunito", fontSize: 32, fontWeight: 900, fill: "$ink", align: "center", label: `Panellist ${i + 1} name`, name: `Panellist ${i + 1} name` }),
            b.text("Role, Organisation", { x, y: 904, w: 300, fontFamily: "Nunito Sans", fontSize: 22, fill: "$muted", align: "center", label: `Panellist ${i + 1} role`, name: `Panellist ${i + 1} role` }),
          ];
        }),
        b.rect({ x: 0, y: 1030, w: W, h: 320, fill: "$ink", name: "Footer band" }),
        b.pattern("dotgrid", { x: 0, y: 1030, w: W, h: 320, color: "#FFFFFF", spacing: 30, size: 1.2, opacity: 0.12, name: "Footer dots", locked: true }),
        b.text(DATE, { x: 64, y: 1080, w: 460, fontFamily: "Nunito", fontSize: 60, fontWeight: 900, fill: "#FFFFFF", label: "Date", name: "Date" }),
        b.text(`${TIME}\n${WHERE}`, { x: 64, y: 1170, w: 460, fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 700, fill: "#9FDBE6", lineHeight: 1.4, label: "Time & platform", name: "Time & platform" }),
        ...pill(b, "Register · link in bio", 600, 1150, { fill: "$primary", color: "#FFFFFF", size: 24, w: 416, label: "Call to action" }),
      ],
    },
  ],
});

export const btdLive = defineArt({
  id: "btd-live-now",
  name: "BTD — We're Live Now",
  category: "btd",
  alsoIn: ["story"],
  format: "story",
  style: "Black story · broadcast red · big JOIN",
  tags: ["btd", "live", "story", "now"],
  description: "Broadcast-style LIVE NOW story with a red signal, speaker frame and a huge JOIN call.",
  pal: { paper: "#000000", surface: "#141414", ink: "#FFFFFF", muted: "#A3A3A3", primary: "#0097B2", accent: "#E5484D" },
  pages: (b) => [
    {
      name: "Story",
      els: [
        ...texture(b, 1080, 1920, { light: false, glow: { color: "#E5484D", x: 900, y: 360, size: 1100, opacity: 0.35 } }),
        logo(b, "dark", 60, 230, 120),
        ...pill(b, "Live now", 640, 262, { fill: "$accent", color: "#FFFFFF", dot: "#FFFFFF", size: 28, w: 380 }),
        b.rect({ x: 60, y: 440, w: 960, h: 700, fill: "$surface", cornerRadius: 40, stroke: "#E5484D", strokeWidth: 4, name: "Screen" }),
        b.image({ x: 84, y: 464, w: 912, h: 652, cornerRadius: 26, placeholderFill: "#1E1E1E", hint: "Speaker on camera / screenshot", label: "Screen photo", name: "Screen photo" }),
        b.rect({ x: 110, y: 1040, w: 360, h: 56, fill: "#000000", opacity: 0.7, cornerRadius: 12, name: "Name tag" }),
        b.text(SPEAKER, { x: 130, y: 1040, w: 340, h: 56, verticalAlign: "middle", fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 800, fill: "#FFFFFF", label: "Speaker name", name: "Speaker name" }),
        b.text("Beyond The Dashboard", { x: 60, y: 1200, w: 960, fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 800, fill: "$muted", letterSpacing: 4, uppercase: true, label: "Series", name: "Series" }),
        b.text(TOPIC, { x: 60, y: 1260, w: 960, fontFamily: "Nunito", fontSize: 76, fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.02, label: "Topic", name: "Topic" }),
        b.text("JOIN →", { x: 60, y: 1500, w: 960, fontFamily: "Nunito", fontSize: 200, fontWeight: 900, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 3, letterSpacing: 0, label: "Call to action", name: "Call to action" }),
        b.text(`${WHERE} · link in bio`, { x: 60, y: 1720, w: 960, fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 700, fill: "#FFFFFF", label: "Where", name: "Where" }),
      ],
    },
  ],
});

export const btdLinkedin = defineArt({
  id: "btd-linkedin-banner",
  name: "BTD — LinkedIn Event Banner",
  category: "btd",
  alsoIn: ["linkedin"],
  format: "linkedin",
  style: "Dark landscape · halftone portrait",
  tags: ["btd", "linkedin", "event", "banner"],
  description: "1200×627 LinkedIn event banner: title left, halftone-backed speaker portrait right.",
  pal: { paper: "#03141A", surface: "#0B1A20", ink: "#FFFFFF", muted: "#9FB4BB", primary: "#0097B2", accent: "#3CD3EC" },
  pages: (b) => [
    {
      name: "Banner",
      els: [
        ...texture(b, 1200, 627, { light: false, glow: { color: "#0097B2", x: 900, y: 300, size: 900, opacity: 0.5 } }),
        b.pattern("halftone", { x: 620, y: 0, w: 580, h: 627, color: "#0097B2", spacing: 22, size: 3.6, opacity: 0.55, name: "Halftone", locked: true }),
        logo(b, "dark", 40, 30, 100),
        b.text("BEYOND THE DASHBOARD · EP.07", { x: 56, y: 170, w: 640, fontFamily: "JetBrains Mono", fontSize: 20, fontWeight: 700, fill: "$accent", letterSpacing: 2, label: "Series", name: "Series" }),
        b.text(TOPIC, { x: 56, y: 210, w: 600, fontFamily: "Nunito", fontSize: 58, fontWeight: 900, fill: "#FFFFFF", lineHeight: 1.02, label: "Topic", name: "Topic" }),
        b.text(`${DATE}  ·  ${TIME}  ·  ${WHERE}`, { x: 56, y: 470, w: 640, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 800, fill: "#FFFFFF", label: "When & where", name: "When & where" }),
        b.text(`${SPEAKER} — ${ROLE}`, { x: 56, y: 520, w: 640, fontFamily: "Nunito Sans", fontSize: 22, fill: "$muted", label: "Speaker", name: "Speaker" }),
        dottedRing(b, 940, 330, 240, "#3CD3EC", { opacity: 0.7 }),
        b.image({ x: 740, y: 130, w: 400, h: 400, circle: true, placeholderFill: "$surface", hint: "Speaker portrait", label: "Speaker photo", name: "Speaker photo" }),
      ],
    },
  ],
});

export const btdThanks = defineArt({
  id: "btd-thank-you",
  name: "BTD — Thank You for Joining",
  category: "btd",
  format: "ig-portrait",
  style: "Cyan · recap stats · sparkles",
  tags: ["btd", "recap", "thank you", "stats"],
  description: "Post-event recap: thank-you headline, three stat cards (replace with real numbers) and the recording link.",
  pal: { paper: "#0097B2", surface: "#0A7F96", ink: "#FFFFFF", muted: "#D4F3F8", primary: "#071C24", accent: "#FFD24A" },
  pages: (b) => [
    {
      name: "Recap",
      els: [
        ...texture(b, W, H, { light: false, contours: "#FFFFFF", glow: { color: "#9BEFFF", x: 980, y: 120, size: 1100, opacity: 0.4 } }),
        ...confetti(b, W, H, ["#FFFFFF", "#FFD24A", "#071C24"], 26, 5, { x: 0, y: 160, w: W, h: 420 }),
        logo(b, "cyan", 52, 40, 128),
        ...handles(b, 560, 70, 456, "#FFFFFF"),
        b.text("Thank you\nfor joining.", { x: 64, y: 280, w: 952, fontFamily: "Nunito", fontSize: 150, fontWeight: 900, fill: "#FFFFFF", lineHeight: 0.95, letterSpacing: -4, label: "Headline", name: "Headline" }),
        b.text(`Beyond The Dashboard · ${TOPIC}`, { x: 64, y: 590, w: 952, fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 800, fill: "#071C24", label: "Session", name: "Session" }),
        ...[["[00]", "attendees"], ["[00]", "questions asked"], ["[00]", "countries"]].flatMap(([n, l], i) => {
          const x = 64 + i * 324;
          return [
            b.rect({ x, y: 700, w: 300, h: 300, fill: i === 1 ? "#071C24" : "#FFFFFF", cornerRadius: 30, name: "Stat card" }),
            b.text(n, { x: x + 30, y: 740, w: 240, fontFamily: "Nunito", fontSize: 96, fontWeight: 900, fill: i === 1 ? "#FFD24A" : "#0097B2", label: `Stat ${i + 1} value`, name: `Stat ${i + 1} value` }),
            b.text(l, { x: x + 30, y: 900, w: 240, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 800, fill: i === 1 ? "#FFFFFF" : "#071C24", label: `Stat ${i + 1} label`, name: `Stat ${i + 1} label` }),
          ];
        }),
        b.text("Replace [00] with the real numbers before posting.", { x: 64, y: 1020, w: 952, fontFamily: "Nunito Sans", fontSize: 18, fill: "#D4F3F8", label: "Note", name: "Note" }),
        ...pill(b, "Recording · link in bio", 64, 1110, { fill: "#071C24", color: "#FFFFFF", size: 28, w: 560, label: "Call to action" }),
        b.text("See you at the next episode.", { x: 64, y: 1230, w: 952, fontFamily: "Nunito", fontSize: 40, fontWeight: 800, italic: true, fill: "#FFFFFF", label: "Sign-off", name: "Sign-off" }),
      ],
    },
  ],
});

export const BTD = [btdSplit, btdCyan, btdTerminal, btdEditorial, btdStory, btdTomorrow, btdPanel, btdLive, btdLinkedin, btdThanks];

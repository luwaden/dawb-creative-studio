import type { DesignElement } from "@/lib/design/types";
import { defineArt, dottedLine, dottedRing, handles, logo, pill, texture, type K } from "./kit";
import { codeBlock, DEFAULT_QR, eyebrow, FORM_TEXT, memberCard, pin, qrCard, SAMPLE_MEMBERS } from "./kit2";

/**
 * Research: announcement, questionnaire call (QR) and research-team flyers.
 * Titles, dates and names are placeholders to be replaced.
 */
const W = 1080;
const H = 1350;
const STUDY = "How Nigerian Graduates Learn Data Skills";
const QUESTION = "What helps — and what stops — young graduates from building data careers?";

const ink = "#071C24";

export const rsAnnounceEditorial = defineArt({
  id: "rs-announce-editorial",
  name: "Research — Announcement (Editorial)",
  category: "research",
  format: "ig-portrait",
  style: "White editorial · Fraunces serif · numbered objectives",
  tags: ["research", "announcement", "study", "editorial", "serif"],
  description: "A journal-style cover announcing a new study: serif headline, research question, three objectives and a launch date.",
  pal: { paper: "#FBFAF7", surface: "#EEF4F5", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.08, contours: "#0097B2" }),
        logo(b, "light", 60, 46, 120),
        ...handles(b, 560, 70, 460, "$ink"),
        b.rect({ x: 64, y: 200, w: 952, h: 2, fill: "$ink", name: "Rule" }),
        eyebrow(b, "DAWB Research · Vol. 01", 64, 222, 600, "$primary", { label: "Series" }),
        b.text("New study", { x: 64, y: 222, w: 952, fontFamily: "IBM Plex Mono", fontSize: 22, fontWeight: 500, fill: "$muted", align: "right", letterSpacing: 3, uppercase: true, label: "Tag", name: "Tag" }),
        b.text("We're asking\na bigger question.", { x: 60, y: 300, w: 960, fontFamily: "Fraunces", fontSize: 104, fontWeight: 400, fill: "$ink", lineHeight: 1.02, letterSpacing: -2, label: "Headline", name: "Headline", multiline: true }),
        b.rect({ x: 64, y: 560, w: 8, h: 150, fill: "$primary", name: "Quote bar" }),
        b.text(QUESTION, { x: 100, y: 560, w: 880, fontFamily: "Fraunces", fontSize: 40, fontWeight: 400, italic: true, fill: "$ink", lineHeight: 1.25, label: "Research question", name: "Research question", multiline: true }),
        b.text(STUDY.toUpperCase(), { x: 64, y: 760, w: 952, fontFamily: "IBM Plex Sans", fontSize: 24, fontWeight: 700, fill: "$primary", letterSpacing: 2.5, label: "Study title", name: "Study title" }),
        ...["Map the learning paths graduates take", "Measure access to tools, mentors and data", "Recommend practical support programmes"].flatMap((t, i): DesignElement[] => [
          b.text(`0${i + 1}`, { x: 64, y: 830 + i * 112, w: 90, fontFamily: "Fraunces", fontSize: 54, fontWeight: 300, fill: "$primary", label: `Objective ${i + 1} number`, name: `Objective ${i + 1} number` }),
          b.text(t, { x: 170, y: 846 + i * 112, w: 840, fontFamily: "IBM Plex Sans", fontSize: 32, fontWeight: 500, fill: "$ink", label: `Objective ${i + 1}`, name: `Objective ${i + 1}` }),
          dottedLine(b, 64, 932 + i * 112, 952, "#071C24", { dot: 2.5, gap: 9, opacity: 0.25 }),
        ]),
        b.rect({ x: 64, y: 1190, w: 952, h: 100, fill: "$ink", cornerRadius: 50, name: "Launch bar" }),
        b.text("Survey opens", { x: 110, y: 1190, w: 400, h: 100, verticalAlign: "middle", fontFamily: "IBM Plex Sans", fontSize: 26, fontWeight: 500, fill: "#FFFFFF", opacity: 0.75, label: "Launch label", name: "Launch label" }),
        b.text("Mon, 00 Month 2026", { x: 400, y: 1190, w: 570, h: 100, verticalAlign: "middle", align: "right", fontFamily: "Nunito", fontSize: 36, fontWeight: 900, fill: "#FFFFFF", label: "Launch date", name: "Launch date" }),
      ],
    },
  ],
});

export const rsAnnounceCyan = defineArt({
  id: "rs-announce-cyan",
  name: "Research — New Study (Cyan Lens)",
  category: "research",
  format: "ig-portrait",
  style: "DAWB cyan · outlined NEW STUDY · lens rings",
  tags: ["research", "announcement", "cyan", "lens"],
  description: "Outlined NEW STUDY over a dotted lens with halftone texture; study title, focus areas and a coming-soon tag.",
  pal: { paper: "#0097B2", surface: "#0A7F95", ink: "#FFFFFF", muted: "#D6F3F8", primary: "#071C24", accent: "#FFFFFF" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.14, halftone: "#FFFFFF", orbits: { color: "#071C24", x: 780, y: 560, r: [200, 280, 380] } }),
        b.shape("ellipse", { x: 600, y: 380, w: 360, h: 360, fill: "#071C24", opacity: 0.12, name: "Lens" }),
        logo(b, "cyan", 60, 46, 120),
        ...handles(b, 560, 70, 460, "#FFFFFF"),
        ...pill(b, "Research · 2026", 64, 210, { fill: "#071C24", color: "#FFFFFF", size: 22 }),
        b.text("NEW", { x: 56, y: 280, w: 900, fontFamily: "Nunito", fontSize: 250, fontWeight: 900, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 3, letterSpacing: 2, label: "Headline 1", name: "Headline 1" }),
        b.text("STUDY", { x: 56, y: 510, w: 900, fontFamily: "Nunito", fontSize: 250, fontWeight: 900, fill: "#FFFFFF", letterSpacing: -4, label: "Headline 2", name: "Headline 2" }),
        b.text(STUDY, { x: 64, y: 790, w: 780, fontFamily: "Nunito", fontSize: 54, fontWeight: 900, fill: "#071C24", lineHeight: 1.08, label: "Study title", name: "Study title", multiline: true }),
        b.text("We're surveying graduates, students and early-career analysts across Nigeria.", { x: 64, y: 940, w: 760, fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 600, fill: "#FFFFFF", lineHeight: 1.4, label: "Summary", name: "Summary", multiline: true }),
        ...["Learning paths", "Access", "Careers"].flatMap((t, i): DesignElement[] => pill(b, t, 64 + i * 250, 1090, { fill: "transparent", stroke: "#FFFFFF", color: "#FFFFFF", size: 22, w: 230, label: `Focus ${i + 1}` })),
        dottedLine(b, 64, 1210, 952, "#FFFFFF", { dot: 3, gap: 12, opacity: 0.5 }),
        b.text("Questionnaire coming soon — watch this space", { x: 64, y: 1240, w: 952, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 800, fill: "#FFFFFF", label: "Footer", name: "Footer" }),
      ],
    },
  ],
});

export const rsSurveyQrWhite = defineArt({
  id: "rs-survey-qr-white",
  name: "Questionnaire — Scan & Share (White)",
  category: "research",
  format: "ig-portrait",
  style: "White · large QR card · scan brackets",
  tags: ["questionnaire", "survey", "qr", "call for participants", "form"],
  description: "Call for participants with a large scannable QR code, the form link, time to complete, deadline and privacy note.",
  pal: { paper: "#FFFFFF", surface: "#EEF7F9", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, glow: { color: "#0097B2", x: 760, y: 780, size: 900, opacity: 0.16 } }),
        logo(b, "light", 60, 46, 120),
        ...handles(b, 560, 70, 460, "$ink"),
        ...pill(b, "Call for participants", 64, 206, { fill: "$primary", color: "#FFFFFF", dot: "#FFFFFF", size: 22 }),
        b.text("Your answers\nshape our research.", { x: 60, y: 280, w: 960, fontFamily: "Nunito", fontSize: 88, fontWeight: 900, fill: "$ink", lineHeight: 1.02, letterSpacing: -1.5, label: "Headline", name: "Headline", multiline: true }),
        b.text(`${STUDY}. Take our short questionnaire.`, { x: 64, y: 486, w: 520, fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 600, fill: "$muted", lineHeight: 1.4, label: "Description", name: "Description", multiline: true }),
        ...qrCard(b, 620, 520, 340, { bracket: "#0097B2" }),
        b.text("SCAN ME", { x: 620, y: 930, w: 395, fontFamily: "IBM Plex Mono", fontSize: 24, fontWeight: 500, fill: "$primary", align: "center", letterSpacing: 6, name: "Scan label", label: "Scan label" }),
        ...([["Time", "About 5 minutes"], ["Closes", "Fri, 00 Month"], ["Privacy", "Anonymous"]] as Array<[string, string]>).flatMap(([k, v], i): DesignElement[] => [
          b.text(k.toUpperCase(), { x: 64, y: 700 + i * 110, w: 300, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "$muted", letterSpacing: 3, label: `${k} label`, name: `${k} label` }),
          b.text(v, { x: 64, y: 730 + i * 110, w: 500, fontFamily: "Nunito", fontSize: 38, fontWeight: 900, fill: "$ink", label: k, name: k }),
        ]),
        b.rect({ x: 64, y: 1060, w: 952, h: 110, fill: "$ink", cornerRadius: 55, name: "Link bar" }),
        b.text("Or open:", { x: 110, y: 1060, w: 200, h: 110, verticalAlign: "middle", fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 600, fill: "#FFFFFF", opacity: 0.7, name: "Link label" }),
        b.text(FORM_TEXT, { x: 260, y: 1060, w: 720, h: 110, verticalAlign: "middle", align: "right", fontFamily: "IBM Plex Mono", fontSize: 32, fontWeight: 500, fill: "#FFFFFF", label: "Form link (text)", name: "Form link (text)" }),
        b.text("Please share with graduates, students and early-career analysts.", { x: 64, y: 1210, w: 952, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 700, fill: "$ink", align: "center", label: "Share line", name: "Share line" }),
      ],
    },
  ],
});

export const rsSurveyQrDark = defineArt({
  id: "rs-survey-qr-dark",
  name: "Questionnaire — Your Voice, Our Data (Dark)",
  category: "research",
  format: "ig-portrait",
  style: "Dark · terminal grid · glowing QR",
  tags: ["questionnaire", "survey", "qr", "dark", "data"],
  description: "Night-mode questionnaire flyer: oversized type, a glowing QR card on a dotted grid and quick facts.",
  pal: { paper: "#050F13", surface: "#0B242D", ink: "#FFFFFF", muted: "#8FB3BC", primary: "#0097B2", accent: "#2FD3EE" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.18, glow: { color: "#0097B2", x: 540, y: 820, size: 1000, opacity: 0.35 } }),
        logo(b, "dark", 60, 46, 120),
        ...handles(b, 560, 70, 460, "#FFFFFF"),
        eyebrow(b, "> questionnaire.open()", 64, 214, 900, "$accent", { label: "Code line" }),
        b.text("YOUR VOICE.", { x: 56, y: 262, w: 970, fontFamily: "Nunito", fontSize: 128, fontWeight: 900, fill: "#FFFFFF", letterSpacing: -2, label: "Headline 1", name: "Headline 1" }),
        b.text("OUR DATA.", { x: 56, y: 400, w: 970, fontFamily: "Nunito", fontSize: 128, fontWeight: 900, fill: "transparent", stroke: "$accent", strokeWidth: 3, letterSpacing: 1, label: "Headline 2", name: "Headline 2" }),
        ...qrCard(b, 340, 590, 340, { bracket: "#2FD3EE", radius: 30 }),
        b.text("Scan to take the survey", { x: 64, y: 1000, w: 952, fontFamily: "Nunito", fontSize: 40, fontWeight: 900, fill: "#FFFFFF", align: "center", label: "Call to action", name: "Call to action" }),
        b.text(FORM_TEXT, { x: 64, y: 1056, w: 952, fontFamily: "IBM Plex Mono", fontSize: 28, fontWeight: 500, fill: "$accent", align: "center", label: "Form link (text)", name: "Form link (text)" }),
        b.rect({ x: 64, y: 1140, w: 952, h: 120, fill: "$surface", cornerRadius: 24, name: "Facts panel" }),
        ...["5 min", "Anonymous", "Closes 00/00"].flatMap((t, i): DesignElement[] => [
          b.text(t, { x: 64 + i * 317, y: 1140, w: 317, h: 120, verticalAlign: "middle", fontFamily: "Nunito", fontSize: 34, fontWeight: 900, fill: "#FFFFFF", align: "center", label: `Fact ${i + 1}`, name: `Fact ${i + 1}` }),
          ...(i < 2 ? [b.rect({ x: 64 + (i + 1) * 317, y: 1170, w: 2, h: 60, fill: "#FFFFFF", opacity: 0.2, name: "Divider" })] : []),
        ]),
      ],
    },
  ],
});

export const rsSurveyStory = defineArt({
  id: "rs-survey-story",
  name: "Questionnaire — Story (Scan Stack)",
  category: "research",
  format: "story",
  style: "Story 9:16 · stacked cards · QR",
  tags: ["questionnaire", "survey", "story", "qr", "status"],
  description: "Vertical story for Instagram/WhatsApp status: stacked question cards, a QR to scan and the link to tap.",
  pal: { paper: "#F3F8F9", surface: "#FFFFFF", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => {
    const SW = 1080;
    const SH = 1920;
    return [
      {
        name: "Story",
        els: [
          ...texture(b, SW, SH, { light: true, dots: 0.1 }),
          logo(b, "light", 60, 60, 130),
          ...pill(b, "2-minute survey", 64, 250, { fill: "$primary", color: "#FFFFFF", size: 26 }),
          b.text("Help us\nunderstand\nyour journey.", { x: 60, y: 340, w: 960, fontFamily: "Nunito", fontSize: 112, fontWeight: 900, fill: "$ink", lineHeight: 1.0, letterSpacing: -2, label: "Headline", name: "Headline", multiline: true }),
          ...["How did you first learn data skills?", "Which tools do you use most?", "What would help you most now?"].flatMap((q, i): DesignElement[] => [
            b.rect({ x: 64 + i * 22, y: 760 + i * 128, w: 900, h: 108, fill: "#FFFFFF", stroke: "#071C24", strokeWidth: 2, cornerRadius: 26, opacity: 1, rotation: i === 1 ? -1.5 : i === 2 ? 1.2 : 0, name: `Question card ${i + 1}` }),
            b.text(`Q${i + 1}`, { x: 96 + i * 22, y: 760 + i * 128, w: 90, h: 108, verticalAlign: "middle", fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 700, fill: "$primary", rotation: i === 1 ? -1.5 : i === 2 ? 1.2 : 0, name: `Question ${i + 1} number` }),
            b.text(q, { x: 180 + i * 22, y: 760 + i * 128, w: 760, h: 108, verticalAlign: "middle", fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 700, fill: "$ink", rotation: i === 1 ? -1.5 : i === 2 ? 1.2 : 0, label: `Sample question ${i + 1}`, name: `Sample question ${i + 1}` }),
          ]),
          ...qrCard(b, 320, 1200, 380, { bracket: "#0097B2" }),
          b.text(FORM_TEXT, { x: 64, y: 1700, w: 952, fontFamily: "IBM Plex Mono", fontSize: 32, fontWeight: 500, fill: "$ink", align: "center", label: "Form link (text)", name: "Form link (text)" }),
          b.text("Scan · or tap the link sticker", { x: 64, y: 1760, w: 952, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 700, fill: "$muted", align: "center", label: "Instruction", name: "Instruction" }),
        ],
      },
    ];
  },
});

export const rsSurveyTicket = defineArt({
  id: "rs-survey-ticket",
  name: "Questionnaire — Admit One (Ticket)",
  category: "research",
  format: "ig-portrait",
  style: "Warm paper · ticket stub · perforation · QR",
  tags: ["questionnaire", "survey", "ticket", "qr", "warm"],
  description: "A boarding-pass style ticket: your seat in the study, with a perforated QR stub and survey details.",
  pal: { paper: "#F4EBDD", surface: "#FFFDF8", ink: "#1E1A16", muted: "#7A6D5E", primary: "#0097B2", accent: "#D9542B" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.08, grain: 1.6 }),
        logo(b, "light", 60, 46, 110),
        ...handles(b, 560, 64, 460, "$ink"),
        b.text("Reserve your seat\nin our next study.", { x: 64, y: 200, w: 960, fontFamily: "Fraunces", fontSize: 74, fontWeight: 600, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline", multiline: true }),
        b.rect({ x: 64, y: 420, w: 952, h: 820, fill: "$surface", cornerRadius: 36, name: "Ticket" }),
        b.shape("ellipse", { x: 64 - 36, y: 840, w: 72, h: 72, fill: "$paper", name: "Notch left" }),
        b.shape("ellipse", { x: 1016 - 36, y: 840, w: 72, h: 72, fill: "$paper", name: "Notch right" }),
        dottedLine(b, 120, 876, 840, "#1E1A16", { dot: 4, gap: 14, opacity: 0.35 }),
        b.text("ADMIT ONE · RESEARCH PARTICIPANT", { x: 110, y: 470, w: 860, fontFamily: "IBM Plex Mono", fontSize: 22, fontWeight: 500, fill: "$accent", letterSpacing: 3, label: "Ticket tag", name: "Ticket tag" }),
        b.text(STUDY, { x: 110, y: 516, w: 860, fontFamily: "Nunito", fontSize: 54, fontWeight: 900, fill: "$ink", lineHeight: 1.08, label: "Study title", name: "Study title", multiline: true }),
        ...([["Duration", "5 min"], ["Format", "Online form"], ["Closes", "00 Month"]] as Array<[string, string]>).flatMap(([k, v], i): DesignElement[] => [
          b.text(k.toUpperCase(), { x: 110 + i * 290, y: 700, w: 270, fontFamily: "IBM Plex Mono", fontSize: 18, fontWeight: 500, fill: "$muted", letterSpacing: 3, label: `${k} label`, name: `${k} label` }),
          b.text(v, { x: 110 + i * 290, y: 730, w: 270, fontFamily: "Nunito", fontSize: 36, fontWeight: 900, fill: "$ink", label: k, name: k }),
        ]),
        b.qr(DEFAULT_QR, { x: 110, y: 930, w: 260, h: 260, fg: "#1E1A16", bg: "#FFFDF8", margin: 0, label: "Questionnaire link", name: "QR code" }),
        b.text("Scan to\nclaim your seat", { x: 410, y: 950, w: 560, fontFamily: "Nunito", fontSize: 48, fontWeight: 900, fill: "$ink", lineHeight: 1.05, label: "Call to action", name: "Call to action", multiline: true }),
        b.text(FORM_TEXT, { x: 410, y: 1090, w: 560, fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 500, fill: "$primary", label: "Form link (text)", name: "Form link (text)" }),
        b.text("Anonymous · No account needed", { x: 410, y: 1140, w: 560, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 700, fill: "$muted", label: "Privacy", name: "Privacy" }),
        b.text("Share the ticket — every response counts.", { x: 64, y: 1270, w: 952, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 700, fill: "$ink", align: "center", label: "Footer", name: "Footer" }),
      ],
    },
  ],
});

function teamGrid(b: K, pal: { ink: string; muted: string; accent: string; card: string; stroke?: string }, y0: number, members = SAMPLE_MEMBERS): DesignElement[] {
  const cols = 3;
  const gap = 22;
  const w = (W - 128 - gap * (cols - 1)) / cols;
  return members.flatMap((m, i) => memberCard(b, m, i, 64 + (i % cols) * (w + gap), y0 + Math.floor(i / cols) * (w * 0.5 + 300), w, { ...pal, photo: w * 0.5 }));
}

export const rsTeamGrid = defineArt({
  id: "rs-team-grid",
  name: "Research Team — Meet the Team (Grid)",
  category: "research",
  format: "ig-portrait",
  style: "White · six profile cards · dotted photo rings",
  tags: ["team", "research team", "members", "profiles", "meet the team"],
  description: "Six team cards with photo, name, profession and location under a clean MEET THE TEAM header.",
  pal: { paper: "#FFFFFF", surface: "#EEF4F5", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.08 }),
        logo(b, "light", 60, 46, 110),
        ...handles(b, 560, 64, 460, "$ink"),
        eyebrow(b, STUDY, 64, 200, 952, "$primary", { label: "Study" }),
        b.text("Meet the research team", { x: 60, y: 236, w: 960, fontFamily: "Nunito", fontSize: 76, fontWeight: 900, fill: "$ink", letterSpacing: -1.5, label: "Headline", name: "Headline" }),
        ...teamGrid(b, { ink, muted: "#5B6E75", accent: "#0097B2", card: "#F4F8F9" }, 370),
        dottedLine(b, 64, 1236, 952, "#071C24", { dot: 3, gap: 11, opacity: 0.3 }),
        b.text("Part of the DAWB research programme · www.dawblearn.org", { x: 64, y: 1262, w: 952, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 700, fill: "$muted", align: "center", label: "Footer", name: "Footer" }),
      ],
    },
  ],
});

export const rsTeamSpotlight = defineArt({
  id: "rs-team-spotlight",
  name: "Research Team — Member Spotlight (Dark)",
  category: "research",
  format: "ig-portrait",
  style: "Dark · large portrait · dotted orbit · location pin",
  tags: ["team", "spotlight", "member", "profile", "researcher"],
  description: "One team member in focus: large portrait inside dotted orbits, name, profession, location and their role in the study.",
  pal: { paper: "#071C24", surface: "#0E2A33", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: "#2FD3EE" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.12, orbits: { color: "#2FD3EE", x: 540, y: 600, r: [330, 380, 450] } }),
        logo(b, "dark", 60, 46, 110),
        ...handles(b, 560, 64, 460, "#FFFFFF"),
        b.image({ x: 250, y: 310, w: 580, h: 580, circle: true, placeholderFill: "$surface", hint: "Team member portrait", label: "Member photo", name: "Member photo" }),
        ...pill(b, "Research team", 380, 220, { fill: "$primary", color: "#FFFFFF", size: 22, w: 320 }),
        b.text("Member Name", { x: 64, y: 940, w: 952, fontFamily: "Nunito", fontSize: 88, fontWeight: 900, fill: "#FFFFFF", align: "center", letterSpacing: -1.5, label: "Name", name: "Name" }),
        b.text("Lead Researcher · Data Analyst", { x: 64, y: 1048, w: 952, fontFamily: "Nunito Sans", fontSize: 36, fontWeight: 700, fill: "$accent", align: "center", label: "Profession", name: "Profession" }),
        ...pin(b, 380, 1118, 30, "#2FD3EE"),
        b.text("Lagos, Nigeria", { x: 422, y: 1110, w: 400, fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 700, fill: "#FFFFFF", label: "Location", name: "Location" }),
        b.text("Leads questionnaire design and analysis for the study.", { x: 140, y: 1190, w: 800, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 500, fill: "$muted", align: "center", lineHeight: 1.4, label: "Role in study", name: "Role in study", multiline: true }),
      ],
    },
  ],
});

export const rsTeamCarousel = defineArt({
  id: "rs-team-carousel",
  name: "Research Team — Carousel (Cover + Members)",
  category: "research",
  format: "ig-portrait",
  style: "Cyan cover · white member slides",
  tags: ["team", "carousel", "members", "profiles"],
  description: "A swipeable carousel: cyan cover, then one slide per member with portrait, name, profession and location.",
  pal: { paper: "#FFFFFF", surface: "#EEF4F5", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Cover",
      bg: "#0097B2",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.14, contours: "#FFFFFF" }),
        logo(b, "cyan", 60, 46, 120),
        ...handles(b, 560, 70, 460, "#FFFFFF"),
        b.text("THE", { x: 60, y: 330, w: 960, fontFamily: "Nunito", fontSize: 120, fontWeight: 300, fill: "#FFFFFF", label: "Cover line 1", name: "Cover line 1" }),
        b.text("PEOPLE", { x: 52, y: 450, w: 1000, fontFamily: "Nunito", fontSize: 220, fontWeight: 900, fill: "#FFFFFF", letterSpacing: -6, label: "Cover line 2", name: "Cover line 2" }),
        b.text("behind the research", { x: 60, y: 690, w: 960, fontFamily: "Fraunces", fontSize: 80, fontWeight: 400, italic: true, fill: "#071C24", label: "Cover line 3", name: "Cover line 3" }),
        b.text(STUDY, { x: 64, y: 1080, w: 700, fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 800, fill: "#FFFFFF", lineHeight: 1.3, label: "Study title", name: "Study title", multiline: true }),
        b.text("Swipe →", { x: 760, y: 1180, w: 256, fontFamily: "Nunito", fontSize: 40, fontWeight: 900, fill: "#071C24", align: "right", label: "Swipe hint", name: "Swipe hint" }),
      ],
    },
    ...SAMPLE_MEMBERS.slice(0, 4).map((m, i) => ({
      name: `Member ${i + 1}`,
      els: [
        ...texture(b, W, H, { light: true, dots: 0.08 }),
        logo(b, "light", 60, 46, 100),
        b.text(`0${i + 1} / 04`, { x: 760, y: 70, w: 256, fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 500, fill: "$muted", align: "right", name: "Counter" }),
        dottedRing(b, 540, 560, 330, "#0097B2", { dot: 5, gap: 16, opacity: 0.8 }),
        b.image({ x: 240, y: 260, w: 600, h: 600, circle: true, placeholderFill: "$surface", hint: "Team member portrait", label: "Member photo", name: "Member photo" }),
        b.text(m.name, { x: 64, y: 940, w: 952, fontFamily: "Nunito", fontSize: 80, fontWeight: 900, fill: "$ink", align: "center", letterSpacing: -1, label: "Name", name: "Name" }),
        b.text(m.role, { x: 64, y: 1040, w: 952, fontFamily: "Nunito Sans", fontSize: 36, fontWeight: 700, fill: "$primary", align: "center", label: "Profession", name: "Profession" }),
        ...pin(b, 400, 1118, 28, "#0097B2"),
        b.text(m.location, { x: 440, y: 1110, w: 500, fontFamily: "Nunito Sans", fontSize: 30, fontWeight: 700, fill: "$muted", label: "Location", name: "Location" }),
      ],
    })),
  ],
});

export const rsLinkedinSurvey = defineArt({
  id: "rs-linkedin-survey",
  name: "Questionnaire — LinkedIn / Link Card",
  category: "research",
  format: "linkedin",
  style: "1200×627 · split · QR",
  tags: ["questionnaire", "survey", "linkedin", "qr", "banner"],
  description: "Wide card for LinkedIn and X: headline and details on the left, QR card on the right.",
  pal: { paper: "#FFFFFF", surface: "#EEF7F9", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, 1200, 627, { light: true, dots: 0.1 }),
        b.rect({ x: 800, y: 0, w: 400, h: 627, fill: "$primary", name: "Panel" }),
        b.pattern("halftone", { x: 800, y: 0, w: 400, h: 627, color: "#FFFFFF", spacing: 22, size: 3.4, opacity: 0.25, name: "Halftone", locked: true }),
        logo(b, "light", 50, 40, 86),
        eyebrow(b, "Call for participants", 54, 170, 700, "$primary", { label: "Eyebrow" }),
        b.text("Take our 5-minute\nresearch survey", { x: 50, y: 210, w: 720, fontFamily: "Nunito", fontSize: 62, fontWeight: 900, fill: "$ink", lineHeight: 1.04, label: "Headline", name: "Headline", multiline: true }),
        b.text(STUDY, { x: 54, y: 380, w: 700, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 600, fill: "$muted", label: "Study title", name: "Study title" }),
        b.text(FORM_TEXT, { x: 54, y: 470, w: 700, fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 500, fill: "$primary", label: "Form link (text)", name: "Form link (text)" }),
        b.text("@DAWB · www.dawblearn.org", { x: 54, y: 540, w: 700, fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 800, fill: "$ink", label: "Handles", name: "Handles" }),
        ...qrCard(b, 870, 160, 230, { bracket: "#FFFFFF" }),
      ],
    },
  ],
});

/** Questionnaire flyer with a sample SQL-ish "data request" panel — for data-collection drives. */
export const rsDataDrive = defineArt({
  id: "rs-data-drive",
  name: "Questionnaire — Data Collection Drive",
  category: "research",
  format: "ig-square",
  style: "Square · code panel · QR stub",
  tags: ["questionnaire", "data collection", "survey", "qr", "square"],
  description: "Square post for data-collection drives: a code-style 'data request' panel, response goal and QR.",
  pal: { paper: "#F5F9FA", surface: "#071C24", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Post",
      els: [
        ...texture(b, 1080, 1080, { light: true, dots: 0.1 }),
        logo(b, "light", 56, 44, 100),
        b.text("@dawb_learn", { x: 700, y: 70, w: 324, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 800, fill: "$ink", align: "right", name: "Handle" }),
        b.text("We need\nyour data.", { x: 56, y: 180, w: 560, fontFamily: "Nunito", fontSize: 96, fontWeight: 900, fill: "$ink", lineHeight: 1.0, letterSpacing: -2, label: "Headline", name: "Headline", multiline: true }),
        b.text("(Anonymously, of course.)", { x: 60, y: 390, w: 560, fontFamily: "Fraunces", fontSize: 38, fontWeight: 400, italic: true, fill: "$primary", label: "Subline", name: "Subline" }),
        ...codeBlock(b, [
          [["SELECT ", "k"], ["your_experience", "t"]],
          [["FROM ", "k"], ["learning_journey", "t"]],
          [["WHERE ", "k"], ["country = ", "t"], ["'Nigeria'", "s"], [";", "t"]],
          [["-- takes about 5 minutes", "c"]],
        ], 56, 500, 600, { bg: "#071C24", ink: "#FFFFFF", accent: "#2FD3EE", string: "#F2C14E", size: 26, h: 300 }),
        ...qrCard(b, 720, 520, 260, { bracket: "#0097B2" }),
        b.text(FORM_TEXT, { x: 56, y: 880, w: 968, fontFamily: "IBM Plex Mono", fontSize: 28, fontWeight: 500, fill: "$ink", label: "Form link (text)", name: "Form link (text)" }),
        b.text("Goal: 500 responses by 00 Month", { x: 56, y: 940, w: 968, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 800, fill: "$primary", label: "Goal", name: "Goal" }),
      ],
    },
  ],
});

export const RESEARCH = [rsAnnounceEditorial, rsAnnounceCyan, rsSurveyQrWhite, rsSurveyQrDark, rsSurveyStory, rsSurveyTicket, rsDataDrive, rsLinkedinSurvey, rsTeamGrid, rsTeamSpotlight, rsTeamCarousel];

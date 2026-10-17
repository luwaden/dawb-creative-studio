import type { DesignElement } from "@/lib/design/types";
import { bar, footer, H, header, M, rule, W, type B, type Theme } from "./common";
import { defineDesign } from "./define";
import { cinematic, closing, compare, imageTop, list, statement, textTop } from "./layouts";
import { THEMES } from "./themes";

const CW = W - M * 2;

// ─────────────────────────────── Post 1 ───────────────────────────────
export const post01 = defineDesign({
  id: "p01-first-researcher",
  name: "The First Researcher Was Standing Under the Stars",
  post: 1,
  phase: 1,
  category: "cinematic",
  format: "ig-portrait",
  style: "Cinematic editorial · cosmic",
  tags: ["curiosity", "origin", "stars", "launch"],
  description: "Campaign launch image. Full-bleed starry sky, hook in small caps at the top, serif title in the lower third.",
  theme: THEMES.cosmic,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        b.image({ x: 0, y: 0, w: W, h: H, placeholderFill: "$surface", hint: "Human silhouette beneath a Milky Way sky (African landscape)", label: "Main photo", name: "Main photo" }),
        b.pattern("stars", { x: 0, y: 0, w: W, h: H * 0.7, color: "#FFFFFF", spacing: 46, size: 1.6, opacity: 0.9, name: "Starfield" }),
        b.rect({ x: 0, y: H * 0.4, w: W, h: H * 0.6, fill: "$paper", fade: "up", name: "Legibility fade" }),
        ...header(b, t),
        b.text("Before the first laboratory. Before the first textbook. Before the first data set —", { x: M, y: 220, w: CW * 0.82, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 600, fill: "$muted", letterSpacing: 3, uppercase: true, lineHeight: 1.5, label: "Hook", name: "Hook" }),
        b.text("The first researcher wasn't in a lab.", { x: M, y: 820, w: CW, fontFamily: "Nunito", fontSize: 84, fontWeight: 700, fill: "$ink", lineHeight: 1.04, label: "Title line 1", name: "Title line 1" }),
        b.text("They were standing under the stars.", { x: M, y: 1004, w: CW, fontFamily: "Nunito", fontSize: 64, fontWeight: 400, italic: true, fill: "$accent", lineHeight: 1.08, label: "Title line 2", name: "Title line 2" }),
        b.text("…there was a human being who looked up at the sky and asked: why?", { x: M, y: 1172, w: CW * 0.8, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 300, fill: "$muted", lineHeight: 1.4, label: "Caption line", name: "Caption line" }),
        ...footer(b, t, "Read caption"),
      ],
    },
  ],
});

// ─────────────────────────────── Post 2 ───────────────────────────────
export const post02 = defineDesign({
  id: "p02-africa-first-research",
  name: "Africa Was the World's First Research Institution",
  post: 2,
  phase: 1,
  category: "carousel",
  format: "ig-portrait",
  style: "Archive documentary · gold + dark teal",
  tags: ["africa", "timbuktu", "kemet", "history", "pride"],
  description: "6-slide carousel: Timbuktu, Kemet, the Dogon astronomers and a DAWB closing slide.",
  theme: THEMES.archive,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        b.pattern("diagonal", { x: 0, y: 0, w: W, h: H, color: "$accent", spacing: 26, size: 1, opacity: 0.08, name: "Parchment texture", locked: true }),
        ...header(b, t),
        b.image({ x: 640, y: 190, w: 356, h: 700, placeholderFill: "$surface", hint: "Ancient map of Africa, golden manuscript overlay", label: "Map image", name: "Map image", cornerRadius: 4 }),
        b.rect({ x: M, y: 300, w: 420, h: 3, fill: "$accent", name: "Frame line" }),
        b.text("Africa", { x: M - 6, y: 340, w: 540, fontFamily: "Nunito", fontSize: 150, fontWeight: 900, fill: "$ink", lineHeight: 1, label: "Headline word", name: "Headline word" }),
        ...bar(b, "was the World's First", { x: M, y: 540, w: 520, fontSize: 36, font: "Nunito", fill: "$primary", label: "Bar text" }),
        b.text("Research Institution", { x: M, y: 630, w: 530, fontFamily: "Nunito", fontSize: 78, fontWeight: 700, fill: "$ink", lineHeight: 1.02, label: "Headline line 2", name: "Headline line 2" }),
        b.text("A history they didn't teach you in school", { x: M, y: 900, w: CW, fontFamily: "Nunito", fontSize: 46, fontWeight: 500, italic: true, fill: "$accent", label: "Subtext", name: "Subtext" }),
        b.text("The oldest university in the world wasn't in Europe. It was in Africa.", { x: M, y: 990, w: CW * 0.85, fontFamily: "Nunito Sans", fontSize: 30, fill: "$muted", lineHeight: 1.45, label: "Hook", name: "Hook" }),
        ...footer(b, t, "Swipe left →", { counter: "01 / 06" }),
      ],
    },
    { name: "Timbuktu", els: imageTop(b, t, { eyebrow: "14th century · Mali", headline: "Timbuktu — The First University", body: "University of Sankore. 14th century. 25,000 students. Nearly 1 million manuscripts covering astronomy, law, mathematics, and medicine.", imageHint: "Illustration of ancient Timbuktu, manuscript textures", counter: "02 / 06" }) },
    { name: "Kemet", els: textTop(b, t, { eyebrow: "Ancient Egypt", headline: "Kemet Built the Blueprint", body: "Ancient Egyptians developed early anatomy, surgical techniques, agricultural systems, and architectural mathematics — all documented in papyrus records.", imageHint: "Hieroglyphic data-visualisation aesthetic, papyrus texture", counter: "03 / 06" }) },
    {
      name: "Astronomers",
      els: [
        b.pattern("stars", { x: 0, y: 0, w: W, h: H, color: "$accent", spacing: 60, size: 1.4, opacity: 0.55, name: "Star map" }),
        ...imageTop(b, t, { eyebrow: "The Dogon people · Mali", headline: "The First Astronomers Were African", body: "The Dogon people of Mali had detailed knowledge of the Sirius star system — including its invisible companion star — centuries before European telescopes could confirm it.", imageHint: "Star map with African continent overlay", counter: "04 / 06", imageHeight: 520 }),
      ],
    },
    { name: "Exported from Africa", els: statement(b, t, { headline: "Research Wasn't Imported to Africa. It Was Exported FROM Africa.", body: "The mathematical systems, agricultural innovations, and early medical knowledge that traveled along trade routes — much of it originated on African soil.", counter: "05 / 06", footerLabel: "Swipe →", headlineBase: 88 }) },
    { name: "Closing", bg: "#0D1F26", els: closing(b, { ...t, ink: "#FFFFFF" }, { headline: "We Didn't Lose That Spirit. We're Reclaiming It.", body: "At DAWB, we train the next generation of African researchers and data professionals — to carry forward what our ancestors began.", cta: "Learn data & research with DAWB", counter: "06 / 06" }) },
  ],
});

// ─────────────────────────────── Post 4 ───────────────────────────────
function embers(b: B, count = 60): DesignElement[] {
  const out: DesignElement[] = [];
  let seed = 7;
  const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < count; i++) {
    const s = 3 + r() * 7;
    out.push(b.shape("ellipse", { x: r() * W, y: 600 + r() * 750, w: s, h: s, fill: "$accent", opacity: 0.25 + r() * 0.6, name: "Ember" }));
  }
  return out;
}

export const post04 = defineDesign({
  id: "p04-alexandria",
  name: "The Library of Alexandria Held the World's Knowledge",
  post: 4,
  phase: 1,
  category: "carousel",
  format: "ig-portrait",
  style: "Dramatic editorial · amber on charcoal",
  tags: ["alexandria", "documentation", "preservation", "history"],
  description: "5-slide carousel on documentation and the cost of losing knowledge. Teal only appears on the DAWB closing slide.",
  theme: THEMES.alexandria,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        b.image({ x: 0, y: 0, w: W, h: H, placeholderFill: "$surface", hint: "Burning library illustration, golden embers rising", label: "Cover image", name: "Cover image" }),
        b.rect({ x: 0, y: 300, w: W, h: H - 300, fill: "$paper", fade: "up", name: "Legibility fade" }),
        ...embers(b),
        ...header(b, t),
        b.text("400,000", { x: M - 8, y: 660, w: CW, fontFamily: "Nunito", fontSize: 210, fontWeight: 900, fill: "$ink", lineHeight: 1, letterSpacing: -6, label: "Big number", name: "Big number" }),
        b.text("Scrolls. Gone.", { x: M, y: 870, w: CW, fontFamily: "Nunito", fontSize: 110, fontWeight: 400, italic: true, fill: "$accent", lineHeight: 1, label: "Headline", name: "Headline" }),
        b.text("The day humanity lost centuries of progress", { x: M, y: 1040, w: CW, fontFamily: "Nunito Sans", fontSize: 32, fill: "$muted", label: "Subtext", name: "Subtext" }),
        ...footer(b, t, "Swipe →", { counter: "01 / 05" }),
      ],
    },
    { name: "Ancient cloud", els: imageTop(b, t, { eyebrow: "Built in 280 BC", headline: "The Library of Alexandria Was Ancient Humanity's Cloud.", body: "It held scrolls on medicine, astronomy, mathematics, and philosophy from Egypt, Greece, Persia, India, and beyond. It was the world's first research archive.", imageHint: "Architectural illustration, scroll texture", counter: "02 / 05" }) },
    { name: "We lost centuries", els: [...embers(b, 40), ...statement(b, t, { headline: "When It Burned, We Lost Centuries.", body: "Historians estimate that the destruction of Alexandria delayed several major scientific discoveries by 200–500 years. We may never know what we lost.", counter: "03 / 05", footerLabel: "Swipe →", headlineBase: 104 })] },
    {
      name: "Undocumented",
      els: [
        b.image({ x: 0, y: 0, w: W / 2, h: H, placeholderFill: "#3A2A1C", hint: "Old burning library", label: "Left image (history)", name: "Left image", grayscale: false }),
        b.image({ x: W / 2, y: 0, w: W / 2, h: H, placeholderFill: "#0E3440", hint: "Modern research database / server room", label: "Right image (today)", name: "Right image" }),
        b.rect({ x: 0, y: 380, w: W, h: H - 380, fill: "$paper", fade: "up", name: "Legibility fade" }),
        ...header(b, t),
        b.text("Undocumented Research Is Research That Never Happened.", { x: M, y: 760, w: CW, fontFamily: "Nunito", fontSize: 76, fontWeight: 600, italic: true, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        b.text("If it isn't written. If it isn't analyzed. If it isn't preserved and shared — it doesn't exist. The world cannot afford to lose more knowledge.", { x: M, y: 1000, w: CW, fontFamily: "Nunito Sans", fontSize: 28, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body" }),
        ...footer(b, t, "Swipe →", { counter: "04 / 05" }),
      ],
    },
    { name: "Closing", bg: "#0D1F26", els: closing(b, t, { headline: "At DAWB, We Don't Just Collect Data. We Preserve It.", body: "Every DAWB fellow documents, publishes, and preserves their research. We are building Africa's research archive — one project at a time.", cta: "DM us about the DAWB Research Fellowship", counter: "05 / 05" }) },
  ],
});

// ─────────────────────────────── Post 5 ───────────────────────────────
function callout(b: B, t: Theme, x: number, y: number, tx: number, ty: number, title: string, body: string, align: "left" | "right"): DesignElement[] {
  const w = 280;
  return [
    b.shape("line", { x: Math.min(x, tx), y, w: Math.abs(tx - x), h: 2, stroke: "$primary", strokeWidth: 2, fill: "transparent", name: "Annotation line" }),
    b.shape("ellipse", { x: x - 9, y: y - 9, w: 18, h: 18, fill: "$primary", name: "Annotation dot" }),
    b.text(title, { x: align === "left" ? tx : tx - w, y: ty, w, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 700, fill: "$ink", align, label: `${title} — title`, name: "Callout title" }),
    b.text(body, { x: align === "left" ? tx : tx - w, y: ty + 36, w, fontFamily: "Nunito Sans", fontSize: 21, fontWeight: 300, fill: "$muted", lineHeight: 1.4, align, label: `${title} — text`, name: "Callout text" }),
  ];
}

export const post05 = defineDesign({
  id: "p05-ishango-bone",
  name: "The Ishango Bone: Africa's 22,000-Year-Old Data Set",
  post: 5,
  phase: 1,
  category: "infographic",
  format: "ig-portrait",
  style: "Museum exhibit meets data dashboard",
  tags: ["ishango", "mathematics", "data", "congo", "infographic"],
  description: "Annotated, museum-style infographic. The bone image sits centre stage with teal annotation callouts.",
  theme: THEMES.museum,
  pages: (b, t) => [
    {
      name: "Infographic",
      els: [
        ...header(b, t),
        b.text("22,000 years ago, someone in what is now the Congo carved numbers into a bone.", { x: M, y: 196, w: CW, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 500, fill: "$muted", lineHeight: 1.4, label: "Hook", name: "Hook" }),
        b.text("The Ishango Bone", { x: M, y: 290, w: CW, fontFamily: "Nunito Sans", fontSize: 92, fontWeight: 700, fill: "$ink", letterSpacing: -2, label: "Title", name: "Title" }),
        ...bar(b, "Africa's first data set", { x: M, y: 404, w: 520, fontSize: 32, font: "Nunito Sans", label: "Bar text" }),
        b.image({ x: 400, y: 510, w: 280, h: 580, placeholderFill: "$surface", hint: "Ishango Bone photo", label: "Bone image", name: "Bone image", fit: "contain" }),
        ...callout(b, t, 430, 610, 84, 580, "Prime numbers", "Notches grouped in sequences researchers read as primes", "left"),
        ...callout(b, t, 650, 790, 996, 760, "Doubling", "Groups that appear to double — early arithmetic", "right"),
        ...callout(b, t, 440, 970, 84, 940, "Lunar calendar?", "Markings some researchers link to moon phases", "left"),
        b.text("Discovered in the Democratic Republic of Congo · c. 20,000 BCE", { x: M, y: 1124, w: CW, fontFamily: "JetBrains Mono", fontSize: 20, fill: "$muted", align: "center", label: "Source line", name: "Source line" }),
        b.text("“This is not a coincidence. This is data collection.”", { x: M, y: 1166, w: CW, fontFamily: "Nunito", fontSize: 40, fontWeight: 500, italic: true, fill: "$accent", align: "center", label: "Quote", name: "Quote" }),
        ...footer(b, t, "Read caption"),
      ],
    },
  ],
});

// ─────────────────────────────── Post 7 ───────────────────────────────
export const post07 = defineDesign({
  id: "p07-ibn-al-haytham",
  name: "Ibn al-Haytham Invented the Scientific Method",
  post: 7,
  phase: 1,
  category: "carousel",
  format: "ig-portrait",
  style: "Museum retrospective · deep teal, gold",
  tags: ["scientific method", "history", "scholars", "portrait"],
  description: "4-slide portrait carousel: the portrait, what he discovered, the 600-year gap and a DAWB close.",
  theme: THEMES.heritage,
  pages: (b, t) => [
    {
      name: "Portrait",
      els: [
        ...header(b, t),
        b.image({ x: M, y: 190, w: CW, h: 720, placeholderFill: "$surface", hint: "Illustrated portrait of Ibn al-Haytham, golden light", label: "Portrait", name: "Portrait", cornerRadius: 4 }),
        b.text("965 CE. Basra.", { x: M, y: 950, w: CW, fontFamily: "Nunito", fontSize: 40, fontWeight: 500, italic: true, fill: "$accent", label: "Date line", name: "Date line" }),
        b.text("He invented the scientific method.", { x: M, y: 1010, w: CW, fontFamily: "Nunito", fontSize: 76, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        ...footer(b, t, "Swipe →", { counter: "01 / 04" }),
      ],
    },
    { name: "What he discovered", els: list(b, t, { eyebrow: "Ibn al-Haytham · Alhazen", headline: "What He Discovered", items: ["Controlled experiments", "Peer review concept", "Theory of optics", "Light travels from objects to eyes", "Critical self-questioning"], counter: "02 / 04", marker: "dot" }) },
    { name: "The gap", els: compare(b, t, { headline: "Europe Called It 'The Scientific Method' — 600 Years Later", left: { label: "965 CE", items: ["Controlled experiments", "Peer verification", "Optics & light"] }, right: { label: "1600s", items: ["Roger & Francis Bacon systematise", "Named “the scientific method”", "The credit… redistributed"] }, body: "The method was his.", counter: "03 / 04", footerLabel: "Swipe →" }) },
    { name: "Closing", els: closing(b, t, { headline: "Research Has Always Been a Global Human Project.", body: "At DAWB, we are training researchers in the tradition of every scholar who ever dared to ask a question — regardless of geography, regardless of recognition.", cta: "Who else should we feature? Comment below", counter: "04 / 04" }) },
  ],
});

// ─────────────────────────────── Post 8 ───────────────────────────────
export const post08 = defineDesign({
  id: "p08-phase1-recap",
  name: "Phase 1 Recap — Research Began in You",
  post: 8,
  phase: 1,
  category: "recap",
  format: "ig-portrait",
  style: "Golden hour · literary",
  tags: ["recap", "phase 1", "transition"],
  description: "Single cinematic image closing Phase 1: a road at golden hour, contemplative italic serif.",
  theme: THEMES.golden,
  pages: (b, t) => [
    {
      name: "Recap",
      els: [
        ...cinematic(b, t, {
          eyebrow: "Phase 1 · The Origin of Research",
          headline: "Research didn't begin in a lab.\nIt began in you.",
          body: "We've been asking questions for 22,000 years. We're just getting started.",
          imageHint: "Long road at golden hour stretching to the horizon (African savanna)",
          footerLabel: "Phase 2 begins next week",
          headlineBase: 84,
        }).map((el) => (el.type === "text" && el.name === "Headline" ? { ...el, italic: true, fontWeight: 500 } : el)),
      ],
    },
  ],
});

export const PHASE1 = [post01, post02, post04, post05, post07, post08];

// Shared unused-import guard for helpers used only in some phases.
void rule;

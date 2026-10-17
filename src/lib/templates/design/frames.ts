import { bar, header, HANDLES, M, rule } from "./common";
import { defineDesign } from "./define";
import { THEMES } from "./themes";

const SW = 1080;
const SH = 1920;
const SCW = SW - M * 2;

export const reelOutro = defineDesign({
  id: "f-reel-outro",
  name: "Reel Outro Frame",
  post: null,
  phase: null,
  category: "story",
  format: "story",
  style: "DAWB brand identity",
  tags: ["reel", "outro", "closing frame", "tagline"],
  description: "Closing frame for every reel (calendar template system). Tagline, logo and website.",
  theme: THEMES.brand,
  pages: (b, t) => [
    {
      name: "Outro",
      els: [
        b.pattern("stars", { x: 0, y: 0, w: SW, h: SH, color: "#FFFFFF", spacing: 70, size: 1.4, opacity: 0.5, name: "Starfield" }),
        { ...b.logo(t.logo, { x: SW / 2 - 110, y: 560, w: 220, name: "Logo" }), cornerRadius: 28 },
        b.text("Research built civilization.", { x: M, y: 880, w: SCW, fontFamily: "Nunito Sans", fontSize: 70, fontWeight: 700, fill: "$ink", align: "center", lineHeight: 1.1, label: "Tagline 1", name: "Tagline 1" }),
        b.text("DAWB is building the researchers.", { x: M, y: 1050, w: SCW, fontFamily: "Nunito Sans", fontSize: 70, fontWeight: 700, fill: "$primary", align: "center", lineHeight: 1.1, label: "Tagline 2", name: "Tagline 2" }),
        ...bar(b, "Cohort 3. Apply now.", { x: SW / 2 - 300, y: 1300, w: 600, fontSize: 36, font: "Nunito Sans", label: "Call to action" }),
        b.text(HANDLES.website, { x: M, y: 1520, w: SCW, fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 700, fill: "$ink", align: "center", letterSpacing: 2, label: "Website", name: "Website" }),
        b.text(`${HANDLES.social} · ${HANDLES.pro}`, { x: M, y: 1580, w: SCW, fontFamily: "Nunito Sans", fontSize: 28, fill: "$muted", align: "center", label: "Handles", name: "Handles" }),
      ],
    },
  ],
});

export const storyPreview = defineDesign({
  id: "f-story-preview",
  name: "Weekly Story Preview",
  post: null,
  phase: null,
  category: "story",
  format: "story",
  style: "Teaser · light",
  tags: ["story", "preview", "teaser", "thursday"],
  description: "Thursday behind-the-scenes preview of Friday's post (engagement rituals). Text stays inside the 1080×1420 safe zone.",
  theme: THEMES.brandLight,
  pages: (b, t) => [
    {
      name: "Preview",
      els: [
        ...header(b, t, { top: 300 }),
        b.text("Tomorrow on DAWB", { x: M, y: 520, w: SCW, fontFamily: "JetBrains Mono", fontSize: 32, fontWeight: 500, fill: "$primary", uppercase: true, letterSpacing: 3, label: "Eyebrow", name: "Eyebrow" }),
        b.text("The oldest university in the world wasn't in Europe.", { x: M, y: 590, w: SCW, fontFamily: "Nunito", fontSize: 92, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Teaser", name: "Teaser" }),
        b.image({ x: M, y: 1000, w: SCW, h: 470, placeholderFill: "$surface", hint: "Sneak peek of Friday's cover", label: "Preview image", name: "Preview image", cornerRadius: 8 }),
        b.text("Friday · 7:30 PM", { x: M, y: 1530, w: SCW, fontFamily: "Nunito Sans", fontSize: 34, fontWeight: 700, fill: "$ink", label: "When", name: "When" }),
      ],
    },
  ],
});

export const phasePoll = defineDesign({
  id: "f-phase-poll-story",
  name: "Phase Transition Poll Story",
  post: null,
  phase: null,
  category: "story",
  format: "story",
  style: "Engagement · dark",
  tags: ["story", "poll", "phase transition", "engagement"],
  description: "Story for phase recap weeks: 'Which post from this phase was most powerful for you?' Leave space for the platform poll sticker.",
  theme: THEMES.brand,
  pages: (b, t) => [
    {
      name: "Poll",
      els: [
        ...header(b, t, { top: 300 }),
        b.text("Phase 1 · The Origin of Research", { x: M, y: 540, w: SCW, fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 600, fill: "$primary", uppercase: true, letterSpacing: 3, label: "Phase", name: "Phase" }),
        b.text("Which post from this phase was most powerful for you?", { x: M, y: 610, w: SCW, fontFamily: "Nunito Sans", fontSize: 92, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Question", name: "Question" }),
        b.rect({ x: M, y: 1080, w: SCW, h: 320, fill: "$surface", cornerRadius: 16, opacity: 0.6, name: "Poll sticker area" }),
        b.text("Add poll sticker here", { x: M, y: 1220, w: SCW, fontFamily: "Nunito Sans", fontSize: 26, fill: "$muted", align: "center", label: "Sticker hint", name: "Sticker hint" }),
      ],
    },
  ],
});

export const reelCover17 = defineDesign({
  id: "f-reel-cover-60-seconds",
  name: "Reel Cover — Every 60 Seconds",
  post: 17,
  phase: 3,
  category: "story",
  alsoIn: ["reel"],
  format: "story",
  style: "Data counter · electric teal",
  tags: ["reel cover", "data", "60 seconds", "grid"],
  description: "Designed cover frame for the Post 17 reel, so the profile grid stays consistent.",
  theme: THEMES.tech,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        b.pattern("dots", { x: 0, y: 0, w: SW, h: SH, color: "$primary", spacing: 44, size: 1.6, opacity: 0.3, name: "Data dots" }),
        ...header(b, t, { top: 300 }),
        b.text("00:60", { x: M, y: 560, w: SCW, fontFamily: "JetBrains Mono", fontSize: 200, fontWeight: 700, fill: "$primary", label: "Timer", name: "Timer" }),
        b.text("Every 60 seconds, the internet generates more data than Alexandria held in its entire lifetime.", { x: M, y: 860, w: SCW, fontFamily: "Nunito Sans", fontSize: 72, fontWeight: 700, fill: "$ink", lineHeight: 1.08, label: "Headline", name: "Headline" }),
        rule(b, M, 1380, 120),
        b.text("Most of it will never be used.", { x: M, y: 1420, w: SCW, fontFamily: "Nunito Sans", fontSize: 38, fill: "$muted", label: "Line", name: "Line" }),
      ],
    },
  ],
});

export const reelCover30 = defineDesign({
  id: "f-reel-cover-movement",
  name: "Reel Cover — You Are the Research Revolution",
  post: 30,
  phase: 4,
  category: "story",
  alsoIn: ["reel"],
  format: "story",
  style: "Cinematic · stars callback",
  tags: ["reel cover", "manifesto", "movement"],
  description: "Cover frame for the Post 30 campaign manifesto reel. Calls back to the Week 1 starry sky.",
  theme: THEMES.cosmic,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        b.image({ x: 0, y: 0, w: SW, h: SH, placeholderFill: "$surface", hint: "Milky Way — callback to Week 1", label: "Background photo", name: "Background photo" }),
        b.pattern("stars", { x: 0, y: 0, w: SW, h: SH * 0.7, color: "#FFFFFF", spacing: 50, size: 1.6, opacity: 0.9, name: "Starfield" }),
        b.rect({ x: 0, y: 700, w: SW, h: SH - 700, fill: "$paper", fade: "up", name: "Fade" }),
        ...header(b, t, { top: 300 }),
        b.text("You are the research revolution.", { x: M, y: 1050, w: SCW, fontFamily: "Nunito", fontSize: 108, fontWeight: 700, fill: "$ink", lineHeight: 1.03, label: "Headline", name: "Headline" }),
        b.text("22,000 years of human curiosity. One continent with the youngest population on Earth.", { x: M, y: 1420, w: SCW, fontFamily: "Nunito Sans", fontSize: 34, fontWeight: 300, fill: "$muted", lineHeight: 1.4, label: "Line", name: "Line" }),
      ],
    },
  ],
});

export const linkedinRecap = defineDesign({
  id: "f-linkedin-recap-article",
  name: "LinkedIn Article Header — Phase Recap",
  post: 24,
  phase: 3,
  category: "linkedin",
  alsoIn: ["recap"],
  format: "linkedin",
  style: "Professional · deep teal",
  tags: ["linkedin", "article", "recap", "header"],
  description: "1200×627 header for publishing phase recaps (Posts 8, 16, 24, 32) as LinkedIn articles.",
  theme: THEMES.manifesto,
  pages: (b, t) => [
    {
      name: "Header",
      els: [
        b.pattern("grid", { x: 0, y: 0, w: 1200, h: 627, color: "$primary", spacing: 60, size: 1, opacity: 0.15, name: "Grid", locked: true }),
        ...header(b, t, { width: 1200, scale: 0.8, top: 44 }),
        b.text("Phase 3 Recap · The Age of Data", { x: 68, y: 190, w: 900, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 600, fill: "$primary", uppercase: true, letterSpacing: 3, label: "Eyebrow", name: "Eyebrow" }),
        b.text("Data Is Not the Future. It Is the Present. And Africa Is Behind.", { x: 68, y: 236, w: 1000, fontFamily: "Nunito Sans", fontSize: 58, fontWeight: 700, fill: "$ink", lineHeight: 1.08, label: "Headline", name: "Headline" }),
        b.text("DAWB Data & Research Center · www.dawblearn.org", { x: 68, y: 540, w: 900, fontFamily: "Nunito Sans", fontSize: 22, fill: "$muted", label: "Byline", name: "Byline" }),
      ],
    },
  ],
});

export const FRAMES = [reelOutro, storyPreview, phasePoll, reelCover17, reelCover30, linkedinRecap];

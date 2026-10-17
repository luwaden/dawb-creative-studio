import type { DesignElement } from "@/lib/design/types";
import { bar, footer, H, header, HANDLES, M, rule, W, type B } from "./common";
import { defineDesign } from "./define";
import { cinematic, closing, imageTop, list, statement } from "./layouts";
import { THEMES, swapTones } from "./themes";

const CW = W - M * 2;

export const post26 = defineDesign({
  id: "p26-graduate-spotlight",
  name: "Graduate Spotlight — She Used to Think Research Was for Academics",
  post: 26,
  phase: 4,
  category: "spotlight",
  alsoIn: ["carousel"],
  format: "ig-portrait",
  style: "Sunday-magazine portrait profile",
  tags: ["graduate", "story", "portrait", "transformation"],
  description: "5-slide portrait carousel: portrait, before, turning point, after, reflection. Bracketed fields come from the calendar — replace them with the real graduate's details.",
  theme: THEMES.profile,
  pages: (b, t) => [
    { name: "Portrait", bg: "#2B2119", els: swapTones(cinematic(b, t, { eyebrow: "Graduate Spotlight", headline: "[Name]. DAWB Graduate.", body: "She thought research wasn't for her. She was wrong.", imageHint: "Graduate portrait — warm, confident, natural light", counter: "01 / 05", footerLabel: "Swipe →" })).map((el) => (el.type === "shape" && el.name === "Legibility fade" ? { ...el, fill: "#2B2119" } : el)) },
    { name: "Before", els: statement(b, t, { eyebrow: "Before DAWB:", headline: "[Her starting point — background and prior relationship with data.]", body: "No education or credentials required. The humanity of the starting point.", counter: "02 / 05", footerLabel: "Swipe →", headlineBase: 70, quote: true }) },
    { name: "Turning point", els: imageTop(b, t, { eyebrow: "Week 3 at DAWB:", headline: "[The specific moment the shift happened.]", body: "A project, a realization, a visualization that made something click.", imageHint: "Her actual Power BI dashboard / analysis (with permission)", counter: "03 / 05" }) },
    { name: "After", els: imageTop(b, t, { eyebrow: "After DAWB:", headline: "[Current role, project, impact.]", body: "Where she is now. What her data and research work has produced.", imageHint: "Portrait in professional context — working or presenting", counter: "04 / 05" }) },
    {
      name: "Reflection",
      bg: "#0D1F26",
      els: [
        b.text("“", { x: M - 10, y: 220, w: 200, fontFamily: "Cormorant Garamond", fontSize: 260, fontWeight: 600, fill: "#0097B2", label: "Quote mark", name: "Quote mark" }),
        b.text("[Direct quote from the graduate — authentic, unpolished, real.]", { x: M, y: 440, w: CW, fontFamily: "Cormorant Garamond", fontSize: 66, fontWeight: 500, italic: true, fill: "#FFFFFF", lineHeight: 1.15, label: "Quote", name: "Quote" }),
        b.text("— [Name], DAWB Cohort [X]", { x: M, y: 760, w: CW, fontFamily: "Inter", fontSize: 28, fontWeight: 600, fill: "#A9BAC2", label: "Attribution", name: "Attribution" }),
        ...bar(b, "Cohort 3 is forming — be the next story we tell", { x: M, y: 1000, w: CW, fontSize: 28, font: "Inter", label: "Call to action" }),
        ...swapTones(header(b, t)),
        b.text("www.dawblearn.org", { x: M, y: H - 90, w: CW, fontFamily: "Inter", fontSize: 24, fontWeight: 700, fill: "#0097B2", letterSpacing: 2, name: "Website" }),
      ],
    },
  ],
});

function projectSlide(b: B, n: number, counter: string, topic: string): DesignElement[] {
  const rows: Array<[string, string]> = [
    ["Research topic", topic],
    ["Fellow", "[Name], Cohort [X]"],
    ["Method", "[e.g. 200-person survey, interview data, geographic mapping]"],
  ];
  const els: DesignElement[] = [
    b.text(`Research project ${n}`, { x: M, y: 200, w: CW, fontFamily: "JetBrains Mono", fontSize: 24, fontWeight: 500, fill: "$primary", uppercase: true, letterSpacing: 2, label: "Eyebrow", name: "Eyebrow" }),
  ];
  rows.forEach(([k, v], i) => {
    els.push(
      b.text(k, { x: M, y: 260 + i * 92, w: 260, fontFamily: "Inter", fontSize: 22, fill: "$muted", label: `${k} label`, name: `${k} label` }),
      b.text(v, { x: M + 270, y: 256 + i * 92, w: CW - 270, fontFamily: "Space Grotesk", fontSize: 30, fontWeight: 600, fill: "$ink", lineHeight: 1.25, label: k, name: k }),
    );
  });
  els.push(
    b.image({ x: M, y: 560, w: CW, h: 420, placeholderFill: "$surface", hint: "Actual data visualisation / map produced by the fellow", label: "Research visual", name: "Research visual", cornerRadius: 4 }),
    rule(b, M, 1020, 80),
    b.text("Key finding: [specific finding from the actual research]", { x: M, y: 1050, w: CW, fontFamily: "Space Grotesk", fontSize: 40, fontWeight: 700, fill: "$ink", lineHeight: 1.2, label: "Key finding", name: "Key finding" }),
  );
  return els;
}

export const post27 = defineDesign({
  id: "p27-fellows-research",
  name: "Original African Research — Built by DAWB Fellows",
  post: 27,
  phase: 4,
  category: "carousel",
  alsoIn: ["spotlight"],
  format: "ig-portrait",
  style: "Academic journal meets data editorial",
  tags: ["fellowship", "primary research", "community", "methodology"],
  description: "6-slide research showcase: dark cover, three white project slides, methodology flow, dark close.",
  theme: THEMES.journal,
  pages: (b, t) => [
    { name: "Cover", bg: "#0D1F26", els: swapTones(cinematic(b, t, { headline: "Original African Research. Built by DAWB Fellows.", body: "They walked into communities, collected primary data, ran the analysis, and produced insights that have never existed before.", imageHint: "Fellows in a community setting — natural, authentic field research", counter: "01 / 06", footerLabel: "Swipe →" })).map((el) => (el.type === "shape" && el.name === "Legibility fade" ? { ...el, fill: "#0D1F26" } : el)) },
    { name: "Project 1", els: [...header(b, t), ...projectSlide(b, 1, "02 / 06", "[e.g. Healthcare access gaps in (community)]"), ...footer(b, t, "Swipe →", { counter: "02 / 06" })] },
    { name: "Project 2", els: [...header(b, t), ...projectSlide(b, 2, "03 / 06", "[e.g. Youth unemployment patterns in (area)]"), ...footer(b, t, "Swipe →", { counter: "03 / 06" })] },
    { name: "Project 3", els: [...header(b, t), ...projectSlide(b, 3, "04 / 06", "[e.g. Digital access and educational outcomes]"), ...footer(b, t, "Swipe →", { counter: "04 / 06" })] },
    { name: "Methodology", bg: "#E0F5F9", els: list(b, t, { headline: "This Is How DAWB Fellows Do Research.", items: ["Identify problem", "Design research question", "Build data collection instrument", "Collect primary data", "Clean and analyze", "Visualize findings", "Write and publish"], counter: "05 / 06" }) },
    { name: "Closing", bg: "#0D1F26", els: swapTones(closing(b, t, { headline: "Primary research. Original insights. Published findings. Built by Africans, for Africa.", body: "DAWB Research Fellowship — 4–6 months. Free. Transformative.", cta: "Interested? DM us or tap the link in bio", counter: "06 / 06" })) },
  ],
});

export const post29 = defineDesign({
  id: "p29-graduates-hired",
  name: "They Learned Excel, Power BI, and SQL. Then They Got Hired.",
  post: 29,
  phase: 4,
  category: "carousel",
  alsoIn: ["infographic"],
  format: "ig-portrait",
  style: "Career editorial · data-forward",
  tags: ["careers", "outcomes", "excel", "power bi", "sql"],
  description: "5-slide results carousel. Stats and roles are placeholders — the calendar says to use real graduate data.",
  theme: THEMES.results,
  pages: (b, t) => [
    { name: "Cover", els: cinematic(b, t, { headline: "They Learned the Tools. They Changed Their Careers.", body: "We don't just teach tools. We build careers.", imageHint: "Mosaic of graduate portraits — warm, professional", counter: "01 / 05", footerLabel: "Swipe →" }) },
    {
      name: "Stats",
      els: [
        ...header(b, t),
        b.text("The Numbers Behind the DAWB Cohorts", { x: M, y: 210, w: CW, fontFamily: "Space Grotesk", fontSize: 66, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        ...[["X%", "placed in data roles within 3 months"], ["X", "analysts placed in [industries]"], ["X", "fellows published research"], ["X", "graduates now freelancing as analysts"]].flatMap(([n, l], i) => {
          const x = M + (i % 2) * (CW / 2 + 10);
          const y = 480 + Math.floor(i / 2) * 360;
          return [
            b.rect({ x, y, w: CW / 2 - 10, h: 320, fill: "$surface", cornerRadius: 6, name: "Stat card" }),
            b.text(n, { x: x + 36, y: y + 40, w: CW / 2 - 80, fontFamily: "Space Grotesk", fontSize: 120, fontWeight: 700, fill: i === 0 ? "$accent" : "$primary", label: `Stat ${i + 1} value`, name: `Stat ${i + 1} value` }),
            b.text(l, { x: x + 36, y: y + 200, w: CW / 2 - 80, fontFamily: "Inter", fontSize: 26, fill: "$ink", lineHeight: 1.35, label: `Stat ${i + 1} label`, name: `Stat ${i + 1} label` }),
          ];
        }),
        b.text("Replace with real cohort data before posting.", { x: M, y: 1210, w: CW, fontFamily: "Inter", fontSize: 20, fill: "$muted", label: "Data note", name: "Data note" }),
      ],
    },
    { name: "Roles", els: list(b, t, { headline: "Where They Are Now", items: ["Data Analyst, [Company Name]", "Business Intelligence Analyst, [Company]", "Research Assistant, [Organization]", "Freelance Data Analyst", "Junior Data Scientist, [Startup]"], counter: "03 / 05", marker: "dot" }) },
    {
      name: "Quote",
      els: [
        b.image({ x: 0, y: 0, w: W, h: H, placeholderFill: "$surface", hint: "Full-bleed graduate portrait", label: "Portrait", name: "Portrait" }),
        b.rect({ x: 0, y: 420, w: W, h: H - 420, fill: "$paper", fade: "up", name: "Fade" }),
        ...header(b, t),
        b.text("“Before DAWB I was [situation]. Six weeks later I was [outcome].”", { x: M, y: 820, w: CW, fontFamily: "Cormorant Garamond", fontSize: 64, fontWeight: 500, italic: true, fill: "$ink", lineHeight: 1.12, label: "Quote", name: "Quote" }),
        b.text("[Name] · [Current title]", { x: M, y: 1110, w: CW, fontFamily: "Inter", fontSize: 28, fontWeight: 600, fill: "$primary", label: "Attribution", name: "Attribution" }),
        ...footer(b, t, "Swipe →", { counter: "04 / 05" }),
      ],
    },
    { name: "Cohort 3 CTA", els: closing(b, t, { headline: "Cohort 3 Is Forming. This Slide Will Include You.", body: "Excel (Advanced) · Power BI · SQL · Data storytelling · Research methodology", cta: "Apply to DAWB Professional Track — link in bio", counter: "05 / 05" }) },
  ],
});

export const post31 = defineDesign({
  id: "p31-community-ask",
  name: "Who in Your Circle Should Be a DAWB Researcher?",
  post: 31,
  phase: 4,
  category: "community",
  format: "ig-portrait",
  style: "Warm invitation · deliberately un-designed",
  tags: ["community", "referral", "cohort 3"],
  description: "Warm, personal community post. Feels like a message from a friend, not a brand.",
  theme: THEMES.community,
  pages: (b, t) => [
    {
      name: "Invitation",
      els: [
        ...header(b, t),
        b.image({ x: M, y: 200, w: CW, h: 520, placeholderFill: "$surface", hint: "Group portrait or collaborative scene", label: "Photo", name: "Photo", cornerRadius: 8 }),
        b.text("Think about the smartest, most curious, most solution-obsessed person you know.", { x: M, y: 780, w: CW, fontFamily: "Inter", fontSize: 42, fontWeight: 500, fill: "$ink", lineHeight: 1.3, label: "Hook", name: "Hook" }),
        b.text("Are they at DAWB yet?", { x: M, y: 960, w: CW, fontFamily: "Space Grotesk", fontSize: 64, fontWeight: 700, fill: "$primary", label: "Question", name: "Question" }),
        b.text("Tag them. Tell them why. We'll take it from there.", { x: M, y: 1070, w: CW, fontFamily: "Inter", fontSize: 30, fill: "$muted", label: "Call to action", name: "Call to action" }),
        ...footer(b, t, "Tag someone ↓"),
      ],
    },
  ],
});

export const post32 = defineDesign({
  id: "p32-campaign-close",
  name: "Campaign Close — Research Built Civilization",
  post: 32,
  phase: 4,
  category: "carousel",
  alsoIn: ["statement"],
  format: "ig-portrait",
  style: "Campaign retrospective · architectural simplicity",
  tags: ["manifesto", "campaign close", "cohort 3", "tagline"],
  description: "The definitive 6-slide DAWB statement. Slide 6 is pure typography: the tagline, logo and website.",
  theme: THEMES.final,
  pages: (b, t) => [
    { name: "The beginning", bg: "#2A1C14", els: imageTop(b, { ...THEMES.archive }, { eyebrow: "The beginning", headline: "22,000 Years Ago, Africa Recorded Its First Data.", imageHint: "The Ishango Bone", counter: "01 / 06" }) },
    {
      name: "The journey",
      bg: "#1B120C",
      els: [
        ...header(b, t),
        b.text("Research Built Every Civilization That Followed.", { x: M, y: 210, w: CW, fontFamily: "Playfair Display", fontSize: 76, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        ...["Alexandria", "Ibn al-Haytham", "John Snow's map", "DNA", "The internet"].flatMap((m, i) => [
          b.shape("ellipse", { x: M, y: 560 + i * 110, w: 22, h: 22, fill: "$accent", name: "Milestone dot" }),
          b.text(m, { x: M + 50, y: 550 + i * 110, w: CW - 50, fontFamily: "Playfair Display", fontSize: 44, fontWeight: 500, italic: true, fill: "$ink", label: `Milestone ${i + 1}`, name: `Milestone ${i + 1}` }),
        ]),
        b.shape("line", { x: M + 11, y: 571, w: 440, h: 2, rotation: 90, stroke: "$accent", strokeWidth: 2, fill: "transparent", opacity: 0.4, name: "Timeline line" }),
        ...footer(b, t, "Swipe →", { counter: "02 / 06" }),
      ],
    },
    {
      name: "The crisis",
      els: [
        ...header(b, t),
        b.text("Africa Carries 25% of the World's Problems.", { x: M, y: 260, w: CW, fontFamily: "Space Grotesk", fontSize: 70, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline 1", name: "Headline 1" }),
        b.rect({ x: M, y: 520, w: CW, h: 70, fill: "$surface", name: "Bar track 1" }),
        b.rect({ x: M, y: 520, w: CW * 0.25, h: 70, fill: "#FFFFFF", name: "25% bar" }),
        b.text("Produces 2% of Its Research.", { x: M, y: 680, w: CW, fontFamily: "Space Grotesk", fontSize: 70, fontWeight: 700, fill: "$primary", lineHeight: 1.05, label: "Headline 2", name: "Headline 2" }),
        b.rect({ x: M, y: 860, w: CW, h: 70, fill: "$surface", name: "Bar track 2" }),
        b.rect({ x: M, y: 860, w: CW * 0.02, h: 70, fill: "$primary", name: "2% bar" }),
        b.text("That is not a statistic. That is a mandate.", { x: M, y: 1010, w: CW, fontFamily: "Inter", fontSize: 32, fill: "$muted", label: "Line", name: "Line" }),
        ...footer(b, t, "Swipe →", { counter: "03 / 06" }),
      ],
    },
    { name: "The response", els: imageTop(b, t, { eyebrow: "The response", headline: "DAWB Is Building the Researchers Who Will Close That Gap.", imageHint: "Mosaic of DAWB graduates — community, warmth", counter: "04 / 06", imageHeight: 640 }) },
    {
      name: "The invitation",
      els: [
        ...header(b, t),
        b.text("Your Chapter Starts Now.", { x: M, y: 220, w: CW, fontFamily: "Space Grotesk", fontSize: 88, fontWeight: 700, fill: "$ink", lineHeight: 1, label: "Headline", name: "Headline" }),
        ...[["Research Fellowship", "Free · 4–6 months", "Primary research in your community, documented and published under your name."], ["Professional Track", "Paid · 6–8 weeks", "Excel, Power BI, SQL, data storytelling and research methodology."]].flatMap(([title, meta, body], i) => {
          const y = 470 + i * 330;
          return [
            b.rect({ x: M, y, w: CW, h: 290, fill: "$surface", cornerRadius: 6, name: "Programme card" }),
            b.text(title, { x: M + 40, y: y + 36, w: CW - 80, fontFamily: "Space Grotesk", fontSize: 46, fontWeight: 700, fill: "$ink", label: `Programme ${i + 1}`, name: `Programme ${i + 1}` }),
            b.text(meta, { x: M + 40, y: y + 104, w: CW - 80, fontFamily: "JetBrains Mono", fontSize: 24, fill: "$primary", label: `Programme ${i + 1} details`, name: `Programme ${i + 1} details` }),
            b.text(body, { x: M + 40, y: y + 160, w: CW - 80, fontFamily: "Inter", fontSize: 26, fill: "$muted", lineHeight: 1.4, label: `Programme ${i + 1} text`, name: `Programme ${i + 1} text` }),
          ];
        }),
        ...bar(b, "Apply now — link in bio", { x: M, y: 1150, w: CW, fontSize: 30, font: "Inter", label: "Call to action" }),
      ],
    },
    {
      name: "The tagline",
      els: [
        b.text("Research built civilization.", { x: M, y: 470, w: CW, fontFamily: "Space Grotesk", fontSize: 76, fontWeight: 700, fill: "$ink", align: "center", lineHeight: 1.1, label: "Tagline 1", name: "Tagline 1" }),
        b.text("DAWB is building the researchers.", { x: M, y: 640, w: CW, fontFamily: "Space Grotesk", fontSize: 76, fontWeight: 700, fill: "$primary", align: "center", lineHeight: 1.1, label: "Tagline 2", name: "Tagline 2" }),
        { ...b.logo(t.logo, { x: W / 2 - 70, y: 920, w: 140, name: "Logo" }), cornerRadius: 18 },
        b.text(HANDLES.website, { x: M, y: 1110, w: CW, fontFamily: "Space Grotesk", fontSize: 30, fontWeight: 700, fill: "$ink", align: "center", letterSpacing: 2, label: "Website", name: "Website" }),
      ],
    },
  ],
});

export const PHASE4 = [post26, post27, post29, post31, post32];

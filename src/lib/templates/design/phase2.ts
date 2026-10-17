import type { DesignElement } from "@/lib/design/types";
import { footer, H, header, M, rule, W, type B } from "./common";
import { defineDesign } from "./define";
import { cinematic, closing, imageTop, list, stat, statement, textTop } from "./layouts";
import { THEMES, swapTones } from "./themes";

const CW = W - M * 2;

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

/** Stylised recreation of John Snow's 1854 map: street grid, death clusters, the pump. */
function choleraMap(b: B, x: number, y: number, w: number, h: number): DesignElement[] {
  const r = seeded(11);
  const els: DesignElement[] = [
    b.rect({ x, y, w, h, fill: "$surface", cornerRadius: 4, name: "Map panel" }),
    b.pattern("grid", { x, y, w, h, color: "$muted", spacing: 70, size: 1.5, opacity: 0.35, name: "Street grid" }),
  ];
  const px = x + w * 0.52;
  const py = y + h * 0.48;
  for (let i = 0; i < 90; i++) {
    const a = r() * Math.PI * 2;
    const d = Math.pow(r(), 1.8) * Math.min(w, h) * 0.42;
    els.push(b.rect({ x: px + Math.cos(a) * d, y: py + Math.sin(a) * d, w: 9, h: 9, fill: "$accent", opacity: 0.85, name: "Death record" }));
  }
  els.push(
    b.shape("ring", { x: px - 34, y: py - 34, w: 68, h: 68, fill: "$primary", innerRatio: 0.82, name: "Pump ring" }),
    b.shape("ellipse", { x: px - 10, y: py - 10, w: 20, h: 20, fill: "$primary", name: "Broad Street pump" }),
    b.text("Broad Street pump", { x: px + 44, y: py - 16, w: 300, fontFamily: "Nunito Sans", fontSize: 22, fontWeight: 600, fill: "$ink", label: "Map label", name: "Map label" }),
  );
  return els;
}

export const post10 = defineDesign({
  id: "p10-john-snow",
  name: "John Snow Stopped a Cholera Epidemic With a Map",
  post: 10,
  phase: 2,
  category: "carousel",
  alsoIn: ["infographic"],
  format: "ig-portrait",
  style: "Data journalism · documentary",
  tags: ["data visualisation", "cholera", "map", "public health"],
  description: "5-slide data-journalism carousel with a recreated cholera map.",
  theme: THEMES.journalism,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        ...choleraMap(b, 0, 0, W, H),
        b.rect({ x: 0, y: 560, w: W, h: H - 560, fill: "$paper", fade: "up", name: "Legibility fade" }),
        ...header(b, t),
        b.text("1854", { x: M, y: 820, w: CW, fontFamily: "JetBrains Mono", fontSize: 28, fontWeight: 700, fill: "$primary", letterSpacing: 4, label: "Year", name: "Year" }),
        b.text("He Stopped an Epidemic With a Map.", { x: M, y: 870, w: CW, fontFamily: "Nunito Sans", fontSize: 92, fontWeight: 700, fill: "$ink", lineHeight: 1.02, letterSpacing: -2, label: "Headline", name: "Headline" }),
        b.text("The world's first data visualization saved hundreds of lives.", { x: M, y: 1110, w: CW, fontFamily: "Nunito Sans", fontSize: 30, fill: "$muted", label: "Subtext", name: "Subtext" }),
        ...footer(b, t, "Swipe →", { counter: "01 / 05" }),
      ],
    },
    { name: "London 1854", els: imageTop(b, t, { eyebrow: "London, 1854", headline: "Cholera Was Killing Hundreds.", body: "Doctors believed it was airborne. Dr. John Snow believed the data would tell a different story — if he collected it.", imageHint: "Dark, atmospheric London street illustration", counter: "02 / 05" }) },
    {
      name: "The map",
      els: [
        ...header(b, t),
        b.text("He Mapped Every Death. Then He Followed the Pattern.", { x: M, y: 200, w: CW, fontFamily: "Nunito Sans", fontSize: 64, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        ...choleraMap(b, M, 400, CW, 560),
        b.text("Door by door. Death by death. He plotted each case on a street map of Soho. The clusters pointed to one location: a water pump on Broad Street.", { x: M, y: 1000, w: CW, fontFamily: "Nunito Sans", fontSize: 28, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body" }),
        ...footer(b, t, "Swipe →", { counter: "03 / 05" }),
      ],
    },
    { name: "Pump handle", els: cinematic(b, t, { headline: "He Removed the Pump Handle. The Epidemic Stopped.", body: "One data visualization. One evidence-based decision. Hundreds of lives saved. This is the power of applied data analysis.", imageHint: "Close-up of a hand removing a pump handle, high contrast", counter: "04 / 05", footerLabel: "Swipe →", headlineBase: 84 }) },
    { name: "Closing", els: closing(b, t, { headline: "Somewhere in Africa, There Is a Problem That Data Could Solve. The Analyst Could Be You.", cta: "Apply to DAWB Cohort 3 — link in bio", counter: "05 / 05" }) },
  ],
});

export const post11 = defineDesign({
  id: "p11-smallpox",
  name: "Smallpox Killed 300 Million. Research Ended It.",
  post: 11,
  phase: 2,
  category: "statement",
  format: "ig-portrait",
  style: "Typographic statement · NYT pull quote",
  tags: ["smallpox", "public health", "statistic", "typography"],
  description: "One dominant number on near-black. The restraint is the design.",
  theme: THEMES.stark,
  pages: (b, t) => [
    {
      name: "Statement",
      els: [
        ...header(b, t),
        b.text("Smallpox · 20th century", { x: M, y: 360, w: CW, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 300, fill: "$muted", letterSpacing: 4, uppercase: true, label: "Context", name: "Context" }),
        b.text("300,000,000", { x: M - 6, y: 420, w: CW + 20, fontFamily: "Nunito Sans", fontSize: 150, fontWeight: 700, fill: "$ink", letterSpacing: -6, label: "Big number", name: "Big number" }),
        b.text("people killed in the 20th century alone.", { x: M, y: 610, w: CW, fontFamily: "Nunito Sans", fontSize: 36, fontWeight: 300, fill: "$muted", label: "Number caption", name: "Number caption" }),
        rule(b, M, 720, 120),
        b.text("Then research ended it. Forever.", { x: M, y: 770, w: CW, fontFamily: "Nunito Sans", fontSize: 72, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Statement", name: "Statement" }),
        b.text("Last naturally occurring case: Bangladesh, 1975. Declared eradicated by the WHO in 1979.", { x: M, y: 980, w: CW * 0.8, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 300, fill: "$muted", lineHeight: 1.45, label: "Footnote", name: "Footnote" }),
        ...footer(b, t, "Read caption"),
      ],
    },
  ],
});

export const post12 = defineDesign({
  id: "p12-africa-building",
  name: "Africa Is Building Researchers Who Will Create Solutions",
  post: 12,
  phase: 2,
  category: "carousel",
  format: "ig-portrait",
  style: "Futuristic editorial · advocacy",
  tags: ["africa", "research gap", "public health", "statistics"],
  description: "4-slide carousel: the gap, the problem, the response, and DAWB.",
  theme: THEMES.advocacy,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        ...header(b, t),
        b.text("25%", { x: M - 4, y: 230, w: CW, fontFamily: "Nunito Sans", fontSize: 230, fontWeight: 700, fill: "$accent", letterSpacing: -8, label: "Stat 1", name: "Stat 1" }),
        b.text("of the world's disease burden.", { x: M, y: 470, w: CW, fontFamily: "Nunito Sans", fontSize: 48, fontWeight: 500, fill: "$ink", label: "Stat 1 label", name: "Stat 1 label" }),
        b.text("<2%", { x: M - 4, y: 600, w: CW, fontFamily: "Nunito Sans", fontSize: 230, fontWeight: 700, fill: "$primary", letterSpacing: -8, label: "Stat 2", name: "Stat 2" }),
        b.text("of its research.", { x: M, y: 840, w: CW, fontFamily: "Nunito Sans", fontSize: 48, fontWeight: 500, fill: "$ink", label: "Stat 2 label", name: "Stat 2 label" }),
        rule(b, M, 980, 120),
        b.text("The gap is the mission.", { x: M, y: 1020, w: CW, fontFamily: "Nunito", fontSize: 64, fontWeight: 500, italic: true, fill: "$ink", label: "Subtext", name: "Subtext" }),
        ...footer(b, t, "Swipe →", { counter: "01 / 04" }),
      ],
    },
    { name: "The problem", els: list(b, t, { headline: "The Problem Is Real.", items: ["Malaria kills a child every 2 minutes in Africa.", "Maternal mortality rates remain among the world's highest.", "Non-communicable diseases are rising rapidly.", "These are research-solvable problems."], counter: "02 / 04", marker: "dot" }) },
    { name: "The response", els: textTop(b, t, { headline: "But So Is the Response.", body: "A new generation of African researchers is rising — in universities, in labs, in data centers, and in programs like DAWB. They are not waiting for solutions. They are building them.", imageHint: "Young African researchers / analysts at work", counter: "03 / 04" }) },
    { name: "Closing", els: closing(b, t, { headline: "DAWB Is Building the Researchers Africa Needs.", body: "Every person we train is one more data professional aimed at Africa's hardest problems.", cta: "Be part of the movement — DAWB Cohort 3", counter: "04 / 04" }) },
  ],
});

/** Photo 51-style X diffraction motif, drawn with shapes. */
function photo51(b: B, cx: number, cy: number, r: number): DesignElement[] {
  const els: DesignElement[] = [b.shape("ellipse", { x: cx - r, y: cy - r, w: r * 2, h: r * 2, fill: "#141414", name: "Photo 51 disc" })];
  for (let i = -5; i <= 5; i++) {
    if (i === 0) continue;
    const d = i * r * 0.14;
    els.push(b.shape("ellipse", { x: cx + d * 0.55 - 7, y: cy + d - 7, w: 14, h: 14, fill: "#E9E2D3", opacity: 1 - Math.abs(i) * 0.12, name: "Diffraction spot" }));
    els.push(b.shape("ellipse", { x: cx - d * 0.55 - 7, y: cy + d - 7, w: 14, h: 14, fill: "#E9E2D3", opacity: 1 - Math.abs(i) * 0.12, name: "Diffraction spot" }));
  }
  els.push(b.shape("ring", { x: cx - r * 0.95, y: cy - r * 0.95, w: r * 1.9, h: r * 1.9, fill: "#E9E2D3", innerRatio: 0.96, opacity: 0.3, name: "Halo" }));
  return els;
}

export const post13 = defineDesign({
  id: "p13-rosalind-franklin",
  name: "Rosalind Franklin Discovered the Structure of DNA",
  post: 13,
  phase: 2,
  category: "carousel",
  format: "ig-portrait",
  style: "Portrait gallery · advocacy editorial",
  tags: ["dna", "women in science", "photo 51", "ownership"],
  description: "4-slide portrait carousel with a recreated Photo 51 motif and a dark DAWB close.",
  theme: THEMES.gallery,
  pages: (b, t) => [
    {
      name: "Portrait",
      els: [
        ...header(b, t),
        b.image({ x: M, y: 190, w: CW, h: 720, placeholderFill: "$surface", hint: "Illustrated portrait of Rosalind Franklin", label: "Portrait", name: "Portrait", cornerRadius: 4 }),
        b.text("Rosalind Franklin. 1920–1958.", { x: M, y: 950, w: CW, fontFamily: "Nunito", fontSize: 40, fontWeight: 500, italic: true, fill: "$accent", label: "Name and dates", name: "Name and dates" }),
        b.text("She discovered the structure of life.", { x: M, y: 1010, w: CW, fontFamily: "Nunito", fontSize: 74, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        ...footer(b, t, "Swipe →", { counter: "01 / 04" }),
      ],
    },
    {
      name: "Photo 51",
      els: [
        ...header(b, t),
        ...photo51(b, W / 2, 520, 280),
        b.text("Photo 51. The most important photograph in biology. Taken by Rosalind Franklin.", { x: M, y: 860, w: CW, fontFamily: "Nunito", fontSize: 52, fontWeight: 700, fill: "$ink", lineHeight: 1.1, label: "Headline", name: "Headline" }),
        b.text("Without her permission, this image was shown to Watson and Crick — and formed the basis of their Nobel Prize–winning discovery.", { x: M, y: 1080, w: CW, fontFamily: "Nunito Sans", fontSize: 27, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body" }),
        ...footer(b, t, "Swipe →", { counter: "02 / 04" }),
      ],
    },
    { name: "The erasure", bg: "#2E3236", els: swapTones(statement(b, t, { headline: "She died at 37. The Nobel went to the men who used her data.", body: "This is what happens when researchers don't control their own work, their own documentation, their own publication rights.", counter: "03 / 04", footerLabel: "Swipe →" })) },
    { name: "DAWB response", bg: "#0D1F26", els: swapTones(closing(b, t, { headline: "At DAWB, your research is always yours.", body: "We document it, publish it, and attribute it — correctly, fully, and permanently.", cta: "Say her name in the comments: Rosalind Franklin", counter: "04 / 04" })) },
  ],
});

function timeline(b: B, y: number, items: Array<[string, string]>): DesignElement[] {
  const els: DesignElement[] = [b.shape("line", { x: M, y, w: CW, h: 2, stroke: "$muted", strokeWidth: 2, fill: "transparent", opacity: 0.5, name: "Timeline" })];
  const step = CW / (items.length - 1);
  items.forEach(([year, label], i) => {
    const x = M + i * step;
    els.push(
      b.shape("ellipse", { x: x - 12, y: y - 12, w: 24, h: 24, fill: "$primary", name: "Timeline node" }),
      b.text(year, { x: x - 110, y: y - 80, w: 220, fontFamily: "Nunito Sans", fontSize: 34, fontWeight: 700, fill: "$primary", align: "center", label: `${label} year`, name: "Year" }),
      b.text(label, { x: x - 110, y: y + 34, w: 220, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 500, fill: "$ink", align: "center", lineHeight: 1.3, label: `${year} label`, name: "Milestone" }),
    );
  });
  return els;
}

export const post15 = defineDesign({
  id: "p15-internet-research",
  name: "The Internet Was a Research Project",
  post: 15,
  phase: 2,
  category: "carousel",
  format: "ig-portrait",
  style: "Futuristic tech editorial",
  tags: ["internet", "smartphone", "mrna", "gps", "technology"],
  description: "6-slide tech carousel with a component timeline. Slide 6 resets to the DAWB identity.",
  theme: THEMES.tech,
  pages: (b, t) => [
    { name: "Cover", els: [b.pattern("dots", { x: 0, y: 0, w: W, h: H, color: "$primary", spacing: 40, size: 1.6, opacity: 0.25, name: "Data dots" }), ...cinematic(b, t, { headline: "Everything You Use Today Was Once an Experiment.", body: "The internet. Your smartphone. GPS. MRI machines. COVID vaccines. All of them began as research projects.", imageHint: "Phone, laptop, headphones dissolving into old research equipment", counter: "01 / 06", footerLabel: "Swipe →" })] },
    { name: "Internet", els: imageTop(b, t, { eyebrow: "ARPANET · 1969", headline: "The Internet Began as a Military Research Network in 1969.", body: "ARPANET was funded to create a communication system that could survive a nuclear strike. Today it connects 5 billion people.", imageHint: "Early network diagram → modern internet traffic", counter: "02 / 06", imageHeight: 520 }) },
    {
      name: "Smartphone",
      els: [
        ...header(b, t),
        b.text("Your Smartphone Is the Product of 50 Years of Parallel Research.", { x: M, y: 210, w: CW, fontFamily: "Nunito Sans", fontSize: 70, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        ...timeline(b, 700, [["1947", "Semiconductors"], ["1973", "GPS"], ["1992", "Touchscreen"], ["2000s", "Wireless internet"]]),
        b.text("= the device in your hand.", { x: M, y: 900, w: CW, fontFamily: "Nunito Sans", fontSize: 48, fontWeight: 500, fill: "$primary", label: "Result line", name: "Result line" }),
        ...footer(b, t, "Swipe →", { counter: "03 / 06" }),
      ],
    },
    { name: "mRNA", els: textTop(b, t, { eyebrow: "mRNA · 30 years", headline: "The COVID Vaccine Used Technology Researchers Had Been Developing for 30 Years.", body: "Katalin Karikó worked on mRNA technology for decades, dismissed and underfunded, before COVID-19 made her research globally critical. She won the Nobel Prize in 2023.", imageHint: "DNA helix → vaccine → Nobel medal", counter: "04 / 06" }) },
    { name: "GPS", els: imageTop(b, t, { eyebrow: "GPS", headline: "GPS Was Funded by the US Military. Now It Guides Your Every Move.", body: "Research funded for one purpose consistently creates breakthroughs for entirely different purposes.", imageHint: "Satellite orbit diagram → phone navigation map", counter: "05 / 06", imageHeight: 520 }) },
    { name: "Closing", els: closing(b, t, { headline: "The Next Breakthrough Is Being Researched Right Now. Will Africa Build It?", body: "At DAWB, we are training Africa's next generation of researchers and data professionals.", cta: "Be part of Africa's research future", counter: "06 / 06" }) },
  ],
});

export const post16 = defineDesign({
  id: "p16-phase2-recap",
  name: "Phase 2 Recap — Research Rebuilt the World",
  post: 16,
  phase: 2,
  category: "recap",
  format: "ig-portrait",
  style: "Twilight skyline · literary",
  tags: ["recap", "phase 2", "transition"],
  description: "Cinematic single image: African city skyline at dusk, poetic lower-third text.",
  theme: THEMES.twilight,
  pages: (b, t) => [
    {
      name: "Recap",
      els: cinematic(b, t, {
        eyebrow: "Phase 2 · Research Changed the World",
        headline: "Research didn't just document the world.\nIt rebuilt it.",
        body: "Next: the age where data becomes the most powerful force on Earth.",
        imageHint: "African city skyline at dusk (Lagos, Nairobi, Accra, Kigali)",
        footerLabel: "Phase 3 begins next week",
        headlineBase: 80,
      }).map((el) => (el.type === "text" && el.name === "Headline" ? { ...el, italic: true, fontWeight: 500 } : el)),
    },
  ],
});

export const PHASE2 = [post10, post11, post12, post13, post15, post16];
void stat;
void H;

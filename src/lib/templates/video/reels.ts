import { scene, video } from "@/lib/video/build";
import type { VideoTheme } from "@/lib/video/types";
import type { VideoTemplate } from "../types";

const NEAR_BLACK = "#0D1F26";
const serif: Partial<VideoTheme> = { displayFont: "Nunito", bodyFont: "Nunito Sans" };
const grotesk: Partial<VideoTheme> = { displayFont: "Nunito Sans", bodyFont: "Nunito Sans" };

function def(t: Omit<VideoTemplate, "kind" | "aspect"> & { aspect?: VideoTemplate["aspect"] }): VideoTemplate {
  return { kind: "video", aspect: "portrait", ...t };
}

const outro = (cta: string, bg = NEAR_BLACK, id?: string) => scene("logo-outro", { cta, url: "www.dawblearn.org", showHandle: true }, { id, duration: 90, background: { color: bg, texture: "none" } });

// Post 1 — optional reel version
export const reel01 = def({
  id: "v01-first-question",
  name: "Reel — It Began With a Question",
  post: 1,
  phase: 1,
  category: "reel",
  tags: ["stars", "typewriter", "curiosity"],
  style: "Slow, meditative · typewriter text",
  description: "Black screen, starry sky, words appear letter by letter. Closes with “We are building Africa's researchers.”",
  build: () =>
    video(
      [
        scene("kinetic-title", { eyebrow: "", headline: "Before the first laboratory.\nBefore the first textbook.\nBefore the first data set —", animation: "typewriter", align: "left" }, { id: "a1", duration: 150, background: { color: "#000000", texture: "none" } }),
        scene("photo-hero", { tag: "", headline: "there was a human being who looked up at the sky and asked: why?", subline: "", position: "bottom", image: "" }, { id: "a2", duration: 150, background: { color: "#0B1630", motion: "zoom-in", overlay: 0.25 } }),
        outro("We are building Africa's researchers.", "#0B1630", "a3"),
      ],
      { theme: { ...serif, paper: "#0B1630", accent: "#E6BA62" } },
    ),
});

// Post 3
export const reel03 = def({
  id: "v03-observation",
  name: "Reel — They Had Something Rarer: Patience",
  post: 3,
  phase: 1,
  category: "reel",
  tags: ["observation", "documentary", "cohort 3"],
  style: "Documentary · then meets now",
  description: "Before the algorithm… there was observation. Split historical/modern scenes and a Cohort 3 call.",
  build: () =>
    video(
      [
        scene("kinetic-title", { headline: "Before the algorithm…", animation: "typewriter", subline: "" }, { id: "b1", duration: 90, background: { color: "#000000" } }),
        scene("photo-hero", { headline: "…there was observation.", position: "center", image: "" }, { id: "b2", duration: 105, background: { color: "#3A2A1C", motion: "zoom-in", overlay: 0.3 } }),
        scene("split-media", { eyebrow: "Then → now", headline: "The methodology hasn't changed. Only the tools have.", body: "Watch. Wait. Write.", side: "left", image: "" }, { id: "b3", duration: 135, background: { color: NEAR_BLACK } }),
        scene("kinetic-title", { eyebrow: "", headline: "Every great discovery began with someone paying close attention.", highlight: "attention", animation: "rise" }, { id: "b4", duration: 120, background: { color: NEAR_BLACK, texture: "grid" } }),
        outro("Cohort 3 is open. Learn more.", NEAR_BLACK, "b5"),
      ],
      { theme: grotesk },
    ),
});

// Post 6
export const reel06 = def({
  id: "v06-agriculture",
  name: "Reel — Agriculture Was the First Data Science Project",
  post: 6,
  phase: 1,
  category: "reel",
  tags: ["agriculture", "farming", "data-driven decisions"],
  style: "Earthy, warm · aerial to analytics",
  description: "12,000 years ago… tracked rainfall, mapped soil. “The tools changed. The intelligence didn't.”",
  build: () =>
    video(
      [
        scene("photo-hero", { tag: "12,000 years ago", headline: "Somewhere along the Nile Valley…", position: "bottom", image: "" }, { id: "c1", duration: 105, background: { color: "#4A3A1F", motion: "pan-right", overlay: 0.2 } }),
        scene("kinetic-title", { headline: "Humans made the most consequential data-driven decision in history.", highlight: "data-driven", animation: "rise" }, { id: "c2", duration: 120, background: { color: "#1B140C" } }),
        scene("list-reveal", { title: "They were running the world's first data analysis.", items: [{ text: "They tracked rainfall" }, { text: "They mapped soil" }, { text: "They observed patterns across seasons" }], numbered: false }, { id: "c3", duration: 150, background: { color: "#F3E5D0" } }),
        scene("kinetic-title", { headline: "The tools changed.\nThe intelligence didn't.", highlight: "intelligence", animation: "mask", align: "center" }, { id: "c4", duration: 105, background: { color: NEAR_BLACK } }),
        outro("Building Africa's data-driven decision makers.", NEAR_BLACK, "c5"),
      ],
      { theme: { ...grotesk, accent: "#E3B04B" } },
    ),
});

// Post 9
export const reel09 = def({
  id: "v09-steam-engine",
  name: "Reel — The Steam Engine Was a Research Project",
  post: 9,
  phase: 2,
  category: "reel",
  tags: ["industrial revolution", "james watt", "revolution"],
  style: "Industrial · urgent",
  description: "The Industrial Revolution didn't happen by accident. Africa's revolution needs researchers.",
  build: () =>
    video(
      [
        scene("kinetic-title", { headline: "The Industrial Revolution didn't happen by accident.", animation: "scale" }, { id: "d1", duration: 105, background: { color: "#000000", texture: "lines" } }),
        scene("photo-hero", { tag: "Researchers were obsessed", headline: "They documented everything. They tested everything.", subline: "They failed repeatedly — and iterated with precision.", image: "" }, { id: "d2", duration: 135, transition: { type: "slide", direction: "from-right" }, background: { color: "#3A2A1C", motion: "zoom-in", overlay: 0.3 } }),
        scene("kinetic-title", { headline: "Every revolution begins with a researcher who refused to accept the problem as permanent.", highlight: "researcher", animation: "rise" }, { id: "d3", duration: 135, background: { color: NEAR_BLACK } }),
        outro("Africa's revolution needs researchers. We're building them.", NEAR_BLACK, "d4"),
      ],
      { theme: { ...grotesk, accent: "#D9A04A" } },
    ),
});

// Post 14
export const reel14 = def({
  id: "v14-alan-turing",
  name: "Reel — Alan Turing Broke the Unbreakable Code",
  post: 14,
  phase: 2,
  category: "reel",
  tags: ["turing", "enigma", "computing"],
  style: "Tense · stark silence",
  description: "Enigma, the code broken, “He died at 41.” Closes on a community that values researchers.",
  build: () =>
    video(
      [
        scene("code-typing", { title: "World War II.", language: "ENIGMA", code: "01001110 01000001\n10110101 00101101\n11100010 01011100", caption: "Breaking it was considered mathematically impossible." }, { id: "e1", duration: 135, background: { color: "#000000" } }),
        scene("photo-hero", { tag: "Alan Turing", headline: "He built a machine that broke the unbreakable.", subline: "Historians estimate it shortened the war by two years.", image: "" }, { id: "e2", duration: 135, background: { color: "#1A1A1A", motion: "zoom-in", overlay: 0.3 } }),
        scene("kinetic-title", { headline: "His country prosecuted him for who he was.", animation: "typewriter" }, { id: "e3", duration: 105, transition: { type: "none" }, background: { color: "#000000" } }),
        scene("kinetic-title", { headline: "He died at 41.", animation: "scale", align: "center" }, { id: "e4", duration: 75, transition: { type: "none" }, background: { color: "#000000" } }),
        scene("kinetic-title", { headline: "In 2013 — 59 years later — he was pardoned.", animation: "rise" }, { id: "e5", duration: 90, background: { color: "#000000" } }),
        outro("Researchers deserve better. We're building a community that knows it.", NEAR_BLACK, "e6"),
      ],
      { theme: grotesk },
    ),
});

// Post 17 — motion graphics
export const reel17 = def({
  id: "v17-sixty-seconds",
  name: "Reel — Every 60 Seconds on the Internet",
  post: 17,
  phase: 3,
  category: "reel",
  alsoIn: ["motion"],
  tags: ["data", "counters", "statistics", "motion graphics"],
  style: "Motion graphics · animated counters",
  description: "Countdown, animated counters (YouTube, Google, X), then “Most of it will never be used.”",
  build: () =>
    video(
      [
        scene("countdown", { label: "This is what happens on the internet in", from: 60, to: 57, unit: "seconds", caption: "" }, { id: "f1", duration: 120, background: { color: "#000000", texture: "grid" } }),
        scene("stat-counter", { title: "Every 60 seconds", stats: [{ value: 500, suffix: " hrs", label: "of video uploaded to YouTube" }, { value: 6000000, suffix: "", label: "Google searches" }, { value: 500000, suffix: "", label: "posts on X" }], note: "" }, { id: "f2", duration: 165, background: { color: "#070B14", texture: "dots" } }),
        scene("kinetic-title", { headline: "This is more data than the Library of Alexandria held. Every minute.", highlight: "Every minute.", animation: "rise" }, { id: "f3", duration: 120, background: { color: "#070B14" } }),
        scene("kinetic-title", { headline: "Most of it will never be used.", animation: "typewriter", align: "center" }, { id: "f4", duration: 90, background: { color: "#000000" } }),
        scene("kinetic-title", { headline: "The world doesn't need more data. It needs more people who can understand it.", highlight: "understand", animation: "rise" }, { id: "f5", duration: 120, background: { color: NEAR_BLACK } }),
        outro("Learn to turn data into decisions.", NEAR_BLACK, "f6"),
      ],
      { theme: grotesk },
    ),
});

// Post 23
export const reel23 = def({
  id: "v23-analyst-monday",
  name: "Reel — A Data Analyst at 9AM on a Monday",
  post: 23,
  phase: 3,
  category: "reel",
  tags: ["day in the life", "sql", "power bi", "careers"],
  style: "Day-in-the-life · text only",
  description: "9:00 data cleaning (SQL typing), 10:00 the dashboard (animated chart), 11:00 strategy shifts, 12:00 done.",
  build: () =>
    video(
      [
        scene("kinetic-title", { eyebrow: "9:00 AM · Monday", headline: "Here's what a data analyst's day actually looks like.", animation: "rise" }, { id: "g1", duration: 105, background: { color: "#FFFFFF" } }),
        scene("code-typing", { title: "9:00 — Data cleaning", language: "SQL", code: "SELECT region, COUNT(*)\nFROM sales\nWHERE amount IS NULL\nGROUP BY region;", caption: "The foundation of every good analysis." }, { id: "g2", duration: 165, transition: { type: "slide", direction: "from-right" }, background: { color: "#F2F9FB" } }),
        scene("bar-chart", { title: "10:00 — Building the story", items: [{ label: "North", value: 42 }, { label: "South", value: 58 }, { label: "East", value: 51 }, { label: "West", value: 36 }], unit: "", caption: "Illustrative dashboard — sample values" }, { id: "g3", duration: 150, transition: { type: "slide", direction: "from-right" }, background: { color: "#FFFFFF" } }),
        scene("kinetic-title", { eyebrow: "11:00", headline: "Changing the strategy. One visualization at a time.", highlight: "strategy", animation: "rise" }, { id: "g4", duration: 105, background: { color: NEAR_BLACK } }),
        scene("kinetic-title", { eyebrow: "12:00", headline: "Done. Your data told a story. You translated it.", animation: "rise" }, { id: "g5", duration: 105, background: { color: NEAR_BLACK } }),
        outro("Excel · Power BI · SQL · Research methodology", NEAR_BLACK, "g6"),
      ],
      { theme: grotesk },
    ),
});

// Post 25
export const reel25 = def({
  id: "v25-dawb-generation",
  name: "Reel — Meet the DAWB Generation",
  post: 25,
  phase: 4,
  category: "reel",
  tags: ["graduates", "documentary", "callback"],
  style: "Documentary · triumphant",
  description: "Callback to the stars, “We've traced the journey”, graduate portraits with lower thirds.",
  build: () =>
    video(
      [
        scene("photo-hero", { headline: "Research built civilization.", position: "center", image: "" }, { id: "h1", duration: 90, background: { color: "#0B1630", motion: "pan-left", overlay: 0.2 } }),
        scene("kinetic-title", { headline: "We've traced the journey.", animation: "mask", align: "center" }, { id: "h2", duration: 75, background: { color: NEAR_BLACK } }),
        scene("photo-hero", { headline: "Now meet the people continuing it.", position: "bottom", image: "" }, { id: "h3", duration: 105, background: { color: "#2B2119", motion: "zoom-in", overlay: 0.2 } }),
        scene("lower-third", { name: "Data Analyst.", role: "Former student. Problem-solver.", style: "bar", image: "" }, { id: "h4", duration: 105, background: { color: "#2B2119", motion: "zoom-in" } }),
        scene("lower-third", { name: "Research Fellow.", role: "Community advocate. Change-maker.", style: "bar", image: "" }, { id: "h5", duration: 105, background: { color: "#2B2119", motion: "zoom-out" } }),
        scene("kinetic-title", { headline: "The DAWB Generation.", animation: "scale", align: "center" }, { id: "h6", duration: 75, background: { color: NEAR_BLACK } }),
        outro("Research built civilization. We are building the researchers.", NEAR_BLACK, "h7"),
      ],
      { theme: { ...serif, accent: "#E6BA62" } },
    ),
});

// Post 28
export const reel28 = def({
  id: "v28-fellow-story",
  name: "Reel — Fellow Story: A Pattern No One Had Named",
  post: 28,
  phase: 4,
  category: "reel",
  alsoIn: ["spotlight"],
  tags: ["fellow", "field research", "discovery"],
  style: "Mini-documentary · contemplative",
  description: "He grew up watching this problem… joined DAWB… [Key finding]. Bracketed text is from the calendar — replace with the real finding.",
  build: () =>
    video(
      [
        scene("photo-hero", { headline: "He grew up watching this problem.", subline: "He didn't have the tools to prove it existed.", image: "" }, { id: "i1", duration: 120, background: { color: "#2B2119", motion: "pan-right", overlay: 0.2 } }),
        scene("kinetic-title", { headline: "Then he joined DAWB.", animation: "rise", align: "center" }, { id: "i2", duration: 75, background: { color: NEAR_BLACK } }),
        scene("split-media", { eyebrow: "Field research", headline: "A research question. A methodology. The skills to collect what he needed.", body: "", side: "left", image: "" }, { id: "i3", duration: 135, background: { color: "#F7EFE3" } }),
        scene("kinetic-title", { eyebrow: "The discovery", headline: "[Key finding].", animation: "typewriter" }, { id: "i4", duration: 105, background: { color: NEAR_BLACK } }),
        scene("kinetic-title", { headline: "Nobody had documented this before.", highlight: "Nobody", animation: "rise" }, { id: "i5", duration: 90, background: { color: NEAR_BLACK } }),
        scene("lower-third", { name: "[Fellow Name]", role: "DAWB Research Fellow", style: "line", image: "" }, { id: "i6", duration: 105, background: { color: "#2B2119", motion: "zoom-in" } }),
        outro("Research built civilization. DAWB is building the researchers.", NEAR_BLACK, "i7"),
      ],
      { theme: grotesk },
    ),
});

// Post 30
export const reel30 = def({
  id: "v30-movement",
  name: "Reel — The Movement: You Are the Research Revolution",
  post: 30,
  phase: 4,
  category: "reel",
  tags: ["manifesto", "movement", "cohort 3", "climax"],
  style: "Campaign manifesto · cinematic",
  description: "The campaign's climax: stars callback, montage, the DAWB generation, “Are you part of it?”",
  build: () =>
    video(
      [
        scene("photo-hero", { headline: "22,000 years ago, a human looked up at the sky and asked why.", position: "bottom", image: "" }, { id: "j1", duration: 135, background: { color: "#0B1630", motion: "zoom-in", overlay: 0.2 } }),
        scene("list-reveal", { title: "Every answer led to a new question.", items: [{ text: "The Ishango Bone" }, { text: "Alexandria" }, { text: "John Snow's map" }, { text: "DNA" }, { text: "The data dashboard" }], numbered: false }, { id: "j2", duration: 150, background: { color: "#1B120C" } }),
        scene("photo-hero", { headline: "And now, here. In Africa. A new generation is continuing the work.", position: "bottom", image: "" }, { id: "j3", duration: 135, background: { color: "#2B2119", motion: "pan-left", overlay: 0.2 } }),
        scene("kinetic-title", { headline: "This is the DAWB generation.", animation: "mask", align: "center" }, { id: "j4", duration: 90, background: { color: NEAR_BLACK } }),
        scene("kinetic-title", { headline: "The question is: are you part of it?", highlight: "you", animation: "rise", align: "center" }, { id: "j5", duration: 105, background: { color: NEAR_BLACK } }),
        outro("Cohort 3. Apply now.", NEAR_BLACK, "j6"),
      ],
      { theme: { ...serif, accent: "#E6BA62" } },
    ),
});

export const REELS = [reel01, reel03, reel06, reel09, reel14, reel17, reel23, reel25, reel28, reel30];

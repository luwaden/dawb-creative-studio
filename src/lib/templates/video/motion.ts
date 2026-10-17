import { scene, video } from "@/lib/video/build";
import type { VideoTemplate } from "../types";

const NEAR_BLACK = "#0D1F26";
const outro = (cta: string, id: string, bg = NEAR_BLACK) => scene("logo-outro", { cta, url: "www.dawblearn.org", showHandle: true }, { id, duration: 75, background: { color: bg } });

export const motion05 = {
  kind: "video",
  id: "m05-ishango-story",
  name: "Story Animation — The Ishango Bone",
  post: 5,
  phase: 1,
  category: "motion",
  alsoIn: ["story"],
  aspect: "portrait",
  tags: ["ishango", "stories", "data set"],
  style: "Slow zoom · numbers animate in",
  description: "15–20 s Stories animation: slow zoom into the bone, patterns highlighted, “This is Africa's first data set.”",
  build: () =>
    video(
      [
        scene("photo-hero", { tag: "c. 20,000 BCE · Congo", headline: "The Ishango Bone", position: "bottom", image: "" }, { id: "k1", duration: 120, background: { color: "#3A2A1C", motion: "zoom-in", overlay: 0.2 } }),
        scene("list-reveal", { title: "Carved into its surface:", items: [{ text: "Prime number sequences" }, { text: "Doubling patterns" }, { text: "Possible lunar markings" }], numbered: true }, { id: "k2", duration: 150, background: { color: "#F3E5D0" } }),
        scene("kinetic-title", { headline: "This is Africa's first data set.", highlight: "first data set", animation: "mask", align: "center" }, { id: "k3", duration: 105, background: { color: NEAR_BLACK } }),
      ],
      { theme: { displayFont: "Space Grotesk", bodyFont: "Inter" } },
    ),
} satisfies VideoTemplate;

export const motion11 = {
  kind: "video",
  id: "m11-300-million",
  name: "Motion Statement — 300,000,000",
  post: 11,
  phase: 2,
  category: "motion",
  alsoIn: ["statement"],
  aspect: "feed",
  tags: ["smallpox", "counter", "statement"],
  style: "Animated counter · stark",
  description: "Animated version of the Post 11 statement: the number counts up, then “Then research ended it.”",
  build: () =>
    video(
      [
        scene("stat-counter", { title: "Smallpox · 20th century", stats: [{ value: 300000000, suffix: "", label: "people killed in the 20th century alone" }], note: "" }, { id: "l1", duration: 135, background: { color: "#0A0C0D" } }),
        scene("kinetic-title", { headline: "Then research ended it. Forever.", highlight: "Forever.", animation: "rise" }, { id: "l2", duration: 105, background: { color: "#0A0C0D" } }),
        outro("Join the movement — DAWB Cohort 3", "l3", "#0A0C0D"),
      ],
      { aspect: "feed", theme: { displayFont: "Space Grotesk", bodyFont: "Inter" } },
    ),
} satisfies VideoTemplate;

export const motion12 = {
  kind: "video",
  id: "m12-research-gap",
  name: "Animated Chart — The Research Gap",
  post: 12,
  phase: 2,
  category: "motion",
  alsoIn: ["infographic"],
  aspect: "feed",
  tags: ["research gap", "chart", "africa"],
  style: "Animated bars · urgent → hopeful",
  description: "Bars grow to 25% vs 2%: Africa's share of the disease burden vs research output.",
  build: () =>
    video(
      [
        scene("bar-chart", { title: "Africa's share of the world", items: [{ label: "Disease burden", value: 25 }, { label: "Research output", value: 2 }], unit: "%", caption: "Figures from the campaign brief (Post 12)" }, { id: "n1", duration: 150, background: { color: "#0B1630" } }),
        scene("kinetic-title", { headline: "The gap is the mission.", highlight: "mission.", animation: "mask", align: "center" }, { id: "n2", duration: 90, background: { color: "#0B1630" } }),
        outro("DAWB is building the researchers Africa needs.", "n3", "#0B1630"),
      ],
      { aspect: "feed", theme: { displayFont: "Space Grotesk", bodyFont: "Inter", accent: "#E5534B" } },
    ),
} satisfies VideoTemplate;

export const motion02 = {
  kind: "video",
  id: "m02-africa-swipe",
  name: "Swipe Animation — Africa Was the First Research Institution",
  post: 2,
  phase: 1,
  category: "motion",
  alsoIn: ["reel"],
  aspect: "portrait",
  tags: ["timbuktu", "kemet", "swipe", "reel adaptation"],
  style: "Swipe-style carousel animation",
  description: "Reel adaptation of the Post 2 carousel: each slide slides in, words scroll in from the left.",
  build: () =>
    video(
      [
        scene("kinetic-title", { eyebrow: "A history they didn't teach you in school", headline: "Africa Was the World's First Research Institution", highlight: "Africa", animation: "rise" }, { id: "o1", duration: 120, transition: { type: "slide", direction: "from-right" }, background: { color: "#2A1C14", texture: "lines" } }),
        scene("split-media", { eyebrow: "14th century · Mali", headline: "Timbuktu — The First University", body: "25,000 students. Nearly 1 million manuscripts.", side: "left", image: "" }, { id: "o2", duration: 120, transition: { type: "slide", direction: "from-right" }, background: { color: "#2A1C14" } }),
        scene("split-media", { eyebrow: "Ancient Egypt", headline: "Kemet Built the Blueprint", body: "Anatomy, surgery, agriculture, architectural mathematics — documented on papyrus.", side: "right", image: "" }, { id: "o3", duration: 120, transition: { type: "slide", direction: "from-right" }, background: { color: "#2A1C14" } }),
        scene("kinetic-title", { headline: "Research wasn't imported to Africa. It was exported FROM Africa.", highlight: "FROM Africa.", animation: "rise" }, { id: "o4", duration: 120, transition: { type: "slide", direction: "from-right" }, background: { color: "#2A1C14" } }),
        outro("We didn't lose that spirit. We're reclaiming it.", "o5"),
      ],
      { theme: { displayFont: "Playfair Display", bodyFont: "Inter", accent: "#D9A04A" } },
    ),
} satisfies VideoTemplate;

export const motion20 = {
  kind: "video",
  id: "m20-harvest-stats",
  name: "Motion Stats — Predictive Analytics Saved the Harvest",
  post: 20,
  phase: 3,
  category: "motion",
  aspect: "square",
  tags: ["agriculture", "counter", "kenya"],
  style: "Animated numbers · field tones",
  description: "Square motion graphic: 60% workforce, 30–40% less crop loss, then the DAWB close.",
  build: () =>
    video(
      [
        scene("stat-counter", { title: "African agriculture", stats: [{ value: 60, suffix: "%", label: "of Africa's workforce depends on agriculture" }], note: "" }, { id: "q1", duration: 120, background: { color: "#121C15" } }),
        scene("stat-counter", { title: "With predictive analytics", stats: [{ value: 40, suffix: "%", label: "less crop loss (30–40% in East African trials)" }], note: "" }, { id: "q2", duration: 120, background: { color: "#121C15" } }),
        outro("Train to solve Africa's problems with data.", "q3", "#121C15"),
      ],
      { aspect: "square", theme: { displayFont: "Space Grotesk", bodyFont: "Inter", accent: "#E3B04B" } },
    ),
} satisfies VideoTemplate;

export const MOTION = [motion02, motion05, motion11, motion12, motion20];

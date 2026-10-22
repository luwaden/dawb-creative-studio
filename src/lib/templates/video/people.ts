import { scene, video } from "@/lib/video/build";
import type { AspectId, VideoDoc } from "@/lib/video/types";
import { normalizeRecord, type SheetRecord } from "@/lib/sheets/schema";
import { lines } from "@/lib/lessons";
import { LESSON_AVERAGE, LESSON_CALCULATE, LESSON_CONCATENATE, LESSON_SUM, SAMPLE_SPEAKER, SAMPLE_TRAINEE, SAMPLE_TRAINEE_2 } from "../records";
import type { CategoryId, VideoTemplate } from "../types";

/**
 * Motion templates driven by Google Sheets rows: speaker introductions, trainee
 * quotes and formula explainers. Each has build() (sample data) and buildFrom(row).
 */
const music = (track: "pulse" | "ambient" | "celebrate", volume = 0.45): VideoDoc["audio"] => ({ src: `/audio/music-${track}.mp3`, name: `DAWB ${track[0].toUpperCase()}${track.slice(1)} (built-in)`, volume, fadeOutFrames: 45 });
const outro = (bg: string, cta: string, id: string) => scene("logo-outro", { cta, url: "www.dawblearn.org", showHandle: true }, { id, duration: 90, background: { color: bg, texture: "signature" }, sfx: "chime" });
const photoOf = (r: SheetRecord) => (r.photo_url?.startsWith("/") ? r.photo_url : "");

function dataVideo(t: Omit<VideoTemplate, "kind" | "post" | "phase" | "build" | "buildFrom"> & { category: CategoryId; sample: SheetRecord; make: (r: SheetRecord) => VideoDoc }): VideoTemplate {
  const { sample, make, ...rest } = t;
  const from = (r: SheetRecord) => make(rest.dataSource ? normalizeRecord(rest.dataSource, r) : r);
  return { kind: "video", post: null, phase: null, ...rest, build: () => from(sample), buildFrom: from };
}

// ───────── speakers ─────────
function speakerVideo(aspect: AspectId, bg: string, texture: "orbits" | "dotgrid" | "halftone") {
  return (r: SheetRecord): VideoDoc => {
    const d = video(
      [
        scene("speaker-profile", { series: r.series, name: r.name, role: r.role, organisation: r.organisation, bio: r.bio, expertise: r.expertise, image: photoOf(r), webinarTitle: r.webinar_title, date: r.webinar_date, time: r.webinar_time, platform: r.platform }, { id: "spk1", duration: 240, background: { color: bg, texture }, sfx: "whoosh", transition: { type: "fade", durationInFrames: 16 } }),
        outro(bg === "#FFFFFF" ? "#071C24" : "#0097B2", r.registration_link ? `Register: ${r.registration_link}` : "Register at dawblearn.org", "spk2"),
      ],
      { aspect },
    );
    return { ...d, audio: music("ambient") };
  };
}

export const vSpeakerPortrait = dataVideo({
  id: "v-speaker-profile",
  name: "Speaker Profile — Animated Intro (9:16)",
  category: "speakers",
  alsoIn: ["btd"],
  aspect: "portrait",
  dataSource: "speakers",
  tags: ["speaker", "webinar", "introduction", "reel", "story"],
  style: "Dark · circular photo reveal · bio word by word · live webinar card",
  description: "The portrait opens in a circle inside a turning dotted orbit, the name rises letter by letter, the bio fades in word by word, expertise chips pop and the webinar card slides up.",
  sample: SAMPLE_SPEAKER,
  make: speakerVideo("portrait", "#071C24", "orbits"),
});

export const vSpeakerLandscape = dataVideo({
  id: "v-speaker-profile-16x9",
  name: "Speaker Profile — Webinar Intro (16:9)",
  category: "speakers",
  alsoIn: ["btd"],
  aspect: "landscape",
  dataSource: "speakers",
  tags: ["speaker", "webinar", "youtube", "linkedin", "landscape", "opening slide"],
  style: "White · arch photo reveal beside the profile",
  description: "Widescreen speaker introduction for YouTube, LinkedIn and the opening of the live session: arch-framed photo reveal beside the full profile.",
  sample: SAMPLE_SPEAKER,
  make: speakerVideo("landscape", "#FFFFFF", "dotgrid"),
});

export const vSpeakerSquare = dataVideo({
  id: "v-speaker-profile-square",
  name: "Speaker Profile — Feed Post (1:1)",
  category: "speakers",
  aspect: "square",
  dataSource: "speakers",
  tags: ["speaker", "webinar", "square", "feed"],
  style: "DAWB cyan · compact profile",
  description: "Square feed version of the speaker introduction on DAWB cyan.",
  sample: SAMPLE_SPEAKER,
  make: speakerVideo("square", "#0097B2", "halftone"),
});

// ───────── trainee quotes ─────────
function quoteVideo(aspect: AspectId, bg: string, texture: "contours" | "dotgrid" | "halftone") {
  return (r: SheetRecord): VideoDoc => {
    const d = video(
      [
        scene("testimonial", { quote: r.quote, name: r.name, occupation: r.occupation, location: r.location, image: photoOf(r), track: r.track, progress: r.progress }, { id: "tq1", duration: 240, background: { color: bg, texture }, sfx: "shimmer", transition: { type: "fade", durationInFrames: 16 } }),
        outro(bg === "#FFFFFF" ? "#071C24" : "#FFFFFF", r.track ? `Learn ${r.track} with DAWB` : "Learn with DAWB", "tq2"),
      ],
      { aspect },
    );
    return { ...d, audio: music("ambient", 0.4) };
  };
}

export const vQuotePortrait = dataVideo({
  id: "v-trainee-quote",
  name: "Trainee Quote — Word by Word (9:16)",
  category: "quotes",
  aspect: "portrait",
  dataSource: "trainees",
  tags: ["trainee", "testimonial", "quote", "reel", "story"],
  style: "White · quote reveals word by word · progress bar fills",
  description: "The quote mark lands, the trainee's words light up one by one, then their photo, name, occupation, location and a progress bar that fills from their progress note.",
  sample: SAMPLE_TRAINEE,
  make: quoteVideo("portrait", "#FFFFFF", "contours"),
});

export const vQuoteFeed = dataVideo({
  id: "v-trainee-quote-feed",
  name: "Trainee Quote — Feed (4:5, Dark)",
  category: "quotes",
  aspect: "feed",
  dataSource: "trainees",
  tags: ["trainee", "quote", "feed", "linkedin", "instagram"],
  style: "Dark · 4:5 feed",
  description: "Feed-sized trainee quote for Instagram and LinkedIn on the DAWB night background.",
  sample: SAMPLE_TRAINEE_2,
  make: quoteVideo("feed", "#071C24", "dotgrid"),
});

export const vQuoteLandscape = dataVideo({
  id: "v-trainee-quote-16x9",
  name: "Trainee Quote — Widescreen (16:9)",
  category: "quotes",
  aspect: "landscape",
  dataSource: "trainees",
  tags: ["trainee", "quote", "landscape", "youtube", "graduation"],
  style: "DAWB cyan · photo beside the quote",
  description: "Widescreen version with the portrait beside the quote — for graduation screens, YouTube and presentations.",
  sample: SAMPLE_TRAINEE,
  make: quoteVideo("landscape", "#0097B2", "halftone"),
});

// ───────── lessons ─────────
function lessonVideo(aspect: AspectId, mode: "light" | "dark") {
  return (r: SheetRecord): VideoDoc => {
    const bg = mode === "light" ? "#FFFFFF" : "#071C24";
    const remember = [...lines(r.tip, 1), ...lines(r.use_when, 2)].map((text) => ({ text }));
    const d = video(
      [
        scene("kinetic-title", { eyebrow: `${r.tool} · Class notes`, headline: r.function_name, highlight: r.function_name, subline: r.topic || r.what_it_does, align: "left", animation: "rise" }, { id: "ls1", duration: 90, background: { color: bg, texture: "dotgrid" }, sfx: "whoosh", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
        scene("formula-lesson", { tool: r.tool, functionName: r.function_name, formula: r.example_formula, table: r.example_table, resultCell: r.result_cell, result: r.example_result, caption: r.what_it_does }, { id: "ls2", duration: 240, background: { color: bg, texture: "dotgrid" }, sfx: "click", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
        scene("list-reveal", { title: "Remember", items: remember.length ? remember : [{ text: r.syntax }], numbered: false }, { id: "ls3", duration: 150, background: { color: mode === "light" ? "#0097B2" : "#FFFFFF", texture: mode === "light" ? "halftone" : "contours" }, sfx: "pop", transition: { type: "fade", durationInFrames: 14 } }),
        outro(mode === "light" ? "#071C24" : "#0097B2", r.next_topic ? `Next class: ${r.next_topic}` : "Learn with DAWB", "ls4"),
      ],
      { aspect },
    );
    return { ...d, audio: music("pulse", 0.4) };
  };
}

function lessonTpl(id: string, name: string, sample: SheetRecord, aspect: AspectId, mode: "light" | "dark") {
  return dataVideo({
    id,
    name,
    category: "lessons",
    alsoIn: ["training"],
    aspect,
    dataSource: "lessons",
    tags: ["class", "lesson", "formula", "explainer", (sample.tool ?? "").toLowerCase(), (sample.function_name ?? "").toLowerCase()],
    style: `${mode === "light" ? "White" : "Night"} · formula types itself · cells highlight · result pops`,
    description: `${sample.function_name} explained in motion: the formula types into the formula bar, the cells it uses light up, the result pops in, then the key things to remember.`,
    sample,
    make: lessonVideo(aspect, mode),
  });
}

export const LESSON_VIDEOS = [
  lessonTpl("v-lesson-excel-sum", "Class Explainer — Excel SUM (4:5)", LESSON_SUM, "feed", "light"),
  lessonTpl("v-lesson-excel-average", "Class Explainer — Excel AVERAGE (9:16)", LESSON_AVERAGE, "portrait", "dark"),
  lessonTpl("v-lesson-excel-concatenate", "Class Explainer — Excel CONCATENATE (4:5)", LESSON_CONCATENATE, "feed", "dark"),
  lessonTpl("v-lesson-pbi-calculate", "Class Explainer — Power BI CALCULATE (9:16)", LESSON_CALCULATE, "portrait", "light"),
];

export const PEOPLE_VIDEOS = [vSpeakerPortrait, vSpeakerLandscape, vSpeakerSquare, vQuotePortrait, vQuoteFeed, vQuoteLandscape, ...LESSON_VIDEOS];


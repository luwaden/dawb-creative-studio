import { scene, video } from "@/lib/video/build";
import type { VideoDoc } from "@/lib/video/types";
import { TRAINING_TOOLS, TRAINING_TOOL_IDS, type TrainingTool } from "@/lib/training";
import type { CategoryId, VideoTemplate } from "../types";

/**
 * Research, data and training motion templates. Figures are SAMPLE DATA (each
 * chart scene says so in its source line); names, dates and links are placeholders.
 */
const music = (track: "pulse" | "ambient" | "festive" | "celebrate", volume = 0.5): VideoDoc["audio"] => ({ src: `/audio/music-${track}.mp3`, name: `DAWB ${track[0].toUpperCase()}${track.slice(1)} (built-in)`, volume, fadeOutFrames: 45 });

function def(t: Omit<VideoTemplate, "kind" | "post" | "phase"> & { category: CategoryId }): VideoTemplate {
  return { kind: "video", post: null, phase: null, ...t };
}

const outro = (bg: string, cta: string, id: string) => scene("logo-outro", { cta, url: "www.dawblearn.org", showHandle: true }, { id, duration: 90, background: { color: bg, texture: "signature" }, sfx: "chime" });
const SAMPLE = "Sample data — replace with your figures and source";
const STUDY = "How Nigerian graduates learn data skills";
const MEMBERS = [
  { name: "Member Name", role: "Lead Researcher", location: "Lagos, Nigeria" },
  { name: "Member Name", role: "Data Analyst", location: "Abuja, Nigeria" },
  { name: "Member Name", role: "Statistician", location: "Ibadan, Nigeria" },
  { name: "Member Name", role: "Field Coordinator", location: "Kano, Nigeria" },
];
const STATES = [["Lagos", 412], ["FCT", 268], ["Oyo", 154], ["Kaduna", 131], ["Rivers", 122], ["Kano", 118], ["Enugu", 96], ["Ogun", 92], ["Edo", 74], ["Plateau", 61], ["Anambra", 58], ["Kwara", 55], ["Delta", 52]] as const;

export const vResearchAnnounce = def({
  id: "v-research-announce",
  name: "Research — Announcement + Questionnaire QR",
  category: "research",
  aspect: "portrait",
  tags: ["research", "announcement", "questionnaire", "qr", "survey"],
  style: "White → cyan → white · kinetic type · QR assembles",
  description: "Announces a new study, lists its objectives, then shows a scannable QR for the questionnaire with time, deadline and privacy note.",
  build: () => {
    const d = video([
      scene("kinetic-title", { eyebrow: "DAWB Research", headline: "We're starting\na new study.", highlight: "new study", subline: STUDY, align: "left", animation: "rise" }, { id: "ra1", duration: 120, background: { color: "#FFFFFF", texture: "contours" }, sfx: "whoosh", transition: { type: "wipe", durationInFrames: 16, direction: "from-right" } }),
      scene("list-reveal", { title: "What we want to learn", items: [{ text: "How graduates learn data skills" }, { text: "What blocks access to tools" }, { text: "What support would help most" }], numbered: true }, { id: "ra2", duration: 135, background: { color: "#0097B2", texture: "halftone" }, sfx: "click", transition: { type: "slide", durationInFrames: 14, direction: "from-bottom" } }),
      scene("qr-call", { eyebrow: "Call for participants", title: "Your answers\nshape the study", message: "Graduates, students and early-career analysts — we'd love to hear from you.", link: "https://www.dawblearn.org", linkText: "[your form link]", cta: "Scan to take the survey", duration: "About 5 minutes", deadline: "Closes 00 Month", privacy: "Anonymous" }, { id: "ra3", duration: 210, background: { color: "#FFFFFF", texture: "dotgrid" }, sfx: "pop", transition: { type: "fade", durationInFrames: 14 } }),
      outro("#071C24", "Share with a friend", "ra4"),
    ]);
    return { ...d, audio: music("ambient") };
  },
});

export const vQuestionnaire = def({
  id: "v-questionnaire-qr",
  name: "Questionnaire — Scan the QR (Dark)",
  category: "research",
  aspect: "feed",
  tags: ["questionnaire", "survey", "qr", "call for participants", "dark"],
  style: "Dark · glowing QR with scan line · pulse music",
  description: "A focused 4:5 reminder: the QR assembles row by row, a scan line sweeps it, and the details tick in.",
  build: () => {
    const d = video([
      scene("qr-call", { eyebrow: "Questionnaire open", title: "Two minutes.\nReal impact.", message: "", link: "https://www.dawblearn.org", linkText: "[your form link]", cta: "Scan to respond", duration: "2–5 minutes", deadline: "Closes 00 Month", privacy: "Anonymous & confidential" }, { id: "vq1", duration: 240, background: { color: "#050F13", texture: "orbits" }, sfx: "glitch", transition: { type: "zoom", durationInFrames: 14 } }),
      outro("#0097B2", "Every response counts", "vq2"),
    ], { aspect: "feed" });
    return { ...d, audio: music("pulse", 0.45) };
  },
});

export const vResearchTeam = def({
  id: "v-research-team",
  name: "Research Team — Meet the Team",
  category: "research",
  aspect: "portrait",
  tags: ["team", "research team", "members", "profiles", "spotlight"],
  style: "White grid → dark spotlights · dotted photo orbits",
  description: "Introduces the team as a grid of profile cards, then spotlights two members with name, profession and location.",
  build: () => {
    const d = video([
      scene("team", { title: "Meet the\nresearch team", subtitle: STUDY, layout: "grid", members: MEMBERS }, { id: "rt1", duration: 165, background: { color: "#FFFFFF", texture: "dotgrid" }, sfx: "whoosh", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
      scene("team", { title: "Lead researcher", subtitle: "Designs the questionnaire and leads the analysis.", layout: "spotlight", members: [MEMBERS[0]] }, { id: "rt2", duration: 120, background: { color: "#071C24", texture: "orbits" }, sfx: "pop", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
      scene("team", { title: "Data analyst", subtitle: "Cleans the responses and builds the dashboards.", layout: "spotlight", members: [MEMBERS[1]] }, { id: "rt3", duration: 120, background: { color: "#0097B2", texture: "halftone" }, sfx: "pop", transition: { type: "fade", durationInFrames: 14 } }),
      outro("#FFFFFF", "Research with DAWB", "rt4"),
    ]);
    return { ...d, audio: music("ambient") };
  },
});

export const vApplicantStats = def({
  id: "v-applicant-stats",
  name: "Data — Applicants by State, Gender & Track",
  category: "data",
  aspect: "portrait",
  tags: ["applicants", "map", "nigeria", "gender", "pie", "column", "line", "statistics"],
  style: "Map fills by state → pie sweeps → columns rise → line draws",
  description: "Training-programme numbers in motion: a Nigeria map shading by state, a gender pie, applications by track and registrations over time.",
  build: () => {
    const d = video([
      scene("data-chart", { eyebrow: "Cohort 2026 · Applicants", title: "Where applicants\ncame from", kind: "map", map: "nigeria", items: STATES.map(([label, value]) => ({ label, value })), unit: "", insight: "Lagos and the FCT led — 37% of all applications.", source: SAMPLE }, { id: "as1", duration: 210, background: { color: "#FFFFFF", texture: "dotgrid" }, sfx: "whoosh", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
      scene("data-chart", { eyebrow: "Applicants by gender", title: "More women\napplied than ever", kind: "pie", items: [{ label: "Women", value: 54 }, { label: "Men", value: 44 }, { label: "Prefer not to say", value: 2 }], unit: "%", insight: "", source: SAMPLE }, { id: "as2", duration: 165, background: { color: "#071C24", texture: "orbits" }, sfx: "pop", transition: { type: "wipe", durationInFrames: 16, direction: "from-bottom" } }),
      scene("data-chart", { eyebrow: "Applications by track", title: "Power BI led\nthis cohort", kind: "column", items: [{ label: "Power BI", value: 486 }, { label: "Excel", value: 402 }, { label: "SQL", value: 355 }, { label: "Python", value: 298 }, { label: "SPSS", value: 214 }, { label: "R", value: 107 }], insight: "", source: SAMPLE }, { id: "as3", duration: 165, background: { color: "#FFFFFF", texture: "contours" }, sfx: "click", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
      scene("data-chart", { eyebrow: "Registrations · 8 weeks", title: "Momentum built\nevery week", kind: "line", items: [84, 121, 160, 198, 236, 287, 323, 446].map((value, i) => ({ label: `W${i + 1}`, value })), insight: "Week 8 was the busiest: +38% on week 7.", source: SAMPLE }, { id: "as4", duration: 180, background: { color: "#0097B2", texture: "halftone" }, sfx: "riser", transition: { type: "fade", durationInFrames: 14 } }),
      outro("#071C24", "Applications open at dawblearn.org", "as5"),
    ]);
    return { ...d, audio: music("pulse", 0.45) };
  },
});

export const vResearchResults = def({
  id: "v-research-results",
  name: "Research Results — Findings in Motion (16:9)",
  category: "data",
  aspect: "landscape",
  tags: ["research results", "findings", "analysis", "scatter", "waterfall", "histogram", "bar", "youtube", "presentation"],
  style: "16:9 · ranked bars, histogram, scatter with trend, waterfall",
  description: "Presentation-ready results video: barriers ranked, age distribution, a relationship with a trend line and an admissions waterfall.",
  build: () => {
    const d = video([
      scene("kinetic-title", { eyebrow: "Research results", headline: "The results\nare in.", highlight: "results", subline: STUDY, align: "left", animation: "rise" }, { id: "rr1", duration: 105, background: { color: "#071C24", texture: "orbits" }, sfx: "impact", transition: { type: "wipe", durationInFrames: 16, direction: "from-right" } }),
      scene("data-chart", { eyebrow: "Biggest barriers", title: "What holds learners back", kind: "bar", items: [{ label: "Cost of data", value: 64 }, { label: "Laptop access", value: 58 }, { label: "Mentorship", value: 47 }, { label: "Real datasets", value: 39 }, { label: "Time", value: 22 }], unit: "%", insight: "Cost and access — not interest — are the main barriers.", source: SAMPLE }, { id: "rr2", duration: 180, background: { color: "#FFFFFF", texture: "dotgrid" }, sfx: "click", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
      scene("data-chart", { eyebrow: "Respondents by age", title: "Most respondents are 22–29", kind: "histogram", items: [["18–19", 64], ["20–21", 212], ["22–23", 398], ["24–25", 451], ["26–27", 327], ["28–29", 198], ["30–31", 121], ["32–33", 61], ["34+", 30]].map(([label, value]) => ({ label, value })), insight: "Median age: 25.", source: SAMPLE }, { id: "rr3", duration: 165, background: { color: "#FFFFFF", texture: "contours" }, transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
      scene("data-chart", { eyebrow: "Practice vs score", title: "More practice, higher scores", kind: "scatter", items: [[1, 42], [2, 48], [2, 51], [3, 55], [4, 58], [4, 54], [5, 63], [5, 61], [6, 67], [7, 70], [7, 66], [8, 74], [8, 72], [9, 79], [10, 77], [11, 83], [11, 81], [12, 88]].map(([x, value]) => ({ label: "", x, value })), xTitle: "Study hours per week", yTitle: "Score (%)", insight: "A strong association — correlation, not proof of cause.", source: SAMPLE }, { id: "rr4", duration: 180, background: { color: "#0E1A1F", texture: "dotgrid" }, sfx: "shimmer", transition: { type: "fade", durationInFrames: 14 } }),
      scene("data-chart", { eyebrow: "Admissions", title: "From applications to learners", kind: "waterfall", items: [{ label: "Applied", value: 1862 }, { label: "Incomplete", value: -412 }, { label: "Screening", value: -536 }, { label: "Declined", value: -310 }, { label: "Waitlist", value: 36 }, { label: "Enrolled", value: 0 }], insight: "640 learners enrolled from 1,862 applications.", source: SAMPLE }, { id: "rr5", duration: 195, background: { color: "#FFFFFF", texture: "dotgrid" }, sfx: "riser", transition: { type: "zoom", durationInFrames: 14 } }),
      outro("#0097B2", "Read the full report", "rr6"),
    ], { aspect: "landscape" });
    return { ...d, audio: music("ambient", 0.45) };
  },
});

export const vCommunityReach = def({
  id: "v-community-reach",
  name: "Data — Reach Across Africa (Map + Donut)",
  category: "data",
  aspect: "square",
  tags: ["africa", "map", "countries", "donut", "community", "reach"],
  style: "Square · dark Africa map · donut",
  description: "Countries light up across a dark map of Africa, then a donut shows the share of learners by region.",
  build: () => {
    const d = video([
      scene("data-chart", { eyebrow: "Community reach", title: "Learners in 12 countries", kind: "map", map: "africa", items: [["Nigeria", 1240], ["Ghana", 310], ["Kenya", 220], ["South Africa", 160], ["Egypt", 90], ["Uganda", 84], ["Rwanda", 66], ["Cameroon", 58], ["Ethiopia", 51], ["Tanzania", 47], ["Zambia", 33], ["Senegal", 29]].map(([label, value]) => ({ label, value })), insight: "", source: SAMPLE }, { id: "cr1", duration: 195, background: { color: "#050F13", texture: "dotgrid" }, sfx: "whoosh", transition: { type: "fade", durationInFrames: 16 } }),
      scene("data-chart", { eyebrow: "By region", title: "West Africa leads", kind: "donut", items: [{ label: "West Africa", value: 1327 }, { label: "East Africa", value: 468 }, { label: "Southern Africa", value: 193 }, { label: "North Africa", value: 90 }, { label: "Central Africa", value: 58 }], insight: "", source: SAMPLE }, { id: "cr2", duration: 165, background: { color: "#FFFFFF", texture: "contours" }, sfx: "pop", transition: { type: "slide", durationInFrames: 14, direction: "from-right" } }),
      outro("#0097B2", "Join the community", "cr3"),
    ], { aspect: "square" });
    return { ...d, audio: music("pulse", 0.4) };
  },
});

const MODS: Record<TrainingTool, string[]> = {
  powerbi: ["Power Query", "Data modelling", "DAX", "Dashboards"],
  excel: ["Formulas", "PivotTables", "Cleaning", "Charts"],
  sql: ["SELECT", "JOINs", "GROUP BY", "Window functions"],
  spss: ["Descriptives", "Crosstabs", "t-tests", "Regression"],
  python: ["pandas", "Cleaning", "Matplotlib", "Notebooks"],
  r: ["tidyverse", "ggplot2", "Statistics", "R Markdown"],
  tableau: ["Connections", "Calculations", "Dashboards", "Stories"],
  writing: ["Structure", "Clarity", "Data stories", "Publishing"],
  research: ["Questions", "Questionnaires", "Sampling", "Reporting"],
};
const TONES: Record<TrainingTool, string> = { powerbi: "#071C24", excel: "#FFFFFF", sql: "#071C24", spss: "#FFFFFF", python: "#0097B2", r: "#FFFFFF", tableau: "#071C24", writing: "#FFFFFF", research: "#0097B2" };
const TEX: Record<string, "dotgrid" | "orbits" | "halftone" | "contours"> = { "#071C24": "orbits", "#FFFFFF": "dotgrid", "#0097B2": "halftone" };

export const TRAINING_VIDEOS = TRAINING_TOOL_IDS.map((tool) =>
  def({
    id: `v-training-${tool}`,
    name: `Training — ${TRAINING_TOOLS[tool].name} (Motion)`,
    category: "training",
    aspect: "portrait",
    tags: ["training", "course", "cohort", TRAINING_TOOLS[tool].name.toLowerCase(), "register"],
    style: `${TONES[tool] === "#FFFFFF" ? "White" : TONES[tool] === "#0097B2" ? "DAWB cyan" : "Dark"} · animated ${TRAINING_TOOLS[tool].motif} illustration`,
    description: `${TRAINING_TOOLS[tool].name} course announcement: an animated illustration of the tool, modules, start date, duration and mode, then the logo sting.`,
    build: () => {
      const d = video([
        scene("training", { tool, eyebrow: "New cohort", title: "", subtitle: TRAINING_TOOLS[tool].blurb, modules: MODS[tool].map((text) => ({ text })), date: "00 Month", duration: "6 weeks", mode: "Online", cta: "Register now" }, { id: `tv-${tool}-1`, duration: 210, background: { color: TONES[tool], texture: TEX[TONES[tool]] }, sfx: "whoosh", transition: { type: "fade", durationInFrames: 14 } }),
        outro(TONES[tool] === "#FFFFFF" ? "#071C24" : "#FFFFFF", `Learn ${TRAINING_TOOLS[tool].name} with DAWB`, `tv-${tool}-2`),
      ]);
      return { ...d, audio: music("pulse", 0.45) };
    },
  }),
);

export const RESEARCH_VIDEOS = [vResearchAnnounce, vQuestionnaire, vResearchTeam, vApplicantStats, vResearchResults, vCommunityReach, ...TRAINING_VIDEOS];

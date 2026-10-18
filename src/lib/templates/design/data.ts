import type { DesignElement } from "@/lib/design/types";
import { CHART_COLORS } from "@/lib/charts";
import { defineArt, handles, logo, pill, texture, type K } from "./kit";
import { eyebrow, sampleNote } from "./kit2";

/**
 * Data & chart flyers: application statistics and research results.
 * Every figure is SAMPLE DATA for layout — each template carries a visible
 * "Data note / source" field that must be replaced with the real source.
 */
const W = 1080;
const H = 1350;
const ink = "#071C24";
const LIGHT = CHART_COLORS.light;

function header(b: K, o: { tone: "light" | "dark" | "cyan"; eyebrow: string; title: string; sub?: string; titleSize?: number }): DesignElement[] {
  const fg = o.tone === "light" ? ink : "#FFFFFF";
  const acc = o.tone === "light" ? "#0097B2" : o.tone === "cyan" ? ink : "#2FD3EE";
  return [
    logo(b, o.tone === "light" ? "light" : o.tone === "cyan" ? "cyan" : "dark", 60, 46, 110),
    ...handles(b, 560, 64, 460, fg),
    eyebrow(b, o.eyebrow, 64, 200, 952, acc),
    b.text(o.title, { x: 60, y: 238, w: 960, fontFamily: "Manrope", fontSize: o.titleSize ?? 72, fontWeight: 800, fill: fg, lineHeight: 1.04, letterSpacing: -1.5, label: "Headline", name: "Headline", multiline: true }),
    ...(o.sub ? [b.text(o.sub, { x: 64, y: 238 + (o.titleSize ?? 72) * 2.2 + 10, w: 900, fontFamily: "IBM Plex Sans", fontSize: 28, fontWeight: 400, fill: fg, opacity: 0.75, lineHeight: 1.4, label: "Subheading", name: "Subheading", multiline: true })] : []),
  ];
}

function kpi(b: K, x: number, y: number, w: number, value: string, label: string, o: { fg: string; card: string; accent?: string; i: number }): DesignElement[] {
  return [
    b.rect({ x, y, w, h: 150, fill: o.card, cornerRadius: 22, name: `KPI ${o.i} card` }),
    b.text(value, { x: x + 26, y: y + 22, w: w - 52, fontFamily: "Manrope", fontSize: 56, fontWeight: 800, fill: o.accent ?? o.fg, label: `KPI ${o.i} value`, name: `KPI ${o.i} value` }),
    b.text(label, { x: x + 26, y: y + 96, w: w - 52, fontFamily: "IBM Plex Sans", fontSize: 22, fontWeight: 500, fill: o.fg, opacity: 0.7, label: `KPI ${o.i} label`, name: `KPI ${o.i} label` }),
  ];
}

const STATES = ["Lagos", "FCT", "Oyo", "Kaduna", "Rivers", "Kano", "Enugu", "Ogun", "Edo", "Plateau", "Anambra", "Kwara", "Delta", "Ondo", "Osun", "Benue", "Cross River", "Akwa Ibom"];
const STATE_VALUES = [412, 268, 154, 131, 122, 118, 96, 92, 74, 61, 58, 55, 52, 41, 38, 33, 30, 27];

export const dtApplicantsMap = defineArt({
  id: "dt-applicants-map",
  name: "Data — Applicants by State (Nigeria Map)",
  category: "data",
  format: "ig-portrait",
  style: "White · choropleth map of Nigeria · top-states list",
  tags: ["map", "nigeria", "states", "applicants", "location", "choropleth"],
  description: "Where applicants came from: a shaded map of Nigeria's 36 states + FCT with labelled top states and a ranked list.",
  pal: { paper: "#FFFFFF", surface: "#F2F6F7", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.07 }),
        ...header(b, { tone: "light", eyebrow: "Cohort 2026 · Applications", title: "1,862 applicants\nfrom 37 states" }),
        b.chart("map", { x: 40, y: 440, w: 700, h: 620, map: "nigeria", values: STATE_VALUES, labels: STATES, color: "#0097B2", secondaryColor: "#E3EBEE", labelColor: ink, showLabels: true, showValues: true, fontFamily: "IBM Plex Sans", label: "Map data", name: "Map" }),
        b.text("TOP STATES", { x: 770, y: 470, w: 250, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "$muted", letterSpacing: 3, name: "List title" }),
        ...STATES.slice(0, 6).flatMap((s, i): DesignElement[] => [
          b.text(`${i + 1}`, { x: 770, y: 520 + i * 84, w: 40, fontFamily: "IBM Plex Mono", fontSize: 24, fontWeight: 500, fill: "$primary", name: `Rank ${i + 1}` }),
          b.text(s, { x: 810, y: 516 + i * 84, w: 150, fontFamily: "IBM Plex Sans", fontSize: 28, fontWeight: 600, fill: "$ink", label: `State ${i + 1}`, name: `State ${i + 1}` }),
          b.text(String(STATE_VALUES[i]), { x: 900, y: 516 + i * 84, w: 120, fontFamily: "Manrope", fontSize: 28, fontWeight: 800, fill: "$ink", align: "right", label: `State ${i + 1} value`, name: `State ${i + 1} value` }),
          b.rect({ x: 770, y: 562 + i * 84, w: 250 * (STATE_VALUES[i] / STATE_VALUES[0]), h: 6, fill: "$primary", cornerRadius: 3, name: `State ${i + 1} bar` }),
        ]),
        b.rect({ x: 64, y: 1110, w: 952, h: 2, fill: "$ink", opacity: 0.1, name: "Rule" }),
        b.text("Lagos and the FCT account for 37% of all applications.", { x: 64, y: 1140, w: 952, fontFamily: "Manrope", fontSize: 34, fontWeight: 700, fill: "$ink", label: "Key insight", name: "Key insight" }),
        sampleNote(b, 64, 1250, 952, ink),
      ],
    },
  ],
});

const AFRICA = ["Nigeria", "Ghana", "Kenya", "South Africa", "Egypt", "Uganda", "Rwanda", "Cameroon", "Ethiopia", "Tanzania", "Zambia", "Senegal"];
const AFRICA_V = [1240, 310, 220, 160, 90, 84, 66, 58, 51, 47, 33, 29];

export const dtAfricaReach = defineArt({
  id: "dt-africa-reach",
  name: "Data — Reach Across Africa (Dark Map)",
  category: "data",
  format: "ig-portrait",
  style: "Dark · Africa choropleth · glow",
  tags: ["map", "africa", "countries", "reach", "learners", "dark"],
  description: "Learners or respondents by country on a dark map of Africa, with KPI tiles for countries, total and top country.",
  pal: { paper: "#050F13", surface: "#0E2A33", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: "#2FD3EE" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.14, glow: { color: "#0097B2", x: 600, y: 760, size: 1000, opacity: 0.28 } }),
        ...header(b, { tone: "dark", eyebrow: "Community reach · 2026", title: "Learners in\n12 African countries" }),
        b.chart("map", { x: 330, y: 430, w: 690, h: 720, map: "africa", values: AFRICA_V, labels: AFRICA, color: "#2FD3EE", secondaryColor: "#16323B", labelColor: "#FFFFFF", showLabels: false, showValues: true, fontFamily: "IBM Plex Sans", label: "Map data", name: "Map" }),
        ...kpi(b, 64, 470, 240, "12", "countries", { fg: "#FFFFFF", card: "#0E2A33", i: 1 }),
        ...kpi(b, 64, 640, 240, "2,388", "learners", { fg: "#FFFFFF", card: "#0E2A33", i: 2 }),
        ...kpi(b, 64, 810, 240, "52%", "from Nigeria", { fg: "#FFFFFF", card: "#0E2A33", accent: "#2FD3EE", i: 3 }),
        sampleNote(b, 64, 1250, 952, "#FFFFFF"),
      ],
    },
  ],
});

export const dtGenderPie = defineArt({
  id: "dt-gender-pie",
  name: "Data — Gender Split (Cyan Pie)",
  category: "data",
  format: "ig-portrait",
  style: "DAWB cyan · pie chart · big percentage",
  tags: ["pie", "gender", "applicants", "split", "cyan"],
  description: "Gender split of applicants as a pie chart with a legend, a giant headline percentage and a short insight.",
  pal: { paper: "#0097B2", surface: "#0A7F95", ink: "#FFFFFF", muted: "#D6F3F8", primary: "#071C24", accent: "#FFFFFF" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.14, halftone: "#FFFFFF" }),
        ...header(b, { tone: "cyan", eyebrow: "Applicants by gender", title: "More women applied\nthan ever before" }),
        b.text("54%", { x: 56, y: 430, w: 960, fontFamily: "Manrope", fontSize: 230, fontWeight: 800, fill: "#FFFFFF", letterSpacing: -8, label: "Big figure", name: "Big figure" }),
        b.text("of applicants were women", { x: 64, y: 680, w: 500, fontFamily: "IBM Plex Sans", fontSize: 32, fontWeight: 500, fill: "#FFFFFF", label: "Big figure caption", name: "Big figure caption" }),
        b.chart("pie", { x: 64, y: 790, w: 952, h: 400, values: [54, 44, 2], labels: ["Women", "Men", "Prefer not to say"], colors: ["#FFFFFF", "#071C24", "#7FD6E5"], color: "#FFFFFF", secondaryColor: "#071C24", labelColor: "#FFFFFF", showLabels: true, showValues: true, unit: "%", fontFamily: "IBM Plex Sans", label: "Pie data", name: "Pie chart" }),
        sampleNote(b, 64, 1250, 952, "#FFFFFF"),
      ],
    },
  ],
});

export const dtColumnTracks = defineArt({
  id: "dt-column-tracks",
  name: "Data — Applications by Track (Column)",
  category: "data",
  format: "ig-portrait",
  style: "Dark · column chart with grid · highlight bar",
  tags: ["column chart", "bar", "tracks", "applications", "dark"],
  description: "Column chart of applications per training track with value labels, gridlines and the leading track highlighted.",
  pal: { paper: "#071C24", surface: "#0E2A33", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: "#2FD3EE" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.12, contours: "#2FD3EE" }),
        ...header(b, { tone: "dark", eyebrow: "Applications by track", title: "Power BI led\nthis cohort" }),
        b.chart("bar", { x: 64, y: 480, w: 952, h: 620, values: [486, 402, 355, 298, 214, 107], labels: ["Power BI", "Excel", "SQL", "Python", "SPSS", "R"], color: "#2FD3EE", secondaryColor: "#2C4A53", labelColor: "#FFFFFF", showLabels: true, showValues: true, showGrid: true, fontFamily: "IBM Plex Sans", label: "Chart data", name: "Column chart" }),
        b.text("Power BI drew 26% of all applications.", { x: 64, y: 1150, w: 952, fontFamily: "Manrope", fontSize: 34, fontWeight: 700, fill: "#FFFFFF", label: "Key insight", name: "Key insight" }),
        sampleNote(b, 64, 1250, 952, "#FFFFFF"),
      ],
    },
  ],
});

export const dtBarLocations = defineArt({
  id: "dt-bar-locations",
  name: "Data — Top Cities (Horizontal Bar)",
  category: "data",
  format: "ig-portrait",
  style: "Warm paper · ranked bars · editorial",
  tags: ["bar chart", "ranking", "cities", "location", "warm"],
  description: "Ranked horizontal bars for the top cities or locations, on warm paper with an editorial headline.",
  pal: { paper: "#F6F1E8", surface: "#ECE3D3", ink: "#1E1A16", muted: "#7A6D5E", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.07, grain: 1.5 }),
        logo(b, "light", 60, 46, 110),
        ...handles(b, 560, 64, 460, "#1E1A16"),
        eyebrow(b, "Where our applicants live", 64, 200, 952, "$primary"),
        b.text("Top 8 cities", { x: 60, y: 236, w: 960, fontFamily: "Fraunces", fontSize: 96, fontWeight: 600, fill: "$ink", letterSpacing: -2, label: "Headline", name: "Headline" }),
        b.chart("hbar", { x: 64, y: 410, w: 952, h: 760, values: [388, 251, 143, 120, 109, 97, 84, 66], labels: ["Lagos", "Abuja", "Ibadan", "Port Harcourt", "Kano", "Kaduna", "Enugu", "Benin City"], color: "#0097B2", secondaryColor: "#D9CDB8", labelColor: "#1E1A16", showLabels: true, showValues: true, fontFamily: "IBM Plex Sans", label: "Chart data", name: "Bar chart" }),
        sampleNote(b, 64, 1250, 952, "#1E1A16"),
      ],
    },
  ],
});

export const dtLineRegistrations = defineArt({
  id: "dt-line-registrations",
  name: "Data — Registrations Over Time (Line)",
  category: "data",
  format: "ig-portrait",
  style: "White · line + area · KPI tiles",
  tags: ["line chart", "trend", "registrations", "weekly", "growth"],
  description: "Weekly registrations as a line chart with gridlines and a shaded area, plus three KPI tiles.",
  pal: { paper: "#FFFFFF", surface: "#F2F6F7", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.07, glow: { color: "#0097B2", x: 900, y: 600, size: 800, opacity: 0.1 } }),
        ...header(b, { tone: "light", eyebrow: "Registrations · 8 weeks", title: "Momentum built\nweek after week" }),
        ...kpi(b, 64, 450, 300, "1,862", "total registrations", { fg: ink, card: "#F2F6F7", i: 1 }),
        ...kpi(b, 390, 450, 300, "+38%", "week 8 vs week 7", { fg: ink, card: "#F2F6F7", accent: "#0097B2", i: 2 }),
        ...kpi(b, 716, 450, 300, "Week 8", "busiest week", { fg: ink, card: "#F2F6F7", i: 3 }),
        b.chart("line", { x: 64, y: 650, w: 952, h: 520, values: [84, 121, 160, 198, 236, 287, 323, 446], labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"], color: "#0097B2", secondaryColor: "#FFFFFF", labelColor: ink, showLabels: true, showValues: true, showGrid: true, fontFamily: "IBM Plex Sans", label: "Chart data", name: "Line chart" }),
        sampleNote(b, 64, 1250, 952, ink),
      ],
    },
  ],
});

export const dtWaterfall = defineArt({
  id: "dt-waterfall-enrolment",
  name: "Data — From Applications to Enrolment (Waterfall)",
  category: "data",
  format: "ig-portrait",
  style: "Dark · waterfall · connectors",
  tags: ["waterfall", "funnel", "enrolment", "admissions", "dark"],
  description: "A waterfall from total applications through drop-offs to final enrolment, with signed step labels.",
  pal: { paper: "#0B1418", surface: "#14262D", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: "#2FD3EE" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.12 }),
        ...header(b, { tone: "dark", eyebrow: "Admissions breakdown", title: "From 1,862 applications\nto 640 learners", titleSize: 64 }),
        b.chart("waterfall", { x: 64, y: 470, w: 952, h: 640, values: [1862, -412, -536, -310, 36], labels: ["Applied", "Incomplete", "Screening", "Declined", "Waitlist in", "Enrolled"], color: "#33A673", secondaryColor: "#E8684A", labelColor: "#FFFFFF", showLabels: true, showValues: true, showGrid: true, showTotal: true, fontFamily: "IBM Plex Sans", label: "Chart data", name: "Waterfall chart" }),
        b.text("Green adds learners · coral removes · white bars are totals", { x: 64, y: 1150, w: 952, fontFamily: "IBM Plex Sans", fontSize: 24, fontWeight: 500, fill: "#FFFFFF", opacity: 0.75, label: "Legend", name: "Legend" }),
        sampleNote(b, 64, 1250, 952, "#FFFFFF"),
      ],
    },
  ],
});

export const dtHistogramAge = defineArt({
  id: "dt-histogram-age",
  name: "Data — Age Distribution (Histogram)",
  category: "data",
  format: "ig-portrait",
  style: "White · histogram · median marker",
  tags: ["histogram", "age", "distribution", "demographics"],
  description: "Age distribution of applicants as a histogram with contiguous bins and a median callout.",
  pal: { paper: "#FFFFFF", surface: "#F2F6F7", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.07 }),
        ...header(b, { tone: "light", eyebrow: "Applicants by age", title: "Most applicants are\nbetween 22 and 29" }),
        b.chart("histogram", { x: 64, y: 470, w: 952, h: 620, values: [64, 212, 398, 451, 327, 198, 121, 61, 30], labels: ["18–19", "20–21", "22–23", "24–25", "26–27", "28–29", "30–31", "32–33", "34+"], color: "#0097B2", secondaryColor: "#0097B2", labelColor: ink, showLabels: true, showValues: true, showGrid: true, fontFamily: "IBM Plex Sans", label: "Chart data", name: "Histogram" }),
        ...pill(b, "Median age 25", 64, 1140, { fill: "$ink", color: "#FFFFFF", size: 24, label: "Median" }),
        sampleNote(b, 64, 1250, 952, ink),
      ],
    },
  ],
});

export const dtScatter = defineArt({
  id: "dt-scatter-hours-score",
  name: "Data — Study Hours vs Score (Scatter)",
  category: "data",
  format: "ig-portrait",
  style: "Ink · scatter plot · dashed trend line",
  tags: ["scatter plot", "correlation", "relationship", "research results", "analysis"],
  description: "Relationship between weekly study hours and assessment score, with a trend line and a careful, non-causal caption.",
  pal: { paper: "#0E1A1F", surface: "#18292F", ink: "#FFFFFF", muted: "#9FC0C7", primary: "#0097B2", accent: "#2FD3EE" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: false, dots: 0.1 }),
        ...header(b, { tone: "dark", eyebrow: "Research result · Correlation", title: "More practice,\nhigher scores" }),
        b.chart("scatter", { x: 64, y: 460, w: 952, h: 640, values: [42, 48, 51, 55, 58, 54, 63, 61, 67, 70, 66, 74, 72, 79, 77, 83, 81, 88], xValues: [1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 7, 8, 8, 9, 10, 11, 11, 12], labels: ["Study hours per week", "Assessment score (%)"], color: "#2FD3EE", secondaryColor: "#0E1A1F", labelColor: "#FFFFFF", showLabels: true, showValues: false, showGrid: true, fontFamily: "IBM Plex Sans", label: "Chart data", name: "Scatter plot" }),
        b.text("Learners who practised more tended to score higher (r ≈ 0.9 in this sample). Correlation, not proof of cause.", { x: 64, y: 1130, w: 952, fontFamily: "IBM Plex Sans", fontSize: 26, fontWeight: 500, fill: "#FFFFFF", opacity: 0.85, lineHeight: 1.4, label: "Interpretation", name: "Interpretation", multiline: true }),
        sampleNote(b, 64, 1250, 952, "#FFFFFF"),
      ],
    },
  ],
});

export const dtSnapshot = defineArt({
  id: "dt-snapshot-bento",
  name: "Data — Applications Snapshot (Bento)",
  category: "data",
  format: "ig-portrait",
  style: "White bento · KPIs + donut + columns + map",
  tags: ["dashboard", "bento", "applications", "summary", "kpi", "gender", "location"],
  description: "Everything at a glance: total applicants, gender donut, applications by track and a mini map of states.",
  pal: { paper: "#F5F8F9", surface: "#FFFFFF", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Flyer",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.08 }),
        logo(b, "light", 60, 46, 100),
        ...handles(b, 560, 60, 460, "$ink"),
        b.text("Applications at a glance", { x: 60, y: 180, w: 960, fontFamily: "Manrope", fontSize: 64, fontWeight: 800, fill: "$ink", letterSpacing: -1.5, label: "Headline", name: "Headline" }),
        b.rect({ x: 64, y: 290, w: 460, h: 280, fill: "$primary", cornerRadius: 28, name: "Tile total" }),
        b.text("TOTAL APPLICANTS", { x: 96, y: 320, w: 400, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "#FFFFFF", letterSpacing: 3, name: "Total label" }),
        b.text("1,862", { x: 92, y: 360, w: 420, fontFamily: "Manrope", fontSize: 130, fontWeight: 800, fill: "#FFFFFF", letterSpacing: -4, label: "Total value", name: "Total value" }),
        b.text("from 37 states · 6 tracks", { x: 96, y: 510, w: 400, fontFamily: "IBM Plex Sans", fontSize: 24, fontWeight: 500, fill: "#FFFFFF", opacity: 0.85, label: "Total caption", name: "Total caption" }),
        b.rect({ x: 548, y: 290, w: 468, h: 280, fill: "$surface", cornerRadius: 28, name: "Tile gender" }),
        b.chart("donut", { x: 572, y: 316, w: 228, h: 228, values: [54, 46], labels: ["Women"], colors: ["#0097B2", "#C9D6DA"], color: "#0097B2", secondaryColor: "#C9D6DA", labelColor: ink, showLabels: false, showValues: true, fontFamily: "IBM Plex Sans", label: "Gender data", name: "Gender donut" }),
        b.text("Women", { x: 820, y: 360, w: 180, fontFamily: "IBM Plex Sans", fontSize: 26, fontWeight: 600, fill: "$ink", name: "Legend women" }),
        b.text("54%", { x: 820, y: 392, w: 180, fontFamily: "Manrope", fontSize: 44, fontWeight: 800, fill: "$primary", label: "Women share", name: "Women share" }),
        b.text("Men", { x: 820, y: 460, w: 180, fontFamily: "IBM Plex Sans", fontSize: 26, fontWeight: 600, fill: "$ink", name: "Legend men" }),
        b.text("46%", { x: 820, y: 492, w: 180, fontFamily: "Manrope", fontSize: 44, fontWeight: 800, fill: "$muted", label: "Men share", name: "Men share" }),
        b.rect({ x: 64, y: 594, w: 952, h: 300, fill: "$surface", cornerRadius: 28, name: "Tile tracks" }),
        b.text("BY TRACK", { x: 96, y: 620, w: 400, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "$muted", letterSpacing: 3, name: "Tracks label" }),
        b.chart("bar", { x: 96, y: 660, w: 888, h: 214, values: [486, 402, 355, 298, 214, 107], labels: ["Power BI", "Excel", "SQL", "Python", "SPSS", "R"], color: "#0097B2", secondaryColor: "#C9D6DA", labelColor: ink, showLabels: true, showValues: true, fontFamily: "IBM Plex Sans", label: "Tracks data", name: "Tracks chart" }),
        b.rect({ x: 64, y: 918, w: 952, h: 320, fill: "$surface", cornerRadius: 28, name: "Tile map" }),
        b.text("BY STATE", { x: 96, y: 944, w: 300, fontFamily: "IBM Plex Mono", fontSize: 20, fontWeight: 500, fill: "$muted", letterSpacing: 3, name: "Map label" }),
        b.chart("map", { x: 440, y: 934, w: 540, h: 290, map: "nigeria", values: STATE_VALUES, labels: STATES, color: "#0097B2", secondaryColor: "#E3EBEE", labelColor: ink, showLabels: false, showValues: false, fontFamily: "IBM Plex Sans", label: "Map data", name: "Mini map" }),
        b.text("Lagos\nFCT\nOyo", { x: 96, y: 990, w: 200, fontFamily: "IBM Plex Sans", fontSize: 30, fontWeight: 600, fill: "$ink", lineHeight: 1.5, label: "Top states", name: "Top states", multiline: true }),
        b.text("412\n268\n154", { x: 230, y: 990, w: 160, fontFamily: "Manrope", fontSize: 30, fontWeight: 800, fill: "$primary", lineHeight: 1.5, align: "right", label: "Top state values", name: "Top state values", multiline: true }),
        sampleNote(b, 64, 1262, 952, ink),
      ],
    },
  ],
});

export const dtResults = defineArt({
  id: "dt-research-results",
  name: "Research Results — Findings Carousel",
  category: "data",
  format: "ig-portrait",
  style: "White carousel · headline finding · pie · bars · scatter · method",
  tags: ["research results", "findings", "analysis", "carousel", "pie", "bar", "scatter", "methodology"],
  description: "A five-slide results carousel: headline finding, a pie, ranked barriers, a relationship chart and a methodology slide.",
  pal: { paper: "#FFFFFF", surface: "#F2F6F7", ink, muted: "#5B6E75", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => {
    const foot = (n: number): DesignElement[] => [
      b.text(`${n} / 5`, { x: 860, y: 1260, w: 156, fontFamily: "IBM Plex Mono", fontSize: 22, fontWeight: 500, fill: "$muted", align: "right", name: "Counter" }),
      sampleNote(b, 64, 1260, 760, ink, "Sample results for layout — replace with your study's figures (n, dates, source)."),
    ];
    return [
      {
        name: "Headline finding",
        els: [
          ...texture(b, W, H, { light: true, dots: 0.07, contours: "#0097B2" }),
          ...header(b, { tone: "light", eyebrow: "Research results · Key finding", title: "7 in 10 graduates\nlearned data skills\noutside school.", titleSize: 84 }),
          b.text("70%", { x: 56, y: 640, w: 960, fontFamily: "Fraunces", fontSize: 340, fontWeight: 300, fill: "$primary", letterSpacing: -10, label: "Big figure", name: "Big figure" }),
          b.text("of 1,204 respondents relied mainly on online courses, communities and self-study.", { x: 64, y: 1060, w: 900, fontFamily: "IBM Plex Sans", fontSize: 32, fontWeight: 500, fill: "$ink", lineHeight: 1.4, label: "Finding detail", name: "Finding detail", multiline: true }),
          ...foot(1),
        ],
      },
      {
        name: "Pie",
        els: [
          ...texture(b, W, H, { light: true, dots: 0.07 }),
          ...header(b, { tone: "light", eyebrow: "Where respondents learned", title: "Main learning source" }),
          b.chart("pie", { x: 64, y: 470, w: 952, h: 640, values: [41, 29, 18, 12], labels: ["Online courses", "Communities & bootcamps", "University", "Workplace"], colors: LIGHT.slice(0, 4), color: "#0097B2", secondaryColor: "#E3EBEE", labelColor: ink, showLabels: true, showValues: true, unit: "%", fontFamily: "IBM Plex Sans", label: "Pie data", name: "Pie chart" }),
          ...foot(2),
        ],
      },
      {
        name: "Barriers",
        els: [
          ...texture(b, W, H, { light: true, dots: 0.07 }),
          ...header(b, { tone: "light", eyebrow: "Biggest barriers (multi-select)", title: "What holds\nlearners back" }),
          b.chart("hbar", { x: 64, y: 470, w: 952, h: 700, values: [64, 58, 47, 39, 22], labels: ["Cost of data", "Laptop access", "Mentorship", "Real datasets", "Time"], color: "#0097B2", secondaryColor: "#D5E1E4", labelColor: ink, showLabels: true, showValues: true, unit: "%", fontFamily: "IBM Plex Sans", label: "Chart data", name: "Bar chart" }),
          ...foot(3),
        ],
      },
      {
        name: "Relationship",
        els: [
          ...texture(b, W, H, { light: true, dots: 0.07 }),
          ...header(b, { tone: "light", eyebrow: "Practice vs confidence", title: "Practice tracks\nwith confidence" }),
          b.chart("scatter", { x: 64, y: 470, w: 952, h: 660, values: [2.1, 2.4, 2.8, 2.6, 3.2, 3.4, 3.1, 3.8, 3.6, 4.1, 4.0, 4.4, 4.6], xValues: [1, 2, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 12], labels: ["Projects completed", "Confidence (1–5)"], color: "#0097B2", secondaryColor: "#FFFFFF", labelColor: ink, showLabels: true, showValues: false, showGrid: true, fontFamily: "IBM Plex Sans", label: "Chart data", name: "Scatter plot" }),
          b.text("Association only — other factors may explain part of this pattern.", { x: 64, y: 1160, w: 952, fontFamily: "IBM Plex Sans", fontSize: 24, fontWeight: 500, italic: true, fill: "$muted", label: "Caveat", name: "Caveat" }),
          ...foot(4),
        ],
      },
      {
        name: "Method",
        bg: "#071C24",
        els: [
          ...texture(b, W, H, { light: false, dots: 0.12 }),
          ...header(b, { tone: "dark", eyebrow: "Methodology", title: "How we did it" }),
          ...([["Design", "Cross-sectional online survey"], ["Sample", "1,204 respondents, 31 states"], ["Fieldwork", "00 Month – 00 Month 2026"], ["Analysis", "Descriptive statistics, correlation"], ["Limitations", "Self-selected, online sample"]] as Array<[string, string]>).flatMap(([k, v], i): DesignElement[] => [
            b.text(k.toUpperCase(), { x: 64, y: 440 + i * 140, w: 300, fontFamily: "IBM Plex Mono", fontSize: 22, fontWeight: 500, fill: "#2FD3EE", letterSpacing: 3, label: `${k} label`, name: `${k} label` }),
            b.text(v, { x: 360, y: 432 + i * 140, w: 656, fontFamily: "IBM Plex Sans", fontSize: 34, fontWeight: 500, fill: "#FFFFFF", lineHeight: 1.3, label: k, name: k, multiline: true }),
            b.rect({ x: 64, y: 530 + i * 140, w: 952, h: 1.5, fill: "#FFFFFF", opacity: 0.15, name: "Rule" }),
          ]),
          b.text(`5 / 5`, { x: 860, y: 1260, w: 156, fontFamily: "IBM Plex Mono", fontSize: 22, fontWeight: 500, fill: "#FFFFFF", opacity: 0.6, align: "right", name: "Counter" }),
          b.text("Full report: www.dawblearn.org", { x: 64, y: 1260, w: 760, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 800, fill: "#FFFFFF", label: "Report link", name: "Report link" }),
        ],
      },
    ];
  },
});

export const DATA_FLYERS = [dtSnapshot, dtApplicantsMap, dtGenderPie, dtColumnTracks, dtBarLocations, dtLineRegistrations, dtWaterfall, dtHistogramAge, dtScatter, dtAfricaReach, dtResults];

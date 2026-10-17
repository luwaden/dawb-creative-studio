import { bar, footer, header, M, rule, W, H } from "./common";
import { defineDesign } from "./define";
import { cinematic, closing, compare, imageTop, list, stat, statement, textTop } from "./layouts";
import { THEMES } from "./themes";

const CW = W - M * 2;

export const post18 = defineDesign({
  id: "p18-data-driven-decisions",
  name: "Every Major Decision Is Now Data-Driven",
  post: 18,
  phase: 3,
  category: "carousel",
  format: "ig-portrait",
  style: "Corporate editorial · Bloomberg meets Notion",
  tags: ["careers", "healthcare", "finance", "government", "data"],
  description: "5-slide career carousel: healthcare, finance and governance slides with data visuals.",
  theme: THEMES.corporate,
  pages: (b, t) => [
    { name: "Cover", els: cinematic(b, t, { eyebrow: "The Age of Data", headline: "Every Major Decision Is Now Data-Driven.", body: "The hospital uses data to allocate beds. The bank uses data to approve your loan. The government uses data to set policy.", imageHint: "Split screen: hospital, bank, government, tech — with data overlays", counter: "01 / 05", footerLabel: "Swipe →" }) },
    {
      name: "Healthcare",
      els: [
        ...header(b, t),
        b.text("Healthcare", { x: M, y: 210, w: CW, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 500, fill: "$primary", letterSpacing: 3, uppercase: true, label: "Industry", name: "Industry" }),
        b.text("Data Saves Lives Every Day.", { x: M, y: 260, w: CW, fontFamily: "Nunito Sans", fontSize: 78, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        b.rect({ x: M, y: 470, w: CW, h: 430, fill: "$surface", cornerRadius: 6, name: "Dashboard panel" }),
        b.chart("line", { x: M + 50, y: 520, w: CW - 100, h: 330, values: [42, 48, 45, 57, 61, 70, 76], labels: ["", "", "", "", "", "", ""], showValues: false, showLabels: false, color: "$primary", labelColor: "$ink", fontFamily: "Nunito Sans", label: "Illustrative chart", name: "Illustrative chart" }),
        b.text("Electronic health records, predictive diagnostics, drug trial analysis, epidemic tracking — hospitals that use data analytics have measurably better patient outcomes.", { x: M, y: 950, w: CW, fontFamily: "Nunito Sans", fontSize: 28, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body" }),
        ...footer(b, t, "Swipe →", { counter: "02 / 05" }),
      ],
    },
    {
      name: "Finance",
      els: [
        ...header(b, t),
        b.text("Finance", { x: M, y: 210, w: CW, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 500, fill: "$primary", letterSpacing: 3, uppercase: true, label: "Industry", name: "Industry" }),
        b.text("Your Loan Was Approved (or Rejected) by an Algorithm.", { x: M, y: 260, w: CW, fontFamily: "Nunito Sans", fontSize: 70, fontWeight: 700, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline" }),
        b.rect({ x: M, y: 540, w: CW, h: 380, fill: "$surface", cornerRadius: 6, name: "Chart panel" }),
        b.chart("bar", { x: M + 50, y: 580, w: CW - 100, h: 300, values: [3, 5, 4, 7, 6, 9], labels: ["", "", "", "", "", ""], showValues: false, showLabels: false, color: "$primary", secondaryColor: "$muted", fontFamily: "Nunito Sans", label: "Illustrative chart", name: "Illustrative chart" }),
        b.text("Credit scoring, fraud detection, investment analysis, risk modeling — the financial sector is the world's largest employer of data analysts.", { x: M, y: 960, w: CW, fontFamily: "Nunito Sans", fontSize: 28, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body" }),
        ...footer(b, t, "Swipe →", { counter: "03 / 05" }),
      ],
    },
    { name: "Government", els: textTop(b, t, { eyebrow: "Government", headline: "Policy Is Made With Data. Bad Data = Bad Policy.", body: "Census data, economic indicators, poverty mapping, public health surveillance — governments that invest in good data produce better outcomes for their citizens.", imageHint: "Policy map / statistical graphic", counter: "04 / 05" }) },
    { name: "Closing", els: closing(b, t, { headline: "The Question Is: Are You Creating the Insights or Waiting for Them?", body: "DAWB trains data analysts and researchers who lead the conversation — in every sector.", cta: "Be the analyst, not the audience", counter: "05 / 05" }) },
  ],
});

export const post19 = defineDesign({
  id: "p19-ai-researchers",
  name: "AI Is Not Replacing Researchers",
  post: 19,
  phase: 3,
  category: "carousel",
  alsoIn: ["statement"],
  format: "ig-portrait",
  style: "Wired magazine meets humanist manifesto",
  tags: ["ai", "careers", "researchers", "future"],
  description: "4-slide statement carousel. Slides 2 and 3 mirror each other: cold (AI) vs warm (human).",
  theme: THEMES.humanist,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        b.pattern("grid", { x: 0, y: 0, w: W, h: H, color: "$primary", spacing: 60, size: 1, opacity: 0.12, name: "Grid", locked: true }),
        ...header(b, t),
        b.text("AI Is Not Replacing Researchers.", { x: M, y: 420, w: CW, fontFamily: "Nunito Sans", fontSize: 104, fontWeight: 700, fill: "$ink", lineHeight: 1, letterSpacing: -3, label: "Headline", name: "Headline" }),
        rule(b, M, 700, 120),
        b.text("It Is Revealing How Much We Need Them.", { x: M, y: 740, w: CW, fontFamily: "Nunito Sans", fontSize: 56, fontWeight: 400, fill: "$primary", lineHeight: 1.1, label: "Subheadline", name: "Subheadline" }),
        ...footer(b, t, "Swipe →", { counter: "01 / 04" }),
      ],
    },
    { name: "What AI can do", bg: "#0B2A3A", els: list(b, t, { eyebrow: "Machine", headline: "What AI Can Do", items: ["Process millions of data points in seconds", "Identify patterns across massive datasets", "Generate reports from structured data", "Predict outcomes with statistical models"], counter: "02 / 04", marker: "dot" }) },
    { name: "What AI cannot do", bg: "#3A2A18", els: list(b, t, { eyebrow: "Human", headline: "What AI Cannot Do", items: ["Build trust with communities", "Design culturally intelligent research", "Make ethical judgments about data use", "Interpret qualitative human experience", "Take responsibility for its conclusions"], counter: "03 / 04", marker: "dot" }) },
    { name: "Closing", els: closing(b, t, { headline: "The Future Belongs to Researchers Who Understand Data AND Human Context.", body: "At DAWB, we train both — the technical skills to speak AI's language and the research intelligence to lead the conversation.", cta: "Train to be the researcher AI works for", counter: "04 / 04" }) },
  ],
});

export const post20 = defineDesign({
  id: "p20-kenya-harvest",
  name: "Predictive Analytics Saved Kenya's Harvest",
  post: 20,
  phase: 3,
  category: "carousel",
  format: "ig-portrait",
  style: "Field documentary meets data editorial",
  tags: ["agriculture", "kenya", "machine learning", "satellite"],
  description: "5-slide storytelling carousel on predictive analytics in African agriculture.",
  theme: THEMES.field,
  pages: (b, t) => [
    { name: "Cover", els: cinematic(b, t, { headline: "Predictive Analytics. Saved. The. Harvest.", body: "How data science is transforming African agriculture", imageHint: "Aerial African farmland with satellite data overlay", counter: "01 / 05", footerLabel: "Swipe →" }) },
    { name: "The problem", els: stat(b, t, { eyebrow: "The problem", number: "60%", line: "of Africa's workforce depends on agriculture.", body: "A single outbreak of crop disease can devastate entire communities. Traditional warning systems come too late.", counter: "02 / 05", footerLabel: "Swipe →" }) },
    { name: "Data solution", els: imageTop(b, t, { eyebrow: "The data solution", headline: "Satellite + Machine Learning = Early Warning System", body: "Platforms like PlantVillage (Penn State / Kenya collaboration) use satellite imagery and ML to detect crop disease before it's visible to the eye.", imageHint: "Satellite image with ML overlay — green healthy, red at risk", counter: "03 / 05" }) },
    { name: "Impact", els: stat(b, t, { eyebrow: "The impact", number: "30–40%", numberSize: 190, line: "less crop loss in affected trial areas across East Africa.", body: "Earlier detection. Faster response. Saved harvests.", counter: "04 / 05", footerLabel: "Swipe →" }) },
    { name: "Closing", bg: "#0D1F26", els: closing(b, t, { headline: "Data Isn't Just for Tech Companies. It's for Everyone Who Has a Problem Worth Solving.", body: "DAWB trains data professionals embedded in African reality.", cta: "Train to solve Africa's problems with data", counter: "05 / 05" }) },
  ],
});

export const post21 = defineDesign({
  id: "p21-african-fintech",
  name: "African Fintech Runs on Data",
  post: 21,
  phase: 3,
  category: "carousel",
  alsoIn: ["infographic"],
  format: "ig-portrait",
  style: "Bloomberg Africa Tech · neon accents",
  tags: ["fintech", "credit scoring", "fraud detection", "careers"],
  description: "4-slide infographic carousel on data in African fintech.",
  theme: THEMES.fintech,
  pages: (b, t) => [
    {
      name: "Cover",
      els: [
        b.pattern("dots", { x: 0, y: 0, w: W, h: H, color: "$accent", spacing: 36, size: 1.4, opacity: 0.18, name: "Data dots", locked: true }),
        ...header(b, t),
        b.text("M-Pesa · Flutterwave · Paystack · Moniepoint", { x: M, y: 300, w: CW, fontFamily: "JetBrains Mono", fontSize: 24, fill: "$accent", label: "Names line", name: "Names line" }),
        b.text("African Fintech Runs on Data.", { x: M, y: 360, w: CW, fontFamily: "Nunito Sans", fontSize: 112, fontWeight: 700, fill: "$ink", lineHeight: 1, letterSpacing: -3, label: "Headline", name: "Headline" }),
        b.text("$30B", { x: M, y: 760, w: 460, fontFamily: "Nunito Sans", fontSize: 130, fontWeight: 700, fill: "$accent", label: "Stat", name: "Stat" }),
        b.text("industry. Thousands of analysts needed.", { x: M, y: 920, w: CW, fontFamily: "Nunito Sans", fontSize: 34, fill: "$muted", label: "Subtext", name: "Subtext" }),
        ...footer(b, t, "Swipe →", { counter: "01 / 04" }),
      ],
    },
    { name: "Credit scoring", els: stat(b, t, { eyebrow: "No credit history? Data creates it.", number: "350M+", line: "unbanked Africans can be assessed with alternative data.", body: "Mobile money history, airtime usage and behavioral data assess creditworthiness. This is applied data science.", counter: "02 / 04", footerLabel: "Swipe →" }) },
    { name: "Fraud detection", els: statement(b, t, { eyebrow: "Fraud detection", headline: "How Does Flutterwave Know That Transaction Was Fraud?", body: "Real-time transaction analysis, behavioral anomaly detection, pattern recognition across millions of data points — every second.", counter: "03 / 04", footerLabel: "Swipe →", headlineBase: 80 }) },
    { name: "Closing", els: closing(b, t, { headline: "The Analysts Behind Africa's Fintech Moment Are in High Demand.", body: "DAWB trains data professionals with the technical tools and African market understanding fintech needs most.", cta: "Train in data analytics at DAWB", counter: "04 / 04" }) },
  ],
});

export const post22 = defineDesign({
  id: "p22-covid-data",
  name: "Data Saved Lives During COVID",
  post: 22,
  phase: 3,
  category: "statement",
  format: "ig-portrait",
  style: "Public-health documentary",
  tags: ["covid", "public health", "epidemiology"],
  description: "Single cinematic statement image with the four things Africa must have.",
  theme: THEMES.health,
  pages: (b, t) => [
    {
      name: "Statement",
      els: [
        b.image({ x: 0, y: 0, w: W, h: 560, placeholderFill: "$surface", hint: "African healthcare worker, gloved hands with tablet", label: "Photo", name: "Photo" }),
        b.rect({ x: 0, y: 200, w: W, h: 360, fill: "$paper", fade: "up", name: "Fade" }),
        ...header(b, t),
        b.text("The next pandemic is not a question of if. It is a question of when.", { x: M, y: 520, w: CW, fontFamily: "Nunito", fontSize: 54, fontWeight: 500, italic: true, fill: "$ink", lineHeight: 1.12, label: "Hook", name: "Hook" }),
        b.text("Africa must have:", { x: M, y: 720, w: CW, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 700, fill: "$primary", uppercase: true, letterSpacing: 3, label: "List intro", name: "List intro" }),
        ...["Epidemiologists trained in data analysis", "Researchers who interpret surveillance data in real time", "Data analysts in health ministries and hospitals", "Community researchers who collect primary data fast"].flatMap((item, i) => [
          b.rect({ x: M, y: 790 + i * 82 + 12, w: 10, h: 10, fill: "$primary", name: "Bullet" }),
          b.text(item, { x: M + 34, y: 790 + i * 82, w: CW - 34, fontFamily: "Nunito Sans", fontSize: 32, fontWeight: 600, fill: "$ink", label: `Point ${i + 1}`, name: `Point ${i + 1}` }),
        ]),
        b.text("This is not a luxury. This is a matter of life and death.", { x: M, y: 1140, w: CW, fontFamily: "Nunito Sans", fontSize: 26, fill: "$muted", label: "Closing line", name: "Closing line" }),
        ...footer(b, t, "Read caption"),
      ],
    },
  ],
});

export const post24 = defineDesign({
  id: "p24-phase3-manifesto",
  name: "Phase 3 Recap — Data Is Infrastructure",
  post: 24,
  phase: 3,
  category: "recap",
  alsoIn: ["statement"],
  format: "ig-portrait",
  style: "Manifesto typography · deep teal",
  tags: ["manifesto", "recap", "phase 3"],
  description: "Centered manifesto typography on deep teal with one gold key phrase. No images — the words are the design.",
  theme: THEMES.manifesto,
  pages: (b, t) => [
    {
      name: "Manifesto",
      els: [
        ...header(b, t),
        b.text("Data is not the future.", { x: M, y: 330, w: CW, fontFamily: "Nunito Sans", fontSize: 74, fontWeight: 300, fill: "$ink", align: "center", label: "Line 1", name: "Line 1" }),
        b.text("It is the present.", { x: M, y: 430, w: CW, fontFamily: "Nunito Sans", fontSize: 74, fontWeight: 700, fill: "$ink", align: "center", label: "Line 2", name: "Line 2" }),
        b.text("And Africa is behind.", { x: M, y: 530, w: CW, fontFamily: "Nunito Sans", fontSize: 74, fontWeight: 700, fill: "$accent", align: "center", label: "Key phrase", name: "Key phrase" }),
        b.rect({ x: W / 2 - 60, y: 680, w: 120, h: 4, fill: "$primary", name: "Rule" }),
        b.text("Data literacy is the most important infrastructure Africa is under-building. We are changing that.", { x: M + 40, y: 740, w: CW - 80, fontFamily: "Nunito Sans", fontSize: 38, fontWeight: 300, fill: "$muted", align: "center", lineHeight: 1.5, label: "Supporting text", name: "Supporting text" }),
        b.text("Phase 4 begins next week", { x: M, y: 1120, w: CW, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 500, fill: "$primary", align: "center", uppercase: true, letterSpacing: 4, label: "Footer note", name: "Footer note" }),
      ],
    },
  ],
});

export const PHASE3 = [post18, post19, post20, post21, post22, post24];
void bar;
void compare;

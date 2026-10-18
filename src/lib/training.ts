/**
 * Training tracks offered in templates. Accents are original choices for variety —
 * the templates never reproduce the tools' own logos (names are used descriptively).
 */
export const TRAINING_TOOLS = {
  powerbi: { name: "Power BI", accent: "#D9A21B", motif: "dashboard", blurb: "Model data, build DAX measures and design dashboards decision-makers actually use." },
  excel: { name: "Excel", accent: "#2E9E6A", motif: "sheet", blurb: "Formulas, PivotTables, lookups and clean, analysis-ready workbooks." },
  sql: { name: "SQL", accent: "#3B4FA0", motif: "sql", blurb: "Query, join and aggregate real datasets with confidence." },
  spss: { name: "SPSS", accent: "#C2410C", motif: "bell", blurb: "Descriptive and inferential statistics for survey and research data." },
  python: { name: "Python", accent: "#2B6CB0", motif: "python", blurb: "pandas, visualisation and repeatable analysis notebooks." },
  r: { name: "R", accent: "#1F6FB2", motif: "r", blurb: "Tidy data, ggplot2 graphics and statistical modelling." },
  tableau: { name: "Tableau", accent: "#E8684A", motif: "mosaic", blurb: "Visual analytics and interactive dashboards that tell a story." },
  writing: { name: "Article Writing", accent: "#0097B2", motif: "doc", blurb: "Structure, clarity and publishing data-driven articles." },
  research: { name: "Research Methods", accent: "#0097B2", motif: "survey", blurb: "Questions, questionnaires, sampling, analysis and reporting." },
} as const;

export type TrainingTool = keyof typeof TRAINING_TOOLS;
export const TRAINING_TOOL_IDS = Object.keys(TRAINING_TOOLS) as TrainingTool[];

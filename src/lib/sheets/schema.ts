/**
 * Google Sheets data model — shared by the server client, the Data page and the
 * data-driven templates. Each tab's first row holds these column headers; the
 * app reads and writes by header name, so columns may be reordered in Sheets.
 */

export type TabId = "users" | "trainees" | "speakers" | "lessons" | "content";

export interface ColumnDef {
  key: string;
  label: string;
  /** Long text gets a textarea in the editor. */
  long?: boolean;
  required?: boolean;
  max: number;
  hint?: string;
  /** Fixed choices (shown as a select). */
  options?: string[];
}

export interface TabDef {
  id: TabId;
  /** Sheet (tab) title in the spreadsheet. */
  title: string;
  label: string;
  description: string;
  columns: ColumnDef[];
  /** Which column names a row in lists. */
  titleKey: string;
  /** Members may add/edit rows; admin-only tabs are read-only to members. */
  adminOnly?: boolean;
  /** Written only by the app (no add/edit form). */
  system?: boolean;
}

const id: ColumnDef = { key: "id", label: "ID", max: 40, hint: "Filled in by the app" };
const status = (options: string[]): ColumnDef => ({ key: "status", label: "Status", max: 20, options });
const photo: ColumnDef = { key: "photo_url", label: "Photo", max: 600, hint: "https link (Google Drive links must be shared “Anyone with the link”), or pick an uploaded photo" };

export const TABS: Record<TabId, TabDef> = {
  trainees: {
    id: "trainees",
    title: "Trainees",
    label: "Trainees",
    description: "Trainee details entered by the DAWB team for personalised quote graphics and videos. Trainees don't sign in or edit this.",
    titleKey: "name",
    columns: [
      id,
      { key: "name", label: "Full name", required: true, max: 80 },
      { key: "occupation", label: "Occupation", max: 80 },
      { key: "location", label: "Location", max: 80, hint: "e.g. Ibadan, Nigeria" },
      photo,
      { key: "track", label: "Track", max: 60, hint: "e.g. Power BI" },
      { key: "cohort", label: "Cohort", max: 40 },
      { key: "quote", label: "Learning quote", long: true, max: 320, hint: "What they learned, their progress or experience — in their own words" },
      { key: "progress", label: "Progress", max: 60, hint: "e.g. Week 6 of 8 · 3 projects completed" },
      { key: "consent", label: "Consent to publish", max: 10, options: ["Yes", "No"], hint: "Content is only generated for trainees marked Yes" },
      status(["Active", "Graduated", "Archived"]),
    ],
  },
  speakers: {
    id: "speakers",
    title: "Speakers",
    label: "Speakers",
    description: "Speaker details entered by the DAWB team for animated speaker introductions.",
    titleKey: "name",
    columns: [
      id,
      { key: "name", label: "Full name", required: true, max: 80 },
      { key: "role", label: "Role", max: 80, hint: "e.g. Senior Data Analyst" },
      { key: "organisation", label: "Organisation", max: 80 },
      { key: "bio", label: "Short bio", long: true, max: 420, hint: "2–3 sentences" },
      { key: "expertise", label: "Expertise", max: 160, hint: "Comma-separated, e.g. Power BI, Data storytelling, SQL" },
      photo,
      { key: "webinar_title", label: "Webinar title", max: 120 },
      { key: "series", label: "Series", max: 60, hint: "e.g. Beyond The Dashboard" },
      { key: "webinar_date", label: "Date", max: 40, hint: "e.g. Sat, 14 Nov" },
      { key: "webinar_time", label: "Time", max: 40, hint: "e.g. 4:00 PM WAT" },
      { key: "platform", label: "Platform", max: 60, hint: "e.g. Google Meet" },
      { key: "registration_link", label: "Registration link", max: 300 },
      status(["Confirmed", "Tentative", "Past", "Archived"]),
    ],
  },
  lessons: {
    id: "lessons",
    title: "Lessons",
    label: "Class lessons",
    description: "What was taught in class — each row becomes a learning carousel or explainer video.",
    titleKey: "function_name",
    columns: [
      id,
      { key: "tool", label: "Tool", required: true, max: 30, options: ["Excel", "Power BI", "SQL", "Python", "R", "SPSS", "Tableau", "Google Sheets"] },
      { key: "function_name", label: "Function / concept", required: true, max: 40, hint: "e.g. SUM, CONCATENATE, CALCULATE" },
      { key: "topic", label: "Lesson topic", max: 80, hint: "e.g. Adding numbers fast" },
      { key: "what_it_does", label: "What it does", long: true, max: 240 },
      { key: "use_when", label: "Use it when", long: true, max: 240, hint: "One idea per line (up to 3)" },
      { key: "syntax", label: "Syntax", max: 120, hint: "e.g. =SUM(number1, [number2], …)" },
      { key: "arguments", label: "Arguments", long: true, max: 300, hint: "name: meaning — one per line" },
      { key: "example_table", label: "Example data", long: true, max: 600, hint: "Rows on new lines, cells separated by | — first row is the header" },
      { key: "example_formula", label: "Example formula", max: 160, hint: "e.g. =SUM(B2:B5)" },
      { key: "result_cell", label: "Result cell", max: 8, hint: "Where the formula goes, e.g. B6 (Excel) — leave blank for Power BI" },
      { key: "example_result", label: "Result", max: 60 },
      { key: "tip", label: "Pro tip / common mistake", long: true, max: 240 },
      { key: "next_topic", label: "Next class", max: 80 },
      status(["Draft", "Ready", "Posted", "Archived"]),
    ],
  },
  content: {
    id: "content",
    title: "Content",
    label: "Content log",
    description: "Every project generated from Sheets data, for tracking what was made and posted.",
    titleKey: "title",
    system: true,
    columns: [
      id,
      { key: "title", label: "Title", max: 160 },
      { key: "kind", label: "Kind", max: 10 },
      { key: "template_id", label: "Template", max: 80 },
      { key: "source_tab", label: "Source tab", max: 20 },
      { key: "source_id", label: "Source ID", max: 40 },
      { key: "project_id", label: "Project ID", max: 40 },
      status(["Draft", "Approved", "Posted"]),
      { key: "created_by", label: "Created by", max: 120 },
      { key: "created_at", label: "Created at", max: 40 },
    ],
  },
  users: {
    id: "users",
    title: "Users",
    label: "Users",
    description: "DAWB team members who use the studio — recorded automatically when they sign in with Google. Trainees and speakers never sign in.",
    titleKey: "email",
    adminOnly: true,
    system: true,
    columns: [
      id,
      { key: "email", label: "Email", max: 120 },
      { key: "name", label: "Name", max: 120 },
      { key: "photo_url", label: "Photo", max: 600 },
      { key: "role", label: "Role", max: 20 },
      { key: "first_seen", label: "First sign-in", max: 40 },
      { key: "last_seen", label: "Last sign-in", max: 40 },
    ],
  },
};

export const TAB_ORDER: TabId[] = ["trainees", "speakers", "lessons", "content", "users"];

export type SheetRecord = Record<string, string>;

/** A row as returned by the API: values by column key plus its row number. */
export interface SheetRow extends SheetRecord {
  _row: string;
}

export function isTabId(v: string): v is TabId {
  return v in TABS;
}

/** "Yes", "y", "true", "✓" → true. */
export function isYes(v: string | undefined): boolean {
  return /^(y|yes|true|1|✓|✔)$/i.test((v ?? "").trim());
}

/** Header text → column key: "Photo URL" → "photo_url". */
export function headerKey(h: string): string {
  return h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/** Map of header aliases so hand-made sheets still line up ("Full name" → name). */
export function columnForHeader(tab: TabId, header: string): string | undefined {
  const k = headerKey(header);
  const cols = TABS[tab].columns;
  return cols.find((c) => c.key === k)?.key ?? cols.find((c) => headerKey(c.label) === k)?.key ?? ALIASES[k];
}

const ALIASES: Record<string, string> = {
  full_name: "name", photo: "photo_url", picture: "photo_url", image: "photo_url", job: "occupation", profession: "occupation", city: "location",
  function: "function_name", concept: "function_name", company: "organisation", organization: "organisation", date: "webinar_date", time: "webinar_time",
};

/** Every column of the tab present as a string (missing → ""), so templates never see undefined. */
export function normalizeRecord(tab: TabId, rec: Record<string, unknown>): SheetRecord {
  const out: SheetRecord = {};
  for (const c of TABS[tab].columns) out[c.key] = typeof rec[c.key] === "string" ? (rec[c.key] as string) : rec[c.key] == null ? "" : String(rec[c.key]);
  return out;
}

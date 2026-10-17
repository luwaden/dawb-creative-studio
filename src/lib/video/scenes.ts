import type { SceneType } from "./types";

/**
 * Field definitions per scene type. The video editor builds its property panel
 * from these, so adding a scene type only needs a definition here plus a
 * component in src/remotion/scenes.
 */
export type FieldDef =
  | { key: string; label: string; type: "text"; placeholder?: string; max?: number }
  | { key: string; label: string; type: "textarea"; rows?: number; max?: number }
  | { key: string; label: string; type: "image"; role?: "photo" | "logo" }
  | { key: string; label: string; type: "number"; min: number; max: number; step?: number }
  | { key: string; label: string; type: "select"; options: Array<{ value: string; label: string }> }
  | { key: string; label: string; type: "toggle" }
  | { key: string; label: string; type: "list"; max: number; item: Array<{ key: string; label: string; type: "text" | "number" }> };

export interface SceneDefinition {
  type: SceneType;
  label: string;
  description: string;
  defaultDuration: number;
  fields: FieldDef[];
  defaults: Record<string, unknown>;
}

const alignField: FieldDef = { key: "align", label: "Alignment", type: "select", options: [{ value: "left", label: "Left" }, { value: "center", label: "Center" }] };

export const SCENE_DEFINITIONS: Record<SceneType, SceneDefinition> = {
  "logo-reveal": {
    type: "logo-reveal",
    label: "Logo reveal",
    description: "Animated DAWB logo with built-in sound design",
    defaultDuration: 150,
    fields: [
      { key: "style", label: "Animation", type: "select", options: [{ value: "assemble", label: "Assemble — dark, scan + impact" }, { value: "signal", label: "Signal — cyan, glitch + pulse" }, { value: "prism", label: "Prism — white, hexagon flip + sweep" }] },
      { key: "tagline", label: "Tagline", type: "text" },
      { key: "sound", label: "Sound design", type: "toggle" },
    ],
    defaults: { style: "assemble", tagline: "www.dawblearn.org", sound: true },
  },
  greeting: {
    type: "greeting",
    label: "Greeting",
    description: "Celebration message with animated effects",
    defaultDuration: 150,
    fields: [
      { key: "eyebrow", label: "Small heading", type: "text" },
      { key: "headline", label: "Headline", type: "textarea", rows: 2 },
      { key: "big", label: "Big number / word (optional)", type: "text" },
      { key: "message", label: "Message", type: "textarea", rows: 3 },
      { key: "image", label: "Photo (optional)", type: "image" },
      { key: "photoSlot", label: "Show photo frame even when empty", type: "toggle" },
      { key: "effect", label: "Effect", type: "select", options: [{ value: "none", label: "None" }, { value: "snow", label: "Snow" }, { value: "fireworks", label: "Fireworks" }, { value: "sparkles", label: "Sparkles" }, { value: "confetti", label: "Confetti" }, { value: "bokeh", label: "Bokeh lights" }] },
      { key: "layout", label: "Layout", type: "select", options: [{ value: "center", label: "Centred" }, { value: "left", label: "Editorial left" }] },
    ],
    defaults: { eyebrow: "", headline: "Season's greetings", big: "", message: "", image: "", photoSlot: false, effect: "sparkles", layout: "center" },
  },
  month: {
    type: "month",
    label: "New month",
    description: "Month name with an animated calendar",
    defaultDuration: 150,
    fields: [
      { key: "greeting", label: "Greeting", type: "text" },
      { key: "month", label: "Month", type: "text" },
      { key: "year", label: "Year", type: "text" },
      { key: "startDay", label: "1st falls on (0 = Sun … 6 = Sat)", type: "number", min: 0, max: 6 },
      { key: "days", label: "Days in month", type: "number", min: 28, max: 31 },
      { key: "message", label: "Message", type: "textarea", rows: 2 },
    ],
    defaults: { greeting: "Happy New Month", month: "November", year: "2026", startDay: 0, days: 30, message: "New month. New questions worth answering." },
  },
  webinar: {
    type: "webinar",
    label: "Webinar announcement",
    description: "Beyond The Dashboard style webinar hero with speaker and details",
    defaultDuration: 180,
    fields: [
      { key: "series", label: "Series", type: "text" },
      { key: "episode", label: "Episode / label", type: "text" },
      { key: "title", label: "Session title", type: "textarea", rows: 3 },
      { key: "image", label: "Speaker photo", type: "image" },
      { key: "speaker", label: "Speaker name", type: "text" },
      { key: "role", label: "Speaker role", type: "text" },
      { key: "date", label: "Date", type: "text" },
      { key: "time", label: "Time", type: "text" },
      { key: "platform", label: "Platform", type: "text" },
      { key: "cta", label: "Call to action", type: "text" },
    ],
    defaults: { series: "Beyond The Dashboard", episode: "Live webinar", title: "Session title goes here", image: "", speaker: "Speaker Name", role: "Role, Organisation", date: "Day, DD Month", time: "00:00 WAT", platform: "Google Meet", cta: "Register — link in bio" },
  },
  "kinetic-title": {
    type: "kinetic-title",
    label: "Kinetic title",
    description: "Animated headline with word-by-word reveal",
    defaultDuration: 90,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headline", label: "Headline", type: "textarea", rows: 3 },
      { key: "highlight", label: "Highlight word(s)", type: "text", placeholder: "Word to colour with the accent" },
      { key: "subline", label: "Supporting line", type: "textarea", rows: 2 },
      alignField,
      { key: "animation", label: "Text animation", type: "select", options: [{ value: "rise", label: "Rise (word by word)" }, { value: "typewriter", label: "Typewriter" }, { value: "scale", label: "Scale in" }, { value: "mask", label: "Mask reveal" }] },
    ],
    defaults: { eyebrow: "", headline: "Your headline goes here", highlight: "", subline: "", align: "left", animation: "rise" },
  },
  "photo-hero": {
    type: "photo-hero",
    label: "Photo hero",
    description: "Full-bleed photo with Ken Burns motion and a headline",
    defaultDuration: 105,
    fields: [
      { key: "image", label: "Photo", type: "image" },
      { key: "tag", label: "Tag", type: "text" },
      { key: "headline", label: "Headline", type: "textarea", rows: 3 },
      { key: "subline", label: "Supporting line", type: "textarea", rows: 2 },
      { key: "position", label: "Text position", type: "select", options: [{ value: "bottom", label: "Bottom" }, { value: "center", label: "Center" }, { value: "top", label: "Top" }] },
    ],
    defaults: { image: "", tag: "", headline: "A headline over a photo", subline: "", position: "bottom" },
  },
  "lower-third": {
    type: "lower-third",
    label: "Lower third",
    description: "Name and role bar sliding in over footage or a photo",
    defaultDuration: 105,
    fields: [
      { key: "image", label: "Photo / still", type: "image" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "style", label: "Style", type: "select", options: [{ value: "bar", label: "Solid bar" }, { value: "line", label: "Minimal line" }] },
    ],
    defaults: { image: "", name: "Full Name", role: "Role · Organisation", style: "bar" },
  },
  "speaker-card": {
    type: "speaker-card",
    label: "Speaker card",
    description: "Speaker introduction with photo, name and topic",
    defaultDuration: 120,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "image", label: "Speaker photo", type: "image" },
      { key: "name", label: "Name", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "topic", label: "Topic", type: "textarea", rows: 2 },
    ],
    defaults: { label: "Meet the speaker", image: "", name: "Speaker Name", role: "Role, Organisation", topic: "Session topic" },
  },
  countdown: {
    type: "countdown",
    label: "Countdown",
    description: "Numbers ticking down with a progress ring",
    defaultDuration: 120,
    fields: [
      { key: "label", label: "Label", type: "text" },
      { key: "from", label: "Count from", type: "number", min: 1, max: 30 },
      { key: "to", label: "Count to", type: "number", min: 0, max: 29 },
      { key: "unit", label: "Unit", type: "text" },
      { key: "caption", label: "Caption", type: "text" },
    ],
    defaults: { label: "Applications close in", from: 5, to: 3, unit: "days", caption: "Don't miss your spot" },
  },
  "stat-counter": {
    type: "stat-counter",
    label: "Animated numbers",
    description: "Numbers counting up with labels",
    defaultDuration: 120,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "stats", label: "Numbers", type: "list", max: 3, item: [{ key: "value", label: "Value", type: "number" }, { key: "suffix", label: "Suffix", type: "text" }, { key: "label", label: "Label", type: "text" }] },
      { key: "note", label: "Footnote / source", type: "text" },
    ],
    defaults: { title: "By the numbers", stats: [{ value: 120, suffix: "+", label: "Sample metric" }, { value: 8, suffix: "", label: "Sample metric" }], note: "Sample figures — replace with real data" },
  },
  "bar-chart": {
    type: "bar-chart",
    label: "Animated chart",
    description: "Bars that grow to their values",
    defaultDuration: 135,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Bars", type: "list", max: 6, item: [{ key: "label", label: "Label", type: "text" }, { key: "value", label: "Value", type: "number" }] },
      { key: "unit", label: "Value suffix", type: "text" },
      { key: "caption", label: "Caption / source", type: "text" },
    ],
    defaults: { title: "Chart title", items: [{ label: "A", value: 30 }, { label: "B", value: 55 }, { label: "C", value: 42 }], unit: "", caption: "Sample data" },
  },
  quote: {
    type: "quote",
    label: "Quote",
    description: "Quote revealed line by line with attribution",
    defaultDuration: 150,
    fields: [
      { key: "quote", label: "Quote", type: "textarea", rows: 4 },
      { key: "author", label: "Author", type: "text" },
      { key: "role", label: "Role", type: "text" },
      { key: "image", label: "Avatar (optional)", type: "image" },
    ],
    defaults: { quote: "Write the quote here.", author: "Name", role: "", image: "" },
  },
  celebration: {
    type: "celebration",
    label: "Celebration",
    description: "Confetti burst with name and message",
    defaultDuration: 150,
    fields: [
      { key: "eyebrow", label: "Greeting", type: "text" },
      { key: "name", label: "Name", type: "text" },
      { key: "message", label: "Message", type: "textarea", rows: 3 },
      { key: "image", label: "Photo (optional)", type: "image" },
      { key: "confetti", label: "Confetti", type: "toggle" },
    ],
    defaults: { eyebrow: "Happy Birthday", name: "Name", message: "Wishing you a wonderful year ahead.", image: "", confetti: true },
  },
  "list-reveal": {
    type: "list-reveal",
    label: "List reveal",
    description: "Points appear one after another",
    defaultDuration: 150,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "items", label: "Points", type: "list", max: 5, item: [{ key: "text", label: "Point", type: "text" }] },
      { key: "numbered", label: "Numbered", type: "toggle" },
    ],
    defaults: { title: "Three things to know", items: [{ text: "First point" }, { text: "Second point" }, { text: "Third point" }], numbered: true },
  },
  "event-details": {
    type: "event-details",
    label: "Event details",
    description: "Date, time and venue cards",
    defaultDuration: 135,
    fields: [
      { key: "title", label: "Title", type: "textarea", rows: 2 },
      { key: "date", label: "Date", type: "text" },
      { key: "time", label: "Time", type: "text" },
      { key: "venue", label: "Venue / platform", type: "text" },
      { key: "cta", label: "Call to action", type: "text" },
    ],
    defaults: { title: "Event title", date: "Day, DD Month", time: "00:00 WAT", venue: "Online", cta: "Register via link in bio" },
  },
  "split-media": {
    type: "split-media",
    label: "Split media",
    description: "Photo on one side, message on the other",
    defaultDuration: 120,
    fields: [
      { key: "image", label: "Photo", type: "image" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headline", label: "Headline", type: "textarea", rows: 3 },
      { key: "body", label: "Body", type: "textarea", rows: 3 },
      { key: "side", label: "Photo side", type: "select", options: [{ value: "left", label: "Left / top" }, { value: "right", label: "Right / bottom" }] },
    ],
    defaults: { image: "", eyebrow: "", headline: "Headline", body: "", side: "left" },
  },
  "code-typing": {
    type: "code-typing",
    label: "Code typing",
    description: "Code typed into an editor window",
    defaultDuration: 180,
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "language", label: "Language label", type: "text" },
      { key: "code", label: "Code", type: "textarea", rows: 6, max: 600 },
      { key: "caption", label: "Caption", type: "textarea", rows: 2 },
    ],
    defaults: { title: "Quick tip", language: "SQL", code: "SELECT *\nFROM table_name;", caption: "" },
  },
  certificate: {
    type: "certificate",
    label: "Certificate reveal",
    description: "Prestige card revealing a name and achievement",
    defaultDuration: 150,
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "name", label: "Name", type: "text" },
      { key: "achievement", label: "Achievement", type: "textarea", rows: 2 },
      { key: "detail", label: "Detail line", type: "text" },
    ],
    defaults: { eyebrow: "Certificate of Completion", name: "Graduate Name", achievement: "Programme name", detail: "Cohort · Year" },
  },
  "logo-outro": {
    type: "logo-outro",
    label: "Logo outro",
    description: "Animated logo with call to action",
    defaultDuration: 90,
    fields: [
      { key: "cta", label: "Call to action", type: "text" },
      { key: "url", label: "Website", type: "text" },
      { key: "showHandle", label: "Show social handle", type: "toggle" },
    ],
    defaults: { cta: "Learn with DAWB", url: "www.dawblearn.org", showHandle: true },
  },
};

export const SCENE_TYPES = Object.keys(SCENE_DEFINITIONS) as SceneType[];

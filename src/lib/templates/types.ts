import type { DesignDoc } from "@/lib/design/types";
import type { AspectId, VideoDoc } from "@/lib/video/types";

/** Template categories follow the campaign calendar's formats. */
export type CategoryId =
  | "carousel"
  | "cinematic"
  | "statement"
  | "infographic"
  | "spotlight"
  | "recap"
  | "community"
  | "reel"
  | "motion"
  | "story"
  | "linkedin";

export interface Category {
  id: CategoryId;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "carousel", label: "Carousels" },
  { id: "cinematic", label: "Cinematic images" },
  { id: "statement", label: "Statement & manifesto" },
  { id: "infographic", label: "Infographics" },
  { id: "spotlight", label: "Graduate & fellow stories" },
  { id: "recap", label: "Phase recaps" },
  { id: "community", label: "Community posts" },
  { id: "reel", label: "Reels" },
  { id: "motion", label: "Motion graphics" },
  { id: "story", label: "Stories & reel frames" },
  { id: "linkedin", label: "LinkedIn" },
];

export type Phase = 1 | 2 | 3 | 4;

export const PHASES: Record<Phase, { label: string; theme: string; months: string }> = {
  1: { label: "Phase 1", theme: "The Origin of Research", months: "May" },
  2: { label: "Phase 2", theme: "Research Changed the World", months: "June" },
  3: { label: "Phase 3", theme: "The Age of Data", months: "July" },
  4: { label: "Phase 4", theme: "DAWB & The Next Generation", months: "August" },
};

export type FormatId = "ig-portrait" | "ig-square" | "story" | "linkedin" | "yt-thumb" | "certificate" | "a4";

export const DESIGN_FORMATS: Record<FormatId, { label: string; width: number; height: number; hint: string }> = {
  "ig-portrait": { label: "Portrait post 4:5", width: 1080, height: 1350, hint: "Instagram, LinkedIn, Facebook" },
  "ig-square": { label: "Square post 1:1", width: 1080, height: 1080, hint: "Instagram, X, Facebook" },
  story: { label: "Story 9:16", width: 1080, height: 1920, hint: "Stories, Status, Reels cover" },
  linkedin: { label: "LinkedIn / link card", width: 1200, height: 627, hint: "LinkedIn, X, website" },
  "yt-thumb": { label: "YouTube thumbnail", width: 1280, height: 720, hint: "YouTube" },
  certificate: { label: "Certificate (landscape)", width: 2000, height: 1414, hint: "Print A4 landscape" },
  a4: { label: "A4 flyer", width: 1240, height: 1754, hint: "Print or PDF flyer" },
};

interface TemplateBase {
  id: string;
  name: string;
  category: CategoryId;
  /** Campaign phase this content belongs to; null for reusable campaign frames. */
  phase: Phase | null;
  /** Calendar post number, e.g. 5 for "Post 5 — The Ishango Bone". */
  post: number | null;
  /** Extra categories the template also appears in. */
  alsoIn?: CategoryId[];
  tags: string[];
  description: string;
  /** Visual direction, e.g. "Editorial typography" */
  style: string;
}

export interface DesignTemplate extends TemplateBase {
  kind: "design";
  format: FormatId;
  build: () => DesignDoc;
}

export interface VideoTemplate extends TemplateBase {
  kind: "video";
  aspect: AspectId;
  build: () => VideoDoc;
}

export type Template = DesignTemplate | VideoTemplate;

import { FRAMES } from "./design/frames";
import { BTD } from "./design/btd";
import { DATA_FLYERS } from "./design/data";
import { LESSON_CAROUSELS } from "./design/lessons";
import { QUOTE_FLYERS } from "./design/quotes";
import { SPEAKER_FLYERS } from "./design/speakers";
import { RESEARCH } from "./design/research";
import { TRAINING } from "./design/training";
import { OCCASIONS } from "./design/occasions";
import { PHASE1 } from "./design/phase1";
import { PHASE2 } from "./design/phase2";
import { PHASE3 } from "./design/phase3";
import { PHASE4 } from "./design/phase4";
import { MOTION } from "./video/motion";
import { LOGO_MOTIONS } from "./video/logos";
import { OCCASION_VIDEOS } from "./video/occasions";
import { RESEARCH_VIDEOS } from "./video/research";
import { PEOPLE_VIDEOS } from "./video/people";
import { REELS } from "./video/reels";
import { CATEGORIES, PHASES, type Template } from "./types";

/**
 * Template registry. Add a template by exporting it from a phase file and listing
 * it here — the library, editor and quick-edit panel pick it up automatically.
 */
export const DESIGN_TEMPLATES: Template[] = [...SPEAKER_FLYERS, ...LESSON_CAROUSELS, ...QUOTE_FLYERS, ...RESEARCH, ...DATA_FLYERS, ...TRAINING, ...BTD, ...OCCASIONS, ...PHASE1, ...PHASE2, ...PHASE3, ...PHASE4, ...FRAMES];
export const VIDEO_TEMPLATES: Template[] = [...PEOPLE_VIDEOS, ...RESEARCH_VIDEOS, ...LOGO_MOTIONS, ...OCCASION_VIDEOS, ...REELS, ...MOTION];

export const ALL_TEMPLATES: Template[] = [...DESIGN_TEMPLATES, ...VIDEO_TEMPLATES];

const byId = new Map(ALL_TEMPLATES.map((t) => [t.id, t]));

export function getTemplate(id: string | null | undefined): Template | undefined {
  return id ? byId.get(id) : undefined;
}

export function templateSearchText(t: Template) {
  const cat = CATEGORIES.find((c) => c.id === t.category)?.label ?? "";
  const phase = t.phase ? `${PHASES[t.phase].label} ${PHASES[t.phase].theme}` : "campaign frame";
  return `${t.name} ${t.description} ${t.style} ${t.tags.join(" ")} ${cat} ${phase} ${t.post ? `post ${t.post}` : ""}`.toLowerCase();
}

export { CATEGORIES, PHASES };

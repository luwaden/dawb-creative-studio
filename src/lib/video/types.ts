/**
 * Video document model. A video is an ordered list of typed scenes rendered by one
 * Remotion composition (src/remotion/DawbVideo.tsx). The editor preview, browser
 * export and server export all feed this same document into that composition.
 */

export type AspectId = "portrait" | "square" | "feed" | "landscape";

export const ASPECTS: Record<AspectId, { width: number; height: number; label: string; hint: string }> = {
  portrait: { width: 1080, height: 1920, label: "9:16", hint: "Reels · TikTok · Shorts · Stories" },
  feed: { width: 1080, height: 1350, label: "4:5", hint: "Instagram & LinkedIn feed" },
  square: { width: 1080, height: 1080, label: "1:1", hint: "Square feed post" },
  landscape: { width: 1920, height: 1080, label: "16:9", hint: "YouTube · presentations" },
};

export type TransitionType = "none" | "fade" | "slide" | "wipe" | "flip" | "zoom";
export type TransitionDirection = "from-left" | "from-right" | "from-top" | "from-bottom";

export interface SceneTransition {
  type: TransitionType;
  durationInFrames: number;
  direction?: TransitionDirection;
}

export type BackgroundMotion = "none" | "zoom-in" | "zoom-out" | "pan-left" | "pan-right";

export interface SceneBackground {
  /** Hex or theme token: "$paper", "$ink", "$primary", "$accent" */
  color: string;
  imageSrc?: string;
  motion: BackgroundMotion;
  /** 0–1 dark overlay on top of the background image for legibility */
  overlay: number;
  /** Optional decorative texture drawn over the background */
  texture?: TextureKind;
}

export type TextureKind = "none" | "dots" | "grid" | "lines" | "signature" | "noise" | "dotgrid" | "halftone" | "contours" | "orbits";
export type SfxName = "whoosh" | "impact" | "click" | "shimmer" | "riser" | "pop" | "chime" | "glitch";

export type SceneType =
  | "logo-reveal"
  | "greeting"
  | "month"
  | "webinar"
  | "kinetic-title"
  | "photo-hero"
  | "lower-third"
  | "speaker-card"
  | "countdown"
  | "stat-counter"
  | "bar-chart"
  | "quote"
  | "celebration"
  | "list-reveal"
  | "event-details"
  | "split-media"
  | "code-typing"
  | "certificate"
  | "logo-outro";

export type SceneProps = Record<string, unknown>;

export interface Scene {
  id: string;
  type: SceneType;
  durationInFrames: number;
  /** Transition INTO the next scene. Ignored on the last scene. */
  transition: SceneTransition;
  background: SceneBackground;
  props: SceneProps;
  /** Optional sound effect played when the scene starts. */
  sfx?: SfxName | "none";
}

export interface VideoTheme {
  primary: string;
  ink: string;
  paper: string;
  accent: string;
  displayFont: string;
  bodyFont: string;
}

export interface VideoAudio {
  src: string;
  name: string;
  volume: number;
  fadeOutFrames: number;
}

export interface VideoDoc {
  version: 1;
  aspect: AspectId;
  fps: number;
  theme: VideoTheme;
  scenes: Scene[];
  audio?: VideoAudio | null;
  /** "auto" picks the official light or dark logo file to match each scene background. */
  logo: "auto" | "dark" | "light" | "cyan" | "none";
  /** Footer/handle line shown on branded scenes, e.g. "@dawb_learn · www.dawblearn.org" */
  handle: string;
}

export function resolveThemeColor(value: string | undefined, theme: VideoTheme): string {
  if (!value) return "transparent";
  if (value.startsWith("$")) {
    const key = value.slice(1) as keyof VideoTheme;
    const v = theme[key];
    return typeof v === "string" ? v : "#000000";
  }
  return value;
}

/** TransitionSeries overlaps scenes during transitions, so they shorten the total. */
export function getVideoDuration(doc: Pick<VideoDoc, "scenes">): number {
  let total = 0;
  doc.scenes.forEach((s, i) => {
    total += s.durationInFrames;
    if (i < doc.scenes.length - 1) total -= effectiveTransitionFrames(doc.scenes, i);
  });
  return Math.max(1, total);
}

/** Transition length clamped so it never exceeds either neighbouring scene. */
export function effectiveTransitionFrames(scenes: Scene[], i: number): number {
  const t = scenes[i]?.transition;
  if (!t || t.type === "none" || i >= scenes.length - 1) return 0;
  const limit = Math.min(scenes[i].durationInFrames, scenes[i + 1].durationInFrames) - 1;
  return Math.max(0, Math.min(t.durationInFrames, limit));
}

/** Frame at which each scene starts on the global timeline. */
export function getSceneStarts(doc: Pick<VideoDoc, "scenes">): number[] {
  const starts: number[] = [];
  let t = 0;
  doc.scenes.forEach((s, i) => {
    starts.push(t);
    t += s.durationInFrames - (i < doc.scenes.length - 1 ? effectiveTransitionFrames(doc.scenes, i) : 0);
  });
  return starts;
}

export function collectVideoAssets(doc: VideoDoc): string[] {
  const out = new Set<string>();
  for (const s of doc.scenes) {
    if (s.background.imageSrc) out.add(s.background.imageSrc);
    for (const v of Object.values(s.props)) if (typeof v === "string" && isAssetUrl(v)) out.add(v);
  }
  if (doc.audio?.src) out.add(doc.audio.src);
  return [...out];
}

export function isAssetUrl(v: string) {
  return v.startsWith("/api/assets/") || v.startsWith("/brand/") || v.startsWith("data:image") || /^https?:\/\//.test(v);
}

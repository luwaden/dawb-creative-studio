import { SCENE_DEFINITIONS } from "./scenes";
import type { AspectId, Scene, SceneBackground, SceneTransition, SceneType, SfxName, VideoDoc, VideoTheme } from "./types";

let counter = 0;

export function newSceneId() {
  counter += 1;
  return `s${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const DAWB_THEME: VideoTheme = {
  primary: "#0097b2",
  ink: "#0f1419",
  paper: "#ffffff",
  accent: "#0097b2",
  displayFont: "Nunito Sans",
  bodyFont: "Nunito Sans",
};

export const DAWB_HANDLE = "@dawb_learn · www.dawblearn.org";

export function scene(
  type: SceneType,
  props: Record<string, unknown> = {},
  opts: { duration?: number; transition?: Partial<SceneTransition>; background?: Partial<SceneBackground>; id?: string; sfx?: SfxName } = {},
): Scene {
  const def = SCENE_DEFINITIONS[type];
  return {
    id: opts.id ?? newSceneId(),
    type,
    durationInFrames: opts.duration ?? def.defaultDuration,
    transition: { type: "fade", durationInFrames: 15, direction: "from-right", ...opts.transition },
    background: { color: "$paper", motion: "none", overlay: 0, texture: "none", ...opts.background },
    props: { ...def.defaults, ...props },
    ...(opts.sfx ? { sfx: opts.sfx } : {}),
  };
}

export function video(
  scenes: Scene[],
  opts: { aspect?: AspectId; theme?: Partial<VideoTheme>; logo?: VideoDoc["logo"]; handle?: string } = {},
): VideoDoc {
  return {
    version: 1,
    aspect: opts.aspect ?? "portrait",
    fps: 30,
    theme: { ...DAWB_THEME, ...opts.theme },
    scenes,
    audio: null,
    logo: opts.logo ?? "auto",
    handle: opts.handle ?? DAWB_HANDLE,
  };
}

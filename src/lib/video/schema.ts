import { z } from "zod";
import { SCENE_TYPES } from "./scenes";

const color = z.string().max(40);

const propValue: z.ZodType<unknown> = z.union([
  z.string().max(5000),
  z.number().finite(),
  z.boolean(),
  z.null(),
  z.array(z.record(z.string().max(40), z.union([z.string().max(500), z.number().finite(), z.boolean()]))).max(12),
]);

export const sceneSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum(SCENE_TYPES as [string, ...string[]]),
  durationInFrames: z.number().int().min(15).max(30 * 60),
  transition: z.object({
    type: z.enum(["none", "fade", "slide", "wipe", "flip", "zoom"]),
    durationInFrames: z.number().int().min(0).max(60),
    direction: z.enum(["from-left", "from-right", "from-top", "from-bottom"]).optional(),
  }),
  background: z.object({
    color,
    imageSrc: z.string().max(2048).optional(),
    motion: z.enum(["none", "zoom-in", "zoom-out", "pan-left", "pan-right"]),
    overlay: z.number().min(0).max(1),
    texture: z.enum(["none", "dots", "grid", "lines"]).optional(),
  }),
  props: z.record(z.string().max(40), propValue),
});

export const videoDocSchema = z.object({
  version: z.literal(1),
  aspect: z.enum(["portrait", "square", "feed", "landscape"]),
  fps: z.number().int().min(12).max(60),
  theme: z.object({
    primary: color,
    ink: color,
    paper: color,
    accent: color,
    displayFont: z.string().max(80),
    bodyFont: z.string().max(80),
  }),
  scenes: z.array(sceneSchema).min(1).max(40),
  audio: z
    .object({ src: z.string().max(2048), name: z.string().max(200), volume: z.number().min(0).max(1), fadeOutFrames: z.number().int().min(0).max(300) })
    .nullable()
    .optional(),
  logo: z.enum(["auto", "dark", "light", "none"]),
  handle: z.string().max(200),
});

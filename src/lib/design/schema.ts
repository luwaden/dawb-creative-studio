import { z } from "zod";

const num = z.number().finite();
const color = z.string().max(40);
const src = z.string().max(2048);

const base = {
  id: z.string().min(1).max(64),
  name: z.string().max(120).optional(),
  label: z.string().max(120).optional(),
  x: num,
  y: num,
  width: num.min(0),
  height: num.min(0),
  rotation: num,
  opacity: num.min(0).max(1),
  locked: z.boolean().optional(),
  hidden: z.boolean().optional(),
};

const text = z.object({
  ...base,
  type: z.literal("text"),
  text: z.string().max(5000),
  fontFamily: z.string().max(80),
  fontSize: num.min(1).max(2000),
  fontWeight: num.min(100).max(900),
  italic: z.boolean().optional(),
  fill: color,
  align: z.enum(["left", "center", "right"]),
  verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
  lineHeight: num.min(0.5).max(4),
  letterSpacing: num.min(-50).max(200),
  uppercase: z.boolean().optional(),
  stroke: color.optional(),
  strokeWidth: num.min(0).max(60).optional(),
  gradient: z.array(color).max(4).optional(),
  multiline: z.boolean().optional(),
});

const image = z.object({
  ...base,
  type: z.literal("image"),
  src,
  fit: z.enum(["cover", "contain"]),
  cropZoom: num.min(1).max(5),
  cropX: num.min(-1).max(1),
  cropY: num.min(-1).max(1),
  cornerRadius: num.min(0),
  circle: z.boolean().optional(),
  grayscale: z.boolean().optional(),
  placeholderFill: color,
  stroke: color.optional(),
  strokeWidth: num.min(0).optional(),
  role: z.enum(["logo", "photo"]).optional(),
  hint: z.string().max(200).optional(),
});

const shape = z.object({
  ...base,
  type: z.literal("shape"),
  shape: z.enum(["rect", "ellipse", "line", "triangle", "star", "ring", "arc", "hexagon", "wave"]),
  fill: color,
  stroke: color,
  strokeWidth: num.min(0),
  cornerRadius: num.min(0),
  dash: z.array(num).max(8).optional(),
  points: num.optional(),
  innerRatio: num.optional(),
  angle: num.optional(),
  fade: z.enum(["up", "down", "radial"]).optional(),
  dotted: z.boolean().optional(),
  gradient: z.array(color).max(4).optional(),
  gradientAngle: num.optional(),
});

const pattern = z.object({
  ...base,
  type: z.literal("pattern"),
  pattern: z.enum(["dots", "grid", "diagonal", "waves", "plus", "stars", "noise", "dotgrid", "halftone", "contours"]),
  color,
  spacing: num.min(4).max(400),
  size: num.min(0.5).max(100),
});

const chart = z.object({
  ...base,
  type: z.literal("chart"),
  chart: z.enum(["bar", "hbar", "line", "donut", "pie", "waterfall", "histogram", "scatter", "map"]),
  values: z.array(num).max(60),
  labels: z.array(z.string().max(40)).max(60),
  color,
  secondaryColor: color,
  labelColor: color,
  showLabels: z.boolean(),
  showValues: z.boolean(),
  fontFamily: z.string().max(80),
  unit: z.string().max(12).optional(),
  showGrid: z.boolean().optional(),
  xValues: z.array(num).max(60).optional(),
  colors: z.array(color).max(12).optional(),
  map: z.enum(["nigeria", "africa"]).optional(),
  showTotal: z.boolean().optional(),
});

const qr = z.object({
  ...base,
  type: z.literal("qr"),
  // Links only — keeps a QR from silently encoding something unexpected.
  value: z.string().max(600),
  fg: color,
  bg: color,
  margin: num.min(0).max(8),
});

export const designElementSchema = z.discriminatedUnion("type", [text, image, shape, pattern, chart, qr]);

export const designPageSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().max(120).optional(),
  background: z.object({ color, imageSrc: src.optional(), imageOpacity: num.min(0).max(1).optional() }),
  elements: z.array(designElementSchema).max(400),
});

export const designDocSchema = z.object({
  version: z.literal(1),
  width: num.min(50).max(8000),
  height: num.min(50).max(8000),
  palette: z.record(z.string().max(40), color),
  paletteLabels: z.record(z.string().max(40), z.string().max(80)).optional(),
  pages: z.array(designPageSchema).min(1).max(20),
});

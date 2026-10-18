/**
 * Static design document model.
 *
 * Coordinates are in design pixels (e.g. 1080×1350). Colors may be literal hex
 * values or palette references like "$primary", resolved against doc.palette at
 * render time — that is what lets a user recolor a whole template from one swatch.
 */

export type ColorValue = string;

interface BaseElement {
  id: string;
  name?: string;
  /** When set, the element appears in the template's "Quick edit" panel under this label. */
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  locked?: boolean;
  hidden?: boolean;
}

export interface TextElement extends BaseElement {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  italic?: boolean;
  fill: ColorValue;
  align: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  lineHeight: number;
  letterSpacing: number;
  uppercase?: boolean;
  /** Outline stroke — with a transparent fill this gives outlined display type. */
  stroke?: ColorValue;
  strokeWidth?: number;
  /** Vertical gradient fill (top → bottom), e.g. chrome or gold numerals. */
  gradient?: ColorValue[];
  /** Multi-line hint for the quick-edit panel. */
  multiline?: boolean;
}

export interface ImageElement extends BaseElement {
  type: "image";
  /** Empty string = placeholder slot waiting for a photo. */
  src: string;
  fit: "cover" | "contain";
  /** 1 = fit exactly; >1 zooms into the image. */
  cropZoom: number;
  /** Focal offset within the overflow, -1..1 on each axis. */
  cropX: number;
  cropY: number;
  cornerRadius: number;
  /** Ellipse mask for avatar-style photos. */
  circle?: boolean;
  grayscale?: boolean;
  placeholderFill: ColorValue;
  stroke?: ColorValue;
  strokeWidth?: number;
  /** Brand logo slot: replacing it offers brand logos first. */
  role?: "logo" | "photo";
  /** What the template expects here, e.g. the calendar's suggested visual asset. */
  hint?: string;
}

export type ShapeKind = "rect" | "ellipse" | "line" | "triangle" | "star" | "ring" | "arc" | "hexagon" | "wave";

export interface ShapeElement extends BaseElement {
  type: "shape";
  shape: ShapeKind;
  fill: ColorValue;
  stroke: ColorValue;
  strokeWidth: number;
  cornerRadius: number;
  dash?: number[];
  /** star points / ring thickness ratio / arc sweep degrees, depending on shape */
  points?: number;
  innerRatio?: number;
  angle?: number;
  /** Rect only: fade the fill to transparent — "up" is solid at the bottom (legibility over photos). */
  fade?: "up" | "down" | "radial";
  /** Round dash caps: with dash [0, gap] this draws dotted lines and dotted rings. */
  dotted?: boolean;
  /** Linear gradient fill across the shape (2–4 colours) at `gradientAngle` degrees. */
  gradient?: ColorValue[];
  gradientAngle?: number;
}

export type PatternKind = "dots" | "grid" | "diagonal" | "waves" | "plus" | "stars" | "noise" | "dotgrid" | "halftone" | "contours";

export interface PatternElement extends BaseElement {
  type: "pattern";
  pattern: PatternKind;
  color: ColorValue;
  spacing: number;
  size: number;
}

/** bar = vertical columns, hbar = horizontal bars. */
export type ChartKind = "bar" | "hbar" | "line" | "donut" | "pie" | "waterfall" | "histogram" | "scatter" | "map";

export interface ChartElement extends BaseElement {
  type: "chart";
  chart: ChartKind;
  values: number[];
  labels: string[];
  color: ColorValue;
  secondaryColor: ColorValue;
  labelColor: ColorValue;
  showLabels: boolean;
  showValues: boolean;
  fontFamily: string;
  /** Suffix for value labels, e.g. "%" or "k". */
  unit?: string;
  /** Faint value gridlines + baseline (column, bar, line, waterfall, histogram, scatter). */
  showGrid?: boolean;
  /** Scatter: x for each point (values are y). */
  xValues?: number[];
  /** Pie/donut slice colours in order; falls back to the categorical chart palette. */
  colors?: ColorValue[];
  /** Map chart: which map; labels name regions ("Lagos", "FCT", "Ghana"), values shade them. */
  map?: "nigeria" | "africa";
  /** Waterfall: draw a final total bar. */
  showTotal?: boolean;
}

/** QR code that encodes a link (e.g. a questionnaire form). Drawn as vector squares, so it stays sharp at any export size. */
export interface QrElement extends BaseElement {
  type: "qr";
  value: string;
  fg: ColorValue;
  bg: ColorValue;
  /** Quiet zone in modules (QR spec recommends 4; 2 is fine on a plain panel). */
  margin: number;
}

export type DesignElement = TextElement | ImageElement | ShapeElement | PatternElement | ChartElement | QrElement;
export type ElementType = DesignElement["type"];

export interface DesignBackground {
  color: ColorValue;
  imageSrc?: string;
  imageOpacity?: number;
}

export interface PaletteEntry {
  key: string;
  label: string;
}

export interface DesignPage {
  id: string;
  name?: string;
  background: DesignBackground;
  elements: DesignElement[];
}

/**
 * A design file: one or more pages (carousel slides) sharing size and palette.
 */
export interface DesignDoc {
  version: 1;
  width: number;
  height: number;
  palette: Record<string, string>;
  /** Human labels for palette keys, shown in Quick edit. */
  paletteLabels?: Record<string, string>;
  pages: DesignPage[];
}

/** Everything needed to draw a single page. */
export interface PageView {
  width: number;
  height: number;
  palette: Record<string, string>;
  background: DesignBackground;
  elements: DesignElement[];
}

export function pageView(doc: DesignDoc, index: number): PageView {
  const page = doc.pages[Math.min(Math.max(0, index), doc.pages.length - 1)];
  return { width: doc.width, height: doc.height, palette: doc.palette, background: page.background, elements: page.elements };
}

export function resolveColor(value: ColorValue | undefined, palette: Record<string, string>): string {
  if (!value) return "transparent";
  if (value.startsWith("$")) return palette[value.slice(1)] ?? "#000000";
  return value;
}

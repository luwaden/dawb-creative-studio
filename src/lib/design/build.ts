import type {
  ChartElement,
  DesignDoc,
  DesignElement,
  DesignPage,
  ImageElement,
  PatternElement,
  ShapeElement,
  TextElement,
} from "./types";

/**
 * Small DSL used by template files. Each template gets its own builder so element
 * ids are stable ("t1-3") across builds, which keeps saved projects diff-friendly.
 */
export function createBuilder(prefix = "e") {
  let n = 0;
  const id = () => `${prefix}${++n}`;

  type Geo = { x: number; y: number; w: number; h?: number; rotation?: number; opacity?: number; label?: string; name?: string; locked?: boolean };

  const geo = (g: Geo) => ({
    id: id(),
    name: g.name,
    label: g.label,
    x: g.x,
    y: g.y,
    width: g.w,
    height: g.h ?? 0,
    rotation: g.rotation ?? 0,
    opacity: g.opacity ?? 1,
    locked: g.locked,
  });

  return {
    text(content: string, g: Geo & Partial<Omit<TextElement, "id" | "type" | "x" | "y" | "width" | "height">>): TextElement {
      const { x: _x, y: _y, w: _w, h: _h, rotation: _r, opacity: _o, label: _l, name: _n, locked: _lk, ...rest } = g;
      return {
        ...geo(g),
        type: "text",
        text: content,
        fontFamily: "Nunito Sans",
        fontSize: 48,
        fontWeight: 400,
        fill: "$ink",
        align: "left",
        lineHeight: 1.15,
        letterSpacing: 0,
        ...rest,
      };
    },
    image(g: Geo & Partial<Omit<ImageElement, "id" | "type" | "x" | "y" | "width" | "height">>): ImageElement {
      const { x: _x, y: _y, w: _w, h: _h, rotation: _r, opacity: _o, label: _l, name: _n, locked: _lk, ...rest } = g;
      return {
        ...geo(g),
        type: "image",
        src: "",
        fit: "cover",
        cropZoom: 1,
        cropX: 0,
        cropY: 0,
        cornerRadius: 0,
        placeholderFill: "#d9dee2",
        role: "photo",
        ...rest,
      };
    },
    logo(variant: "dark" | "light" | "cyan", g: Geo): ImageElement {
      return {
        ...geo({ label: "Logo", name: "DAWB logo", ...g, h: g.h ?? g.w }),
        type: "image",
        src: `/brand/dawb-logo-${variant}.svg`,
        fit: "contain",
        cropZoom: 1,
        cropX: 0,
        cropY: 0,
        cornerRadius: 0,
        placeholderFill: "transparent",
        role: "logo",
      };
    },
    shape(shape: ShapeElement["shape"], g: Geo & Partial<Omit<ShapeElement, "id" | "type" | "shape" | "x" | "y" | "width" | "height">>): ShapeElement {
      const { x: _x, y: _y, w: _w, h: _h, rotation: _r, opacity: _o, label: _l, name: _n, locked: _lk, ...rest } = g;
      return {
        ...geo(g),
        type: "shape",
        shape,
        fill: "$primary",
        stroke: "transparent",
        strokeWidth: 0,
        cornerRadius: 0,
        ...rest,
      };
    },
    rect(g: Geo & Partial<Omit<ShapeElement, "id" | "type" | "shape" | "x" | "y" | "width" | "height">>) {
      return this.shape("rect", g);
    },
    pattern(pattern: PatternElement["pattern"], g: Geo & Partial<Omit<PatternElement, "id" | "type" | "pattern" | "x" | "y" | "width" | "height">>): PatternElement {
      const { x: _x, y: _y, w: _w, h: _h, rotation: _r, opacity: _o, label: _l, name: _n, locked: _lk, ...rest } = g;
      return { ...geo(g), type: "pattern", pattern, color: "$ink", spacing: 32, size: 2, ...rest };
    },
    chart(chart: ChartElement["chart"], g: Geo & Partial<Omit<ChartElement, "id" | "type" | "chart" | "x" | "y" | "width" | "height">>): ChartElement {
      const { x: _x, y: _y, w: _w, h: _h, rotation: _r, opacity: _o, label: _l, name: _n, locked: _lk, ...rest } = g;
      return {
        ...geo(g),
        type: "chart",
        chart,
        values: [12, 19, 15, 26, 31],
        labels: ["A", "B", "C", "D", "E"],
        color: "$primary",
        secondaryColor: "$muted",
        labelColor: "$ink",
        showLabels: true,
        showValues: true,
        fontFamily: "Nunito Sans",
        ...rest,
      };
    },
  };
}

export function page(background: string, elements: DesignElement[], opts: { name?: string; backgroundImage?: string } = {}): DesignPage {
  return { id: `p${Math.random().toString(36).slice(2, 9)}`, name: opts.name, background: { color: background, imageSrc: opts.backgroundImage }, elements };
}

export function doc(
  width: number,
  height: number,
  opts: { palette: Record<string, string>; paletteLabels?: Record<string, string> },
  pages: DesignPage[],
): DesignDoc {
  // Stable page ids per template build.
  return { version: 1, width, height, palette: opts.palette, paletteLabels: opts.paletteLabels, pages: pages.map((p, i) => ({ ...p, id: `page${i + 1}` })) };
}

export const DEFAULT_PALETTE_LABELS: Record<string, string> = {
  primary: "Brand accent",
  ink: "Text",
  paper: "Background",
  accent: "Highlight",
  muted: "Muted",
  surface: "Surface",
};

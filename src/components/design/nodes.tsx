"use client";

import Konva from "konva";
import { useEffect, useRef } from "react";
import { Arc, Ellipse, Group, Image as KImage, Line, Rect, Ring, Shape, Star, Text } from "react-konva";
import type {
  ChartElement,
  DesignElement,
  ImageElement,
  PatternElement,
  ShapeElement,
  TextElement,
} from "@/lib/design/types";
import { resolveColor } from "@/lib/design/types";
import { useCanvasImage } from "@/lib/design/imageCache";
import { nearestWeight } from "@/lib/fonts";

export interface NodeHandlers {
  interactive: boolean;
  onSelect?: (id: string, additive: boolean) => void;
  onDragMove?: (id: string, node: Konva.Node) => void;
  onDragEnd?: (id: string, node: Konva.Node) => void;
  onTransformEnd?: (id: string, node: Konva.Node) => void;
  onDblClick?: (id: string, node: Konva.Node) => void;
  registerNode?: (id: string, node: Konva.Node | null) => void;
  editingTextId?: string | null;
  /** Draw a photo glyph in empty image slots (editor + library previews, never in exports). */
  placeholderGlyph?: boolean;
}

type P = { palette: Record<string, string>; h: NodeHandlers };

function commonProps(el: DesignElement, h: NodeHandlers) {
  const canInteract = h.interactive && !el.locked;
  return {
    id: el.id,
    name: "design-element",
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    opacity: el.opacity,
    visible: !el.hidden,
    draggable: canInteract,
    listening: h.interactive && !el.hidden,
    onMouseDown: (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!h.interactive) return;
      e.cancelBubble = true;
      h.onSelect?.(el.id, e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey);
    },
    onTap: (e: Konva.KonvaEventObject<Event>) => {
      if (!h.interactive) return;
      e.cancelBubble = true;
      h.onSelect?.(el.id, false);
    },
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => h.onDragMove?.(el.id, e.target),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => h.onDragEnd?.(el.id, e.target),
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => h.onTransformEnd?.(el.id, e.target),
    onDblClick: (e: Konva.KonvaEventObject<MouseEvent>) => h.onDblClick?.(el.id, e.target),
    onDblTap: (e: Konva.KonvaEventObject<Event>) => h.onDblClick?.(el.id, e.target),
    ref: (node: Konva.Node | null) => h.registerNode?.(el.id, node),
  };
}

const grainCache = new Map<string, HTMLCanvasElement>();
/** 256px grain tile; alpha noise in the given colour, intensity from `size` (0.5–10). */
function grainTile(color: string, size: number): HTMLCanvasElement {
  const key = `${color}|${size}`;
  const hit = grainCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = cv.height = 256;
  const ctx = cv.getContext("2d")!;
  const img = ctx.createImageData(256, 256);
  const m = /^#?([0-9a-f]{6})/i.exec(color);
  const n = m ? parseInt(m[1], 16) : 0;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  let seed = 1337;
  const amount = Math.min(1, size / 10);
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    img.data[i] = r;
    img.data[i + 1] = g;
    img.data[i + 2] = b;
    img.data[i + 3] = Math.round((seed / 4294967296) * 255 * amount);
  }
  ctx.putImageData(img, 0, 0);
  grainCache.set(key, cv);
  return cv;
}

export function withAlpha(color: string, alpha: number): string {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return color;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}

export function fontStyleString(el: Pick<TextElement, "fontFamily" | "fontWeight" | "italic">): string {
  const w = nearestWeight(el.fontFamily, el.fontWeight);
  return `${el.italic ? "italic " : ""}${w}`;
}

function TextNode({ el, palette, h }: { el: TextElement } & P) {
  const content = el.uppercase ? el.text.toUpperCase() : el.text;
  return (
    <Text
      {...commonProps(el, h)}
      text={content}
      width={el.width}
      height={el.verticalAlign && el.height > 0 ? el.height : undefined}
      fontFamily={el.fontFamily}
      fontSize={el.fontSize}
      fontStyle={fontStyleString(el)}
      fill={el.gradient?.length ? undefined : resolveColor(el.fill, palette)}
      {...(el.gradient && el.gradient.length > 1
        ? {
            fillLinearGradientStartPoint: { x: 0, y: 0 },
            fillLinearGradientEndPoint: { x: 0, y: el.fontSize * el.lineHeight * Math.max(1, content.split("\n").length) },
            fillLinearGradientColorStops: el.gradient.flatMap((c, i, a) => [i / (a.length - 1), resolveColor(c, palette)]),
          }
        : {})}
      align={el.align}
      verticalAlign={el.verticalAlign ?? "top"}
      lineHeight={el.lineHeight}
      letterSpacing={el.letterSpacing}
      wrap="word"
      stroke={el.stroke && (el.strokeWidth ?? 0) > 0 ? resolveColor(el.stroke, palette) : undefined}
      strokeWidth={el.strokeWidth ?? 0}
      fillAfterStrokeEnabled
      opacity={h.editingTextId === el.id ? 0 : el.opacity}
    />
  );
}

/** Compute the source crop rectangle for cover/contain fitting with zoom + focal offset. */
export function computeCrop(img: { width: number; height: number }, el: Pick<ImageElement, "width" | "height" | "fit" | "cropZoom" | "cropX" | "cropY">) {
  const iw = img.width || 1;
  const ih = img.height || 1;
  if (el.fit === "contain") {
    const s = Math.min(el.width / iw, el.height / ih);
    const dw = iw * s;
    const dh = ih * s;
    return { crop: { x: 0, y: 0, width: iw, height: ih }, x: (el.width - dw) / 2, y: (el.height - dh) / 2, width: dw, height: dh };
  }
  const s = Math.max(el.width / iw, el.height / ih) * Math.max(1, el.cropZoom);
  const sw = el.width / s;
  const sh = el.height / s;
  const sx = ((iw - sw) / 2) * (1 + el.cropX);
  const sy = ((ih - sh) / 2) * (1 + el.cropY);
  return { crop: { x: Math.max(0, sx), y: Math.max(0, sy), width: sw, height: sh }, x: 0, y: 0, width: el.width, height: el.height };
}

function ImageNode({ el, palette, h }: { el: ImageElement } & P) {
  const { image, error } = useCanvasImage(el.src || undefined);
  const imgRef = useRef<Konva.Image>(null);

  useEffect(() => {
    const node = imgRef.current;
    if (!node) return;
    if (el.grayscale && image) {
      node.cache({ pixelRatio: 2 });
      node.filters([Konva.Filters.Grayscale]);
    } else {
      node.filters([]);
      node.clearCache();
    }
    node.getLayer()?.batchDraw();
  }, [el.grayscale, image, el.width, el.height, el.cropX, el.cropY, el.cropZoom, el.fit]);

  const clip = (ctx: Konva.Context) => {
    if (el.circle) {
      ctx.ellipse(el.width / 2, el.height / 2, el.width / 2, el.height / 2, 0, 0, Math.PI * 2);
    } else if (el.cornerRadius > 0) {
      const r = Math.min(el.cornerRadius, el.width / 2, el.height / 2);
      ctx.moveTo(r, 0);
      ctx.arcTo(el.width, 0, el.width, el.height, r);
      ctx.arcTo(el.width, el.height, 0, el.height, r);
      ctx.arcTo(0, el.height, 0, 0, r);
      ctx.arcTo(0, 0, el.width, 0, r);
    } else {
      ctx.rect(0, 0, el.width, el.height);
    }
  };

  const fit = image ? computeCrop(image, el) : null;
  const strokeColor = el.stroke ? resolveColor(el.stroke, palette) : undefined;

  return (
    <Group {...commonProps(el, h)} width={el.width} height={el.height}>
      <Group clipFunc={clip}>
        {/* hit area so empty/transparent images remain selectable */}
        <Rect width={el.width} height={el.height} fill={image ? "rgba(0,0,0,0)" : resolveColor(el.placeholderFill, palette)} />
        {image && fit && (
          <KImage ref={imgRef} image={image} crop={el.fit === "cover" ? fit.crop : undefined} x={fit.x} y={fit.y} width={fit.width} height={fit.height} />
        )}
        {!image && el.role !== "logo" && <PlaceholderHatch el={el} fill={resolveColor(el.placeholderFill, palette)} glyph={Boolean(h.placeholderGlyph) && !h.interactive} />}
        {!image && h.interactive && el.role !== "logo" && (
          <Text
            text={error ? "Image unavailable" : el.src ? "Loading…" : el.hint ? `Add photo\n${el.hint}` : "Add photo"}
            width={el.width}
            height={el.height}
            align="center"
            verticalAlign="middle"
            fontFamily="Nunito Sans"
            fontStyle="600"
            fontSize={Math.max(14, Math.min(28, Math.min(el.width, el.height) / 12))}
            padding={16}
            lineHeight={1.35}
            fill="rgba(15,20,25,0.45)"
            listening={false}
          />
        )}
      </Group>
      {strokeColor && (el.strokeWidth ?? 0) > 0 &&
        (el.circle ? (
          <Ellipse x={el.width / 2} y={el.height / 2} radiusX={el.width / 2} radiusY={el.height / 2} stroke={strokeColor} strokeWidth={el.strokeWidth} listening={false} />
        ) : (
          <Rect width={el.width} height={el.height} cornerRadius={el.cornerRadius} stroke={strokeColor} strokeWidth={el.strokeWidth} listening={false} />
        ))}
    </Group>
  );
}

function isLight(color: string) {
  const m = /^#([0-9a-f]{6})$/i.exec(color);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255) > 150;
}

/** Subtle hatch so an empty photo slot reads as "photo goes here" rather than a flat block. */
function PlaceholderHatch({ el, fill, glyph }: { el: ImageElement; fill: string; glyph: boolean }) {
  const ink = isLight(fill) ? "rgba(0,0,0," : "rgba(255,255,255,";
  return (
    <Shape
      listening={false}
      sceneFunc={(ctx) => {
        const c = ctx._context;
        const { width: w, height: ht } = el;
        c.save();
        c.strokeStyle = `${ink}0.07)`;
        c.lineWidth = 2;
        c.beginPath();
        for (let x = -ht; x < w; x += 28) {
          c.moveTo(x, ht);
          c.lineTo(x + ht, 0);
        }
        c.stroke();
        if (glyph) {
          const s = Math.min(w, ht) * 0.16;
          const cx = w / 2;
          const cy = ht / 2;
          c.strokeStyle = `${ink}0.35)`;
          c.lineWidth = Math.max(2, s / 14);
          c.lineJoin = "round";
          c.strokeRect(cx - s, cy - s * 0.75, s * 2, s * 1.5);
          c.beginPath();
          c.moveTo(cx - s, cy + s * 0.55);
          c.lineTo(cx - s * 0.3, cy - s * 0.1);
          c.lineTo(cx + s * 0.2, cy + s * 0.35);
          c.lineTo(cx + s * 0.5, cy + s * 0.1);
          c.lineTo(cx + s, cy + s * 0.5);
          c.stroke();
          c.beginPath();
          c.arc(cx + s * 0.45, cy - s * 0.35, s * 0.14, 0, Math.PI * 2);
          c.stroke();
        }
        c.restore();
      }}
    />
  );
}

function ShapeNode({ el, palette, h }: { el: ShapeElement } & P) {
  const fill = resolveColor(el.fill, palette);
  const stroke = resolveColor(el.stroke, palette);
  const sw = el.strokeWidth;
  const w = el.width;
  const ht = el.height;
  const grad = el.gradient && el.gradient.length > 1
    ? (() => {
        const a = ((el.gradientAngle ?? 90) * Math.PI) / 180;
        const dx = (Math.cos(a) * w) / 2;
        const dy = (Math.sin(a) * ht) / 2;
        return {
          fill: undefined,
          fillLinearGradientStartPoint: { x: w / 2 - dx, y: ht / 2 - dy },
          fillLinearGradientEndPoint: { x: w / 2 + dx, y: ht / 2 + dy },
          fillLinearGradientColorStops: el.gradient.flatMap((c, i, arr) => [i / (arr.length - 1), resolveColor(c, palette)]),
        };
      })()
    : {};
  const shared = { fill, stroke: sw > 0 ? stroke : undefined, strokeWidth: sw, dash: el.dash, lineCap: (el.dotted ? "round" : "butt") as "round" | "butt", ...grad };
  let child: React.ReactNode;
  switch (el.shape) {
    case "ellipse":
      child = <Ellipse x={w / 2} y={ht / 2} radiusX={w / 2} radiusY={ht / 2} {...shared} />;
      break;
    case "line":
      child = (
        <>
          <Rect width={w} height={Math.max(ht, sw, 8)} y={-Math.max(ht, sw, 8) / 2} fill="rgba(0,0,0,0)" />
          <Line points={[0, 0, w, 0]} stroke={stroke !== "transparent" ? stroke : fill} strokeWidth={Math.max(1, sw)} dash={el.dash} lineCap={el.dotted ? "round" : "butt"} />
        </>
      );
      break;
    case "hexagon": {
      // Isometric hexagon — echoes the DAWB emblem's geometry.
      const pts: number[] = [];
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 2;
        pts.push(w / 2 + (w / 2) * Math.cos(a), ht / 2 + (ht / 2) * Math.sin(a));
      }
      child = <Line points={pts} closed {...shared} />;
      break;
    }
    case "wave": {
      const pts: number[] = [];
      const waves = el.points ?? 6;
      for (let x = 0; x <= w; x += 6) pts.push(x, ht / 2 + Math.sin((x / w) * Math.PI * 2 * waves) * (ht / 2));
      child = (
        <>
          <Rect width={w} height={ht} fill="rgba(0,0,0,0)" />
          <Line points={pts} stroke={stroke !== "transparent" ? stroke : fill} strokeWidth={Math.max(1, sw)} dash={el.dash} lineCap="round" lineJoin="round" tension={0.3} />
        </>
      );
      break;
    }
    case "triangle":
      child = <Line points={[w / 2, 0, w, ht, 0, ht]} closed {...shared} />;
      break;
    case "star": {
      const r = Math.min(w, ht) / 2;
      child = <Star x={w / 2} y={ht / 2} numPoints={el.points ?? 5} innerRadius={r * (el.innerRatio ?? 0.45)} outerRadius={r} {...shared} />;
      break;
    }
    case "ring": {
      const r = Math.min(w, ht) / 2;
      child = <Ring x={w / 2} y={ht / 2} outerRadius={r} innerRadius={r * (el.innerRatio ?? 0.8)} {...shared} />;
      break;
    }
    case "arc": {
      const r = Math.min(w, ht) / 2;
      child = <Arc x={w / 2} y={ht / 2} outerRadius={r} innerRadius={r * (el.innerRatio ?? 0.8)} angle={el.angle ?? 270} rotation={-90 + (el.points ?? 0)} {...shared} />;
      break;
    }
    default:
      child = el.fade === "radial" ? (
        <Rect
          width={w}
          height={ht}
          fillRadialGradientStartPoint={{ x: w / 2, y: ht / 2 }}
          fillRadialGradientEndPoint={{ x: w / 2, y: ht / 2 }}
          fillRadialGradientStartRadius={0}
          fillRadialGradientEndRadius={Math.max(w, ht) / 2}
          fillRadialGradientColorStops={[0, withAlpha(fill, 0.9), 0.45, withAlpha(fill, 0.35), 1, withAlpha(fill, 0)]}
        />
      ) : el.fade ? (
        <Rect
          width={w}
          height={ht}
          cornerRadius={el.cornerRadius}
          fillLinearGradientStartPoint={{ x: 0, y: 0 }}
          fillLinearGradientEndPoint={{ x: 0, y: ht }}
          fillLinearGradientColorStops={el.fade === "up" ? [0, withAlpha(fill, 0), 0.55, withAlpha(fill, 0.75), 1, withAlpha(fill, 1)] : [0, withAlpha(fill, 1), 0.45, withAlpha(fill, 0.75), 1, withAlpha(fill, 0)]}
        />
      ) : (
        <Rect width={w} height={ht} cornerRadius={el.cornerRadius} {...shared} />
      );
  }
  return (
    <Group {...commonProps(el, h)} width={w} height={ht}>
      {child}
    </Group>
  );
}

function PatternNode({ el, palette, h }: { el: PatternElement } & P) {
  const color = resolveColor(el.color, palette);
  return (
    <Shape
      {...commonProps(el, h)}
      width={el.width}
      height={el.height}
      sceneFunc={(ctx) => {
        const c = ctx._context;
        const { width: w, height: ht, spacing: s, size } = el;
        c.save();
        c.beginPath();
        c.rect(0, 0, w, ht);
        c.clip();
        c.fillStyle = color;
        c.strokeStyle = color;
        c.lineWidth = size;
        if (el.pattern === "dots") {
          for (let y = s / 2; y < ht; y += s) for (let x = s / 2; x < w; x += s) {
            c.beginPath();
            c.arc(x, y, size, 0, Math.PI * 2);
            c.fill();
          }
        } else if (el.pattern === "grid") {
          c.beginPath();
          for (let x = 0; x <= w; x += s) { c.moveTo(x, 0); c.lineTo(x, ht); }
          for (let y = 0; y <= ht; y += s) { c.moveTo(0, y); c.lineTo(w, y); }
          c.stroke();
        } else if (el.pattern === "diagonal") {
          c.beginPath();
          for (let x = -ht; x < w; x += s) { c.moveTo(x, ht); c.lineTo(x + ht, 0); }
          c.stroke();
        } else if (el.pattern === "noise") {
          // Film grain: cached deterministic tile, repeated. Gives print-like texture.
          const tile = grainTile(color, size);
          const pat = c.createPattern(tile, "repeat");
          if (pat) {
            c.fillStyle = pat;
            c.fillRect(0, 0, w, ht);
          }
        } else if (el.pattern === "dotgrid") {
          // Dot grid with every 4th dot emphasised — a "graph paper" data motif.
          for (let y = s / 2, row = 0; y < ht; y += s, row++) for (let x = s / 2, col = 0; x < w; x += s, col++) {
            const big = row % 4 === 0 && col % 4 === 0;
            c.globalAlpha = big ? 1 : 0.55;
            c.beginPath();
            c.arc(x, y, big ? size * 1.8 : size, 0, Math.PI * 2);
            c.fill();
          }
          c.globalAlpha = 1;
        } else if (el.pattern === "halftone") {
          // Halftone: dot radius grows towards the top-right corner of the element.
          const reach = Math.hypot(w, ht);
          for (let y = s / 2; y < ht; y += s) for (let x = s / 2; x < w; x += s) {
            const d = Math.hypot(w - x, y) / reach;
            const r = (1 - d) * size * 3;
            if (r < 0.5) continue;
            c.beginPath();
            c.arc(x, y, r, 0, Math.PI * 2);
            c.fill();
          }
        } else if (el.pattern === "contours") {
          // Topographic contour lines around the element's lower-left quarter.
          const ox = w * 0.3;
          const oy = ht * 0.7;
          c.lineWidth = size;
          for (let k = 1; k * s < Math.hypot(w, ht) * 1.1; k++) {
            const r = k * s;
            c.beginPath();
            for (let i = 0; i <= 72; i++) {
              const th = (i / 72) * Math.PI * 2;
              const wob = 1 + 0.09 * Math.sin(th * 3 + k * 0.7) + 0.05 * Math.sin(th * 5 - k * 0.45);
              const x = ox + Math.cos(th) * r * wob * 1.2;
              const y = oy + Math.sin(th) * r * wob * 0.85;
              if (i === 0) c.moveTo(x, y);
              else c.lineTo(x, y);
            }
            c.stroke();
          }
        } else if (el.pattern === "stars") {
          // Deterministic starfield: same stars every render and export.
          let seed = 0;
          for (const ch of el.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
          const rand = () => {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            return seed / 4294967296;
          };
          const count = Math.round((w * ht) / (s * s));
          for (let i = 0; i < count; i++) {
            const r = rand();
            c.globalAlpha = 0.25 + rand() * 0.75;
            c.beginPath();
            c.arc(rand() * w, rand() * ht, size * (r > 0.97 ? 2.4 : r > 0.85 ? 1.4 : 0.7), 0, Math.PI * 2);
            c.fill();
          }
          c.globalAlpha = 1;
        } else if (el.pattern === "plus") {
          const k = size * 3;
          c.beginPath();
          for (let y = s / 2; y < ht; y += s) for (let x = s / 2; x < w; x += s) {
            c.moveTo(x - k, y); c.lineTo(x + k, y); c.moveTo(x, y - k); c.lineTo(x, y + k);
          }
          c.stroke();
        } else {
          c.beginPath();
          for (let y = s / 2; y < ht + s; y += s) {
            c.moveTo(0, y);
            for (let x = 0; x <= w; x += 8) c.lineTo(x, y + Math.sin((x / s) * Math.PI) * (s / 5));
          }
          c.stroke();
        }
        c.restore();
      }}
      hitFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.rect(0, 0, el.width, el.height);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}

function ChartNode({ el, palette, h }: { el: ChartElement } & P) {
  const color = resolveColor(el.color, palette);
  const color2 = resolveColor(el.secondaryColor, palette);
  const labelColor = resolveColor(el.labelColor, palette);
  const vals = el.values.length ? el.values : [0];
  const max = Math.max(...vals, 1);
  const w = el.width;
  const ht = el.height;
  const fs = Math.max(12, Math.min(w, ht) / 16);
  const labelSpace = el.showLabels ? fs * 1.8 : 0;
  const valueSpace = el.showValues ? fs * 1.6 : 0;
  const parts: React.ReactNode[] = [<Rect key="hit" width={w} height={ht} fill="rgba(0,0,0,0)" />];

  if (el.chart === "bar") {
    const n = vals.length;
    const gap = (w / n) * 0.28;
    const bw = (w - gap * (n - 1)) / n;
    const plotH = ht - labelSpace - valueSpace;
    vals.forEach((v, i) => {
      const bh = Math.max(2, (v / max) * plotH);
      const x = i * (bw + gap);
      const y = valueSpace + plotH - bh;
      parts.push(<Rect key={`b${i}`} x={x} y={y} width={bw} height={bh} fill={i === vals.indexOf(max) ? color : color2} cornerRadius={Math.min(6, bw / 6)} />);
      if (el.showValues) parts.push(<Text key={`v${i}`} x={x} y={y - fs * 1.4} width={bw} align="center" text={String(v)} fontSize={fs} fontFamily={el.fontFamily} fontStyle="700" fill={labelColor} />);
      if (el.showLabels) parts.push(<Text key={`l${i}`} x={x - gap / 2} y={ht - labelSpace + fs * 0.5} width={bw + gap} align="center" text={el.labels[i] ?? ""} fontSize={fs * 0.9} fontFamily={el.fontFamily} fill={labelColor} opacity={0.75} />);
    });
  } else if (el.chart === "hbar") {
    const n = vals.length;
    const rowH = ht / n;
    const labelW = el.showLabels ? w * 0.3 : 0;
    const valueW = el.showValues ? fs * 3.2 : 0;
    const plotW = w - labelW - valueW;
    vals.forEach((v, i) => {
      const y = i * rowH + rowH * 0.18;
      const bh = rowH * 0.64;
      const bw = Math.max(2, (v / max) * plotW);
      if (el.showLabels) parts.push(<Text key={`l${i}`} x={0} y={y} height={bh} width={labelW - fs * 0.6} verticalAlign="middle" text={el.labels[i] ?? ""} fontSize={fs} fontFamily={el.fontFamily} fontStyle="600" fill={labelColor} />);
      parts.push(<Rect key={`tr${i}`} x={labelW} y={y} width={plotW} height={bh} fill={color2} opacity={0.35} cornerRadius={bh / 2} />);
      parts.push(<Rect key={`b${i}`} x={labelW} y={y} width={bw} height={bh} fill={color} cornerRadius={bh / 2} />);
      if (el.showValues) parts.push(<Text key={`v${i}`} x={labelW + plotW + fs * 0.5} y={y} height={bh} verticalAlign="middle" text={String(v)} fontSize={fs} fontFamily={el.fontFamily} fontStyle="700" fill={labelColor} />);
    });
  } else if (el.chart === "line") {
    const plotH = ht - labelSpace - valueSpace;
    const n = vals.length;
    const step = n > 1 ? w / (n - 1) : 0;
    const pts: number[] = [];
    vals.forEach((v, i) => pts.push(i * step, valueSpace + plotH - (v / max) * plotH));
    parts.push(<Line key="area" points={[0, valueSpace + plotH, ...pts, w, valueSpace + plotH]} closed fill={color} opacity={0.12} />);
    parts.push(<Line key="line" points={pts} stroke={color} strokeWidth={Math.max(3, fs / 4)} lineJoin="round" lineCap="round" tension={0.25} />);
    vals.forEach((v, i) => {
      const x = pts[i * 2];
      const y = pts[i * 2 + 1];
      parts.push(<Ellipse key={`p${i}`} x={x} y={y} radiusX={fs / 3} radiusY={fs / 3} fill={color} stroke={color2} strokeWidth={0} />);
      if (el.showValues) parts.push(<Text key={`v${i}`} x={x - 40} y={y - fs * 1.6} width={80} align="center" text={String(v)} fontSize={fs * 0.9} fontFamily={el.fontFamily} fontStyle="700" fill={labelColor} />);
      if (el.showLabels) parts.push(<Text key={`l${i}`} x={x - 60} y={ht - labelSpace + fs * 0.5} width={120} align="center" text={el.labels[i] ?? ""} fontSize={fs * 0.9} fontFamily={el.fontFamily} fill={labelColor} opacity={0.75} />);
    });
  } else {
    const total = vals.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const r = Math.min(w, ht) / 2;
    let start = -90;
    const shades = [color, color2, labelColor];
    vals.forEach((v, i) => {
      const angle = (Math.max(0, v) / total) * 360;
      parts.push(<Arc key={`a${i}`} x={w / 2} y={ht / 2} innerRadius={r * 0.62} outerRadius={r} angle={angle} rotation={start} fill={shades[i % shades.length]} opacity={i < 3 ? 1 : 0.6} />);
      start += angle;
    });
    if (el.showValues) {
      const pct = Math.round((Math.max(0, vals[0]) / total) * 100);
      parts.push(<Text key="center" x={0} y={ht / 2 - r * 0.22} width={w} align="center" text={`${pct}%`} fontSize={r * 0.4} fontFamily={el.fontFamily} fontStyle="800" fill={labelColor} />);
    }
    if (el.showLabels && el.labels[0]) parts.push(<Text key="lab" x={0} y={ht / 2 + r * 0.2} width={w} align="center" text={el.labels[0]} fontSize={r * 0.12} fontFamily={el.fontFamily} fill={labelColor} opacity={0.7} />);
  }

  return (
    <Group {...commonProps(el, h)} width={w} height={ht}>
      {parts}
    </Group>
  );
}

export function ElementNode({ el, palette, h }: { el: DesignElement } & P) {
  switch (el.type) {
    case "text":
      return <TextNode el={el} palette={palette} h={h} />;
    case "image":
      return <ImageNode el={el} palette={palette} h={h} />;
    case "shape":
      return <ShapeNode el={el} palette={palette} h={h} />;
    case "pattern":
      return <PatternNode el={el} palette={palette} h={h} />;
    case "chart":
      return <ChartNode el={el} palette={palette} h={h} />;
  }
}

"use client";

import { useState } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDownToLine, ArrowUpToLine, BarChart3, ChevronDown, ChevronUp, Circle, Copy, Image as ImageIcon,
  Lock, Minus, Square, Star, Trash2, Triangle, Type, Unlock, Eye, EyeOff,
} from "lucide-react";
import type { ChartElement, DesignDoc, DesignElement, ImageElement, PageView, PatternElement, ShapeElement, TextElement } from "@/lib/design/types";
import { resolveColor } from "@/lib/design/types";
import { FONTS, nearestWeight } from "@/lib/fonts";
import { Button, cx, Field, IconButton, Input, Select, TextArea } from "@/components/ui";

// ─────────────── shared controls ───────────────
export function ColorField({ label, value, palette, paletteLabels, onChange }: { label: string; value: string; palette: Record<string, string>; paletteLabels?: Record<string, string>; onChange: (v: string) => void }) {
  const resolved = resolveColor(value, palette);
  const hex = /^#[0-9a-f]{6}$/i.test(resolved) ? resolved : "#000000";
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-ink-2">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {Object.entries(palette).map(([k, c]) => (
          <button
            key={k}
            title={paletteLabels?.[k] ?? k}
            aria-label={`Use ${paletteLabels?.[k] ?? k}`}
            onClick={() => onChange(`$${k}`)}
            className={cx("h-6 w-6 rounded border", value === `$${k}` ? "ring-2 ring-brand ring-offset-1 border-transparent" : "border-line-2")}
            style={{ background: c }}
          />
        ))}
        <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded border border-line-2" title="Custom colour" style={{ background: value.startsWith("$") ? "conic-gradient(red,yellow,lime,aqua,blue,magenta,red)" : hex }}>
          <input type="color" value={hex} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`${label} custom colour`} />
        </label>
        <Input value={value.startsWith("$") ? (paletteLabels?.[value.slice(1)] ?? value) : value} readOnly={value.startsWith("$")} onChange={(e) => /^#[0-9a-f]{0,6}$/i.test(e.target.value) && e.target.value.length === 7 && onChange(e.target.value)} className="h-7 w-28 text-xs" aria-label={`${label} value`} />
      </div>
    </div>
  );
}

function Num({ label, value, onChange, step = 1, min, max }: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number }) {
  return (
    <Field label={label}>
      <Input type="number" value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0} step={step} min={min} max={max} onChange={(e) => e.target.value !== "" && onChange(Number(e.target.value))} />
    </Field>
  );
}

function Range({ label, value, onChange, min, max, step }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number }) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between text-xs font-medium text-ink-2"><span>{label}</span><span className="tabular-nums text-muted">{Math.round(value * 100) / 100}</span></span>
      <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line px-4 py-4">
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

// ─────────────── properties ───────────────
type Patch = (patch: Partial<DesignElement>, coalesce?: string) => void;

export interface ElementActions {
  duplicate: () => void;
  remove: () => void;
  order: (w: "forward" | "backward" | "front" | "back") => void;
  replaceImage: () => void;
}

export function ElementProperties({ el, view, doc, patch, actions }: { el: DesignElement; view: PageView; doc: DesignDoc; patch: Patch; actions: ElementActions }) {
  const k = (field: string) => `${el.id}:${field}`;
  return (
    <div>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{el.label ?? el.name ?? el.type}</p>
          <p className="text-[11px] capitalize text-muted">{el.type === "image" && el.role === "logo" ? "Logo" : el.type}</p>
        </div>
        <div className="flex items-center gap-0.5">
          <IconButton label={el.hidden ? "Show" : "Hide"} onClick={() => patch({ hidden: !el.hidden })}>{el.hidden ? <EyeOff size={15} /> : <Eye size={15} />}</IconButton>
          <IconButton label={el.locked ? "Unlock" : "Lock"} onClick={() => patch({ locked: !el.locked })}>{el.locked ? <Lock size={15} /> : <Unlock size={15} />}</IconButton>
          <IconButton label="Duplicate (Ctrl+D)" onClick={actions.duplicate}><Copy size={15} /></IconButton>
          <IconButton label="Delete (Del)" onClick={actions.remove} disabled={el.locked}><Trash2 size={15} /></IconButton>
        </div>
      </div>

      {el.type === "text" && <TextProps el={el} view={view} doc={doc} patch={patch} k={k} />}
      {el.type === "image" && <ImageProps el={el} view={view} doc={doc} patch={patch} k={k} onReplace={actions.replaceImage} />}
      {el.type === "shape" && <ShapeProps el={el} view={view} doc={doc} patch={patch} k={k} />}
      {el.type === "pattern" && <PatternProps el={el} view={view} doc={doc} patch={patch} k={k} />}
      {el.type === "chart" && <ChartProps el={el} view={view} doc={doc} patch={patch} k={k} />}

      <Section title="Position & size">
        <div className="grid grid-cols-2 gap-2">
          <Num label="X" value={el.x} onChange={(v) => patch({ x: v }, k("x"))} />
          <Num label="Y" value={el.y} onChange={(v) => patch({ y: v }, k("y"))} />
          <Num label="Width" value={el.width} min={1} onChange={(v) => patch({ width: Math.max(1, v) }, k("w"))} />
          {el.type !== "text" && <Num label="Height" value={el.height} min={1} onChange={(v) => patch({ height: Math.max(1, v) }, k("h"))} />}
          <Num label="Rotation" value={el.rotation} onChange={(v) => patch({ rotation: v }, k("r"))} />
        </div>
        <Range label="Opacity" value={el.opacity} min={0} max={1} step={0.05} onChange={(v) => patch({ opacity: v }, k("o"))} />
        <div>
          <span className="mb-1.5 block text-xs font-medium text-ink-2">Arrange</span>
          <div className="flex gap-1">
            <IconButton label="Bring to front" onClick={() => actions.order("front")}><ArrowUpToLine size={15} /></IconButton>
            <IconButton label="Bring forward" onClick={() => actions.order("forward")}><ChevronUp size={15} /></IconButton>
            <IconButton label="Send backward" onClick={() => actions.order("backward")}><ChevronDown size={15} /></IconButton>
            <IconButton label="Send to back" onClick={() => actions.order("back")}><ArrowDownToLine size={15} /></IconButton>
          </div>
        </div>
      </Section>
    </div>
  );
}

type P<T> = { el: T; view: PageView; doc: DesignDoc; patch: Patch; k: (f: string) => string };

function TextProps({ el, view, doc, patch, k }: P<TextElement>) {
  const font = FONTS.find((f) => f.family === el.fontFamily);
  return (
    <Section title="Text">
      <TextArea rows={Math.min(8, Math.max(2, el.text.split("\n").length + 1))} value={el.text} onChange={(e) => patch({ text: e.target.value }, k("text"))} aria-label="Text content" />
      <Field label="Font">
        <Select value={el.fontFamily} onChange={(e) => patch({ fontFamily: e.target.value, fontWeight: nearestWeight(e.target.value, el.fontWeight) })}>
          {FONTS.map((f) => <option key={f.family} value={f.family}>{f.label}</option>)}
        </Select>
      </Field>
      <div className="grid grid-cols-2 gap-2">
        <Num label="Size" value={el.fontSize} min={6} onChange={(v) => patch({ fontSize: Math.max(6, v) }, k("fs"))} />
        <Field label="Weight">
          <Select value={nearestWeight(el.fontFamily, el.fontWeight)} onChange={(e) => patch({ fontWeight: Number(e.target.value) })}>
            {(font?.weights ?? [400, 700]).map((w) => <option key={w} value={w}>{w}</option>)}
          </Select>
        </Field>
        <Num label="Line height" value={el.lineHeight} step={0.05} onChange={(v) => patch({ lineHeight: Math.max(0.5, v) }, k("lh"))} />
        <Num label="Letter spacing" value={el.letterSpacing} step={0.5} onChange={(v) => patch({ letterSpacing: v }, k("ls"))} />
      </div>
      <div className="flex items-center gap-1">
        <IconButton label="Align left" active={el.align === "left"} onClick={() => patch({ align: "left" })}><AlignLeft size={15} /></IconButton>
        <IconButton label="Align centre" active={el.align === "center"} onClick={() => patch({ align: "center" })}><AlignCenter size={15} /></IconButton>
        <IconButton label="Align right" active={el.align === "right"} onClick={() => patch({ align: "right" })}><AlignRight size={15} /></IconButton>
        <span className="mx-1 h-5 w-px bg-line" />
        <IconButton label="Italic" active={el.italic} onClick={() => patch({ italic: !el.italic })}><span className="font-serif italic">I</span></IconButton>
        <IconButton label="Uppercase" active={el.uppercase} onClick={() => patch({ uppercase: !el.uppercase })}><span className="text-[11px] font-bold">AA</span></IconButton>
      </div>
      <ColorField label="Colour" value={el.fill} palette={view.palette} paletteLabels={doc.paletteLabels} onChange={(v) => patch({ fill: v }, k("fill"))} />
    </Section>
  );
}

function ImageProps({ el, view, doc, patch, k, onReplace }: P<ImageElement> & { onReplace: () => void }) {
  return (
    <Section title={el.role === "logo" ? "Logo" : "Image"}>
      {el.hint && !el.src && <p className="rounded bg-brand-50 px-2.5 py-2 text-xs text-brand-600">Suggested: {el.hint}</p>}
      <div className="flex gap-2">
        <Button size="sm" variant="primary" icon={<ImageIcon size={14} />} onClick={onReplace}>{el.src ? "Replace" : "Add image"}</Button>
        {el.src && <Button size="sm" variant="ghost" onClick={() => patch({ src: "" })}>Remove</Button>}
      </div>
      {el.src && el.role !== "logo" && (
        <>
          <Field label="Fit">
            <Select value={el.fit} onChange={(e) => patch({ fit: e.target.value as ImageElement["fit"] })}>
              <option value="cover">Fill frame (crop)</option>
              <option value="contain">Fit whole image</option>
            </Select>
          </Field>
          {el.fit === "cover" && (
            <>
              <Range label="Zoom" value={el.cropZoom} min={1} max={4} step={0.05} onChange={(v) => patch({ cropZoom: v }, k("cz"))} />
              <Range label="Crop horizontal" value={el.cropX} min={-1} max={1} step={0.02} onChange={(v) => patch({ cropX: v }, k("cx"))} />
              <Range label="Crop vertical" value={el.cropY} min={-1} max={1} step={0.02} onChange={(v) => patch({ cropY: v }, k("cy"))} />
            </>
          )}
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(el.grayscale)} onChange={(e) => patch({ grayscale: e.target.checked })} /> Black & white</label>
        </>
      )}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(el.circle)} onChange={(e) => patch({ circle: e.target.checked })} /> Circle mask</label>
      {!el.circle && <Range label="Corner radius" value={el.cornerRadius} min={0} max={Math.min(el.width, el.height) / 2} step={1} onChange={(v) => patch({ cornerRadius: v }, k("cr"))} />}
      {!el.src && <ColorField label="Placeholder colour" value={el.placeholderFill} palette={view.palette} paletteLabels={doc.paletteLabels} onChange={(v) => patch({ placeholderFill: v })} />}
    </Section>
  );
}

function ShapeProps({ el, view, doc, patch, k }: P<ShapeElement>) {
  return (
    <Section title="Shape">
      {el.shape !== "line" && <ColorField label="Fill" value={el.fill} palette={view.palette} paletteLabels={doc.paletteLabels} onChange={(v) => patch({ fill: v }, k("fill"))} />}
      <ColorField label={el.shape === "line" ? "Line colour" : "Outline"} value={el.stroke} palette={view.palette} paletteLabels={doc.paletteLabels} onChange={(v) => patch({ stroke: v }, k("stroke"))} />
      <Range label={el.shape === "line" ? "Thickness" : "Outline width"} value={el.strokeWidth} min={0} max={40} step={1} onChange={(v) => patch({ strokeWidth: v }, k("sw"))} />
      {el.shape === "rect" && <Range label="Corner radius" value={el.cornerRadius} min={0} max={Math.min(el.width, el.height) / 2} step={1} onChange={(v) => patch({ cornerRadius: v }, k("cr"))} />}
      {el.shape === "rect" && (
        <Field label="Fade">
          <Select value={el.fade ?? ""} onChange={(e) => patch({ fade: (e.target.value || undefined) as ShapeElement["fade"] })}>
            <option value="">Solid</option>
            <option value="up">Fade in towards bottom</option>
            <option value="down">Fade in towards top</option>
          </Select>
        </Field>
      )}
    </Section>
  );
}

function PatternProps({ el, view, doc, patch, k }: P<PatternElement>) {
  return (
    <Section title="Texture">
      <Field label="Pattern">
        <Select value={el.pattern} onChange={(e) => patch({ pattern: e.target.value as PatternElement["pattern"] })}>
          {["dots", "grid", "diagonal", "waves", "plus", "stars"].map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </Field>
      <ColorField label="Colour" value={el.color} palette={view.palette} paletteLabels={doc.paletteLabels} onChange={(v) => patch({ color: v })} />
      <Range label="Spacing" value={el.spacing} min={8} max={200} step={1} onChange={(v) => patch({ spacing: v }, k("sp"))} />
      <Range label="Size" value={el.size} min={0.5} max={10} step={0.1} onChange={(v) => patch({ size: v }, k("sz"))} />
    </Section>
  );
}

function ChartProps({ el, view, doc, patch, k }: P<ChartElement>) {
  const [raw, setRaw] = useState(el.values.join(", "));
  return (
    <Section title="Chart">
      <Field label="Type">
        <Select value={el.chart} onChange={(e) => patch({ chart: e.target.value as ChartElement["chart"] })}>
          <option value="bar">Columns</option>
          <option value="hbar">Bars</option>
          <option value="line">Line</option>
          <option value="donut">Donut</option>
        </Select>
      </Field>
      <Field label="Values" hint="Comma-separated numbers">
        <Input value={raw} onChange={(e) => {
          setRaw(e.target.value);
          const vals = e.target.value.split(",").map((v) => Number(v.trim())).filter((v) => Number.isFinite(v));
          if (vals.length) patch({ values: vals.slice(0, 24) }, k("vals"));
        }} />
      </Field>
      <Field label="Labels" hint="Comma-separated">
        <Input value={el.labels.join(", ")} onChange={(e) => patch({ labels: e.target.value.split(",").map((v) => v.trim()).slice(0, 24) }, k("labels"))} />
      </Field>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={el.showValues} onChange={(e) => patch({ showValues: e.target.checked })} /> Values</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={el.showLabels} onChange={(e) => patch({ showLabels: e.target.checked })} /> Labels</label>
      </div>
      <ColorField label="Main colour" value={el.color} palette={view.palette} paletteLabels={doc.paletteLabels} onChange={(v) => patch({ color: v })} />
      <ColorField label="Secondary colour" value={el.secondaryColor} palette={view.palette} paletteLabels={doc.paletteLabels} onChange={(v) => patch({ secondaryColor: v })} />
      <ColorField label="Label colour" value={el.labelColor} palette={view.palette} paletteLabels={doc.paletteLabels} onChange={(v) => patch({ labelColor: v })} />
    </Section>
  );
}

// ─────────────── quick edit (generated from template labels) ───────────────
export function QuickEdit({ doc, pageIndex, onText, onPalette, onPickImage, onSelect }: {
  doc: DesignDoc;
  pageIndex: number;
  onText: (id: string, text: string) => void;
  onPalette: (key: string, value: string) => void;
  onPickImage: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const page = doc.pages[pageIndex];
  const fields = page.elements.filter((e) => e.label && (e.type === "text" || e.type === "image"));
  return (
    <div>
      <Section title={`Slide ${pageIndex + 1} content`}>
        {fields.length === 0 && <p className="text-sm text-muted">No labelled fields on this slide. Click any element on the canvas to edit it.</p>}
        {fields.map((el) =>
          el.type === "text" ? (
            <Field key={el.id} label={el.label!}>
              <TextArea rows={Math.min(5, Math.max(1, Math.ceil(el.text.length / 38)))} value={el.text} onFocus={() => onSelect(el.id)} onChange={(e) => onText(el.id, e.target.value)} />
            </Field>
          ) : el.type === "image" ? (
            <div key={el.id} className="flex items-center justify-between gap-3 rounded-md border border-line p-2">
              <div className="flex min-w-0 items-center gap-2">
                <div className="checker h-10 w-10 shrink-0 overflow-hidden rounded">{el.src && <img src={el.src} alt="" className="h-full w-full object-cover" />}</div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium">{el.label}</p>
                  <p className="truncate text-[11px] text-muted">{el.src ? "Image set" : el.hint ?? "Empty"}</p>
                </div>
              </div>
              <Button size="sm" onClick={() => onPickImage(el.id)}>{el.src ? "Replace" : "Add"}</Button>
            </div>
          ) : null,
        )}
      </Section>
      <Section title="Colours (all slides)">
        {Object.entries(doc.palette).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between gap-2">
            <span className="text-sm text-ink-2">{doc.paletteLabels?.[key] ?? key}</span>
            <label className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted">{value}</span>
              <span className="relative h-7 w-7 overflow-hidden rounded border border-line-2" style={{ background: value }}>
                <input type="color" value={value} onChange={(e) => onPalette(key, e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" aria-label={`${doc.paletteLabels?.[key] ?? key} colour`} />
              </span>
            </label>
          </div>
        ))}
      </Section>
    </div>
  );
}

// ─────────────── add elements ───────────────
export type AddKind = "heading" | "subheading" | "body" | "rect" | "ellipse" | "line" | "triangle" | "star" | "photo" | "logo" | "bar" | "donut" | "dots";

export function AddPanel({ onAdd }: { onAdd: (k: AddKind) => void }) {
  const Tile = ({ k, icon, label }: { k: AddKind; icon: React.ReactNode; label: string }) => (
    <button onClick={() => onAdd(k)} className="flex flex-col items-center justify-center gap-1.5 rounded-md border border-line bg-white py-3 text-[12px] text-ink-2 hover:border-brand hover:text-ink">
      {icon}
      {label}
    </button>
  );
  return (
    <div>
      <Section title="Text">
        <button onClick={() => onAdd("heading")} className="w-full rounded-md border border-line px-3 py-2.5 text-left text-xl font-bold hover:border-brand">Add a heading</button>
        <button onClick={() => onAdd("subheading")} className="w-full rounded-md border border-line px-3 py-2 text-left text-base font-semibold hover:border-brand">Add a subheading</button>
        <button onClick={() => onAdd("body")} className="w-full rounded-md border border-line px-3 py-2 text-left text-sm hover:border-brand">Add body text</button>
      </Section>
      <Section title="Shapes">
        <div className="grid grid-cols-3 gap-2">
          <Tile k="rect" icon={<Square size={18} />} label="Rectangle" />
          <Tile k="ellipse" icon={<Circle size={18} />} label="Circle" />
          <Tile k="line" icon={<Minus size={18} />} label="Line" />
          <Tile k="triangle" icon={<Triangle size={18} />} label="Triangle" />
          <Tile k="star" icon={<Star size={18} />} label="Star" />
          <Tile k="dots" icon={<span className="text-base leading-none">⁘</span>} label="Texture" />
        </div>
      </Section>
      <Section title="Media & data">
        <div className="grid grid-cols-3 gap-2">
          <Tile k="photo" icon={<ImageIcon size={18} />} label="Photo" />
          <Tile k="logo" icon={<img src="/brand/dawb-logo-light.svg" alt="" className="h-[18px] w-[18px]" />} label="Logo" />
          <Tile k="bar" icon={<BarChart3 size={18} />} label="Chart" />
        </div>
      </Section>
      <p className="px-4 py-3 text-[11px] leading-relaxed text-muted">Shortcuts: Delete · Ctrl+Z / Ctrl+Shift+Z · Ctrl+D duplicate · arrows nudge (Shift = 10px) · double-click text to edit.</p>
    </div>
  );
}

export function makeElement(k: AddKind, view: PageView, id: string): DesignElement {
  const cx = view.width / 2;
  const cy = view.height / 2;
  const base = { id, rotation: 0, opacity: 1 };
  switch (k) {
    case "heading":
    case "subheading":
    case "body": {
      const fs = k === "heading" ? Math.round(view.width * 0.07) : k === "subheading" ? Math.round(view.width * 0.04) : Math.round(view.width * 0.026);
      const w = view.width * 0.7;
      return { ...base, type: "text", name: k === "heading" ? "Heading" : k === "subheading" ? "Subheading" : "Body text", x: cx - w / 2, y: cy - fs, width: w, height: 0, text: k === "heading" ? "Add a heading" : k === "subheading" ? "Add a subheading" : "Add a little bit of body text", fontFamily: k === "body" ? "Inter" : "Space Grotesk", fontSize: fs, fontWeight: k === "heading" ? 700 : k === "subheading" ? 600 : 400, fill: "$ink", align: "left", lineHeight: k === "body" ? 1.45 : 1.1, letterSpacing: 0 };
    }
    case "photo":
    case "logo": {
      const w = k === "logo" ? view.width * 0.14 : view.width * 0.5;
      const h = k === "logo" ? w : w * 0.75;
      return { ...base, type: "image", name: k === "logo" ? "Logo" : "Photo", x: cx - w / 2, y: cy - h / 2, width: w, height: h, src: k === "logo" ? "/brand/dawb-logo-light.svg" : "", fit: k === "logo" ? "contain" : "cover", cropZoom: 1, cropX: 0, cropY: 0, cornerRadius: 0, placeholderFill: "$surface", role: k === "logo" ? "logo" : "photo" };
    }
    case "bar":
      return { ...base, type: "chart", name: "Chart", chart: "bar", x: cx - view.width * 0.3, y: cy - view.width * 0.2, width: view.width * 0.6, height: view.width * 0.4, values: [12, 19, 15, 26], labels: ["Q1", "Q2", "Q3", "Q4"], color: "$primary", secondaryColor: "$muted", labelColor: "$ink", showLabels: true, showValues: true, fontFamily: "Inter" };
    case "donut":
      return { ...makeElement("bar", view, id), chart: "donut" } as ChartElement;
    case "dots":
      return { ...base, type: "pattern", name: "Texture", pattern: "dots", x: 0, y: 0, width: view.width, height: view.height, color: "$primary", spacing: 40, size: 2, opacity: 0.25 };
    default: {
      const s = view.width * 0.25;
      const shape = k as ShapeElement["shape"];
      return { ...base, type: "shape", name: shape[0].toUpperCase() + shape.slice(1), shape, x: cx - s / 2, y: shape === "line" ? cy : cy - s / 2, width: s, height: shape === "line" ? 0 : s, fill: "$primary", stroke: shape === "line" ? "$primary" : "transparent", strokeWidth: shape === "line" ? 6 : 0, cornerRadius: 0 };
    }
  }
}

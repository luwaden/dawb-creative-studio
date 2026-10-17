"use client";

import type Konva from "konva";
import { createRoot } from "react-dom/client";
import { Layer, Stage } from "react-konva";
import { DesignLayerContent } from "@/components/design/DesignLayerContent";
import { ensureFontsLoaded } from "@/lib/fonts";
import { loadImage } from "./imageCache";
import type { DesignDoc, PageView } from "./types";
import { pageView } from "./types";

export function collectImageSources(doc: PageView): string[] {
  const out = new Set<string>();
  if (doc.background.imageSrc) out.add(doc.background.imageSrc);
  for (const el of doc.elements) if (el.type === "image" && el.src && !el.hidden) out.add(el.src);
  return [...out];
}

export function collectFonts(doc: PageView) {
  const specs: Array<{ family: string; weight: number; italic?: boolean }> = [{ family: "Inter", weight: 600 }];
  for (const el of doc.elements) {
    if (el.type === "text") specs.push({ family: el.fontFamily, weight: el.fontWeight, italic: el.italic });
    if (el.type === "chart") specs.push({ family: el.fontFamily, weight: 400 }, { family: el.fontFamily, weight: 700 }, { family: el.fontFamily, weight: 800 });
  }
  return specs;
}

export async function prepareDoc(doc: PageView): Promise<{ failedImages: string[] }> {
  const sources = collectImageSources(doc);
  const results = await Promise.allSettled(sources.map(loadImage));
  await ensureFontsLoaded(collectFonts(doc));
  return { failedImages: sources.filter((_, i) => results[i].status === "rejected") };
}

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

// Serialize offscreen renders: many thumbnails at once would otherwise thrash memory.
let queue: Promise<unknown> = Promise.resolve();

export interface RenderOptions {
  pixelRatio?: number;
  mimeType?: "image/png" | "image/jpeg";
  quality?: number;
  /** Library/preview renders show a photo glyph in empty slots; exports never do. */
  preview?: boolean;
}

/**
 * Render a document offscreen with the exact same Konva components the editor uses,
 * then rasterize. Returns a data URL. Throws if an image required by the design
 * fails to load, so callers never report a silently broken export as success.
 */
export function renderDesign(doc: PageView, opts: RenderOptions = {}): Promise<string> {
  const job = queue.then(async () => {
    const { failedImages } = await prepareDoc(doc);
    if (failedImages.length) throw new Error(`Some images could not be loaded (${failedImages.length}). Replace or remove them and try again.`);
    const container = document.createElement("div");
    const root = createRoot(container);
    try {
      const stage = await new Promise<Konva.Stage>((resolve) => {
        root.render(
          <Stage width={doc.width} height={doc.height} ref={(s) => { if (s) resolve(s); }} listening={false}>
            <Layer listening={false}>
              <DesignLayerContent doc={doc} h={{ interactive: false, placeholderGlyph: opts.preview }} />
            </Layer>
          </Stage>,
        );
      });
      // Effects (e.g. grayscale caching) run after the first commit.
      await nextFrame();
      await nextFrame();
      stage.draw();
      return stage.toDataURL({
        pixelRatio: opts.pixelRatio ?? 1,
        mimeType: opts.mimeType ?? "image/png",
        quality: opts.quality ?? 0.92,
      });
    } finally {
      root.unmount();
    }
  });
  queue = job.catch(() => undefined);
  return job;
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function safeFilename(name: string, ext: string) {
  const base = name.trim().replace(/[^a-z0-9-_ ]/gi, "").replace(/\s+/g, "-").toLowerCase() || "dawb-design";
  return `${base}.${ext}`;
}

/** Render a page of a multi-page design. */
export function renderDesignPage(doc: DesignDoc, index: number, opts: RenderOptions = {}) {
  return renderDesign(pageView(doc, index), opts);
}

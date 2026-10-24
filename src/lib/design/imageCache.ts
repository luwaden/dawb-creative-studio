"use client";

import { useEffect, useState } from "react";
import { isLocalImage, resolveLocalImage } from "@/lib/client/localImages";

/**
 * Shared image cache for canvas rendering. Every image used on a canvas is loaded
 * once; exports preload all sources first so the offscreen render is complete on
 * its first paint.
 */
const loaded = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<HTMLImageElement>>();
const failed = new Set<string>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const hit = loaded.get(src);
  if (hit) return Promise.resolve(hit);
  const inflight = pending.get(src);
  if (inflight) return inflight;
  const p = new Promise<HTMLImageElement>((resolve, reject) => {
    const fail = () => {
      pending.delete(src);
      failed.add(src);
      reject(new Error(`Could not load image: ${src.slice(0, 120)}`));
    };
    // Device-only photos live in IndexedDB; turn the reference into a blob: URL first.
    if (isLocalImage(src)) {
      resolveLocalImage(src).then((url) => {
        if (!url) return fail();
        const img = new window.Image();
        img.onload = () => {
          loaded.set(src, img);
          pending.delete(src);
          failed.delete(src);
          resolve(img);
        };
        img.onerror = fail;
        img.src = url;
      }, fail);
      return;
    }
    const img = new window.Image();
    // Same-origin in practice (assets are proxied), but keep canvases untainted if a CDN URL slips in.
    if (/^https?:/i.test(src) && !src.startsWith(window.location.origin)) img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      loaded.set(src, img);
      pending.delete(src);
      failed.delete(src);
      resolve(img);
    };
    img.onerror = () => {
      pending.delete(src);
      failed.add(src);
      reject(new Error(`Could not load image: ${src.slice(0, 120)}`));
    };
    img.src = src;
  });
  pending.set(src, p);
  return p;
}

export function getLoadedImage(src: string): HTMLImageElement | undefined {
  return loaded.get(src);
}

export function hasFailed(src: string): boolean {
  return failed.has(src);
}

export function useCanvasImage(src: string | undefined): { image?: HTMLImageElement; error: boolean } {
  const [, force] = useState(0);
  useEffect(() => {
    if (!src || loaded.has(src)) return;
    let alive = true;
    loadImage(src)
      .catch(() => undefined)
      .finally(() => alive && force((n) => n + 1));
    return () => {
      alive = false;
    };
  }, [src]);
  return { image: src ? loaded.get(src) : undefined, error: src ? failed.has(src) : false };
}

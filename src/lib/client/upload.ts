"use client";

import type { AssetKind, AssetMeta } from "@/lib/projects";
import { api } from "./api";

const MAX_DIM = 2560;

/** Downscale very large photos in the browser before upload (keeps PNG for transparency). */
async function prepareImage(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_DIM / Math.max(width, height));
  if (scale === 1 && file.size < 3.5 * 1024 * 1024) {
    bitmap.close();
    return { blob: file, width, height };
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("Could not process image"))), type, 0.9));
  return { blob, width: canvas.width, height: canvas.height };
}

export async function uploadAsset(file: File, kind: AssetKind = "image"): Promise<AssetMeta> {
  const form = new FormData();
  form.set("name", file.name.replace(/\.[^.]+$/, ""));
  if (file.type.startsWith("image/")) {
    const { blob, width, height } = await prepareImage(file);
    form.set("file", blob, file.name);
    form.set("width", String(width));
    form.set("height", String(height));
    form.set("kind", kind);
  } else {
    form.set("file", file);
    form.set("kind", "audio");
  }
  const { asset } = await api<{ asset: AssetMeta }>("/api/assets", { method: "POST", body: form });
  return asset;
}

export function markAssetUsed(id: string) {
  api(`/api/assets/${id}`, { method: "PATCH", json: { markUsed: true } }).catch(() => undefined);
}

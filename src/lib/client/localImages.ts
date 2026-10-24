"use client";

/**
 * "Use on this device only" photos. The image is kept in this browser's IndexedDB
 * and referenced in designs as "local:<id>" — it is never uploaded. It works for
 * editing and PNG/JPEG export on this device; elsewhere the slot shows as empty.
 */
const DB = "dawb-local-images";
const STORE = "images";
const PREFIX = "local:";

export const isLocalImage = (src: string | undefined) => Boolean(src?.startsWith(PREFIX));

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("This browser blocked local storage"));
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const MAX_DIM = 2560;

/** Saves a photo on this device (downscaled to 2560px) and returns its "local:" reference. */
export async function saveLocalImage(file: File): Promise<{ url: string; name: string }> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) throw new Error("Choose a PNG, JPEG or WebP image");
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
  let blob: Blob = file;
  if (scale < 1) {
    const c = document.createElement("canvas");
    c.width = Math.round(bitmap.width * scale);
    c.height = Math.round(bitmap.height * scale);
    c.getContext("2d")!.drawImage(bitmap, 0, 0, c.width, c.height);
    blob = await new Promise<Blob>((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Could not process image"))), file.type === "image/png" ? "image/png" : "image/jpeg", 0.9));
  }
  bitmap.close();
  const id = (crypto.randomUUID?.() ?? `${Date.now()}${Math.random()}`).replace(/[^a-z0-9]/gi, "").slice(0, 24);
  await tx("readwrite", (s) => s.put(blob, id));
  return { url: `${PREFIX}${id}`, name: file.name.replace(/\.[^.]+$/, "") };
}

const objectUrls = new Map<string, string>();

/** "local:<id>" → a blob: URL for this page, or null if the photo isn't on this device. */
export async function resolveLocalImage(src: string): Promise<string | null> {
  const hit = objectUrls.get(src);
  if (hit) return hit;
  const blob = await tx<Blob | undefined>("readonly", (s) => s.get(src.slice(PREFIX.length)) as IDBRequest<Blob | undefined>).catch(() => undefined);
  if (!blob) return null;
  const url = URL.createObjectURL(blob);
  objectUrls.set(src, url);
  return url;
}

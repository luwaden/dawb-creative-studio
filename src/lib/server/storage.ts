import "server-only";
import fs from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { getConfig } from "./config";

export interface StoredFile {
  body: ReadableStream<Uint8Array>;
  contentType: string;
  size: number | null;
}

/**
 * Minimal key/value + file storage. Keys look like "projects/meta/abc.json".
 * Two drivers: local filesystem (default) and Vercel Blob (shared workspace).
 */
export interface Storage {
  readJSON<T>(key: string): Promise<T | null>;
  writeJSON(key: string, value: unknown): Promise<void>;
  list(prefix: string): Promise<string[]>;
  remove(key: string): Promise<void>;
  writeFile(key: string, data: Buffer, contentType: string): Promise<void>;
  readFile(key: string): Promise<StoredFile | null>;
}

const MIME_BY_EXT: Record<string, string> = {
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".m4a": "audio/mp4",
  ".ogg": "audio/ogg",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

export function assertSafeKey(key: string) {
  if (!/^[a-z0-9][a-z0-9/_.-]*$/i.test(key) || key.includes("..") || key.includes("//")) {
    throw new Error(`Invalid storage key: ${key}`);
  }
}

class FsStorage implements Storage {
  constructor(private base: string) {}

  private resolve(key: string) {
    assertSafeKey(key);
    const full = path.resolve(this.base, key);
    if (!full.startsWith(this.base + path.sep)) throw new Error("Key escapes storage root");
    return full;
  }

  async readJSON<T>(key: string): Promise<T | null> {
    try {
      return JSON.parse(await fs.readFile(this.resolve(key), "utf8")) as T;
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }

  async writeJSON(key: string, value: unknown) {
    await this.writeFile(key, Buffer.from(JSON.stringify(value)), "application/json");
  }

  async list(prefix: string): Promise<string[]> {
    const dir = this.resolve(prefix.replace(/\/$/, "") || ".");
    try {
      const names = await fs.readdir(dir);
      return names.filter((n) => !n.startsWith(".")).map((n) => `${prefix.replace(/\/$/, "")}/${n}`);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw e;
    }
  }

  async remove(key: string) {
    await fs.rm(this.resolve(key), { force: true });
  }

  async writeFile(key: string, data: Buffer, _contentType: string) {
    const full = this.resolve(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    // Write-then-rename so a crash never leaves a half-written project file.
    const tmp = `${full}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, data);
    await fs.rename(tmp, full);
  }

  async readFile(key: string): Promise<StoredFile | null> {
    const full = this.resolve(key);
    try {
      const stat = await fs.stat(full);
      const node = createReadStream(full);
      return {
        body: Readable.toWeb(node) as ReadableStream<Uint8Array>,
        contentType: MIME_BY_EXT[path.extname(full).toLowerCase()] ?? "application/octet-stream",
        size: stat.size,
      };
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
      throw e;
    }
  }
}

class BlobStorage implements Storage {
  private async sdk() {
    return import("@vercel/blob");
  }

  async readJSON<T>(key: string): Promise<T | null> {
    const f = await this.readFile(key);
    if (!f) return null;
    const text = await new Response(f.body).text();
    return JSON.parse(text) as T;
  }

  async writeJSON(key: string, value: unknown) {
    await this.writeFile(key, Buffer.from(JSON.stringify(value)), "application/json");
  }

  async list(prefix: string): Promise<string[]> {
    const { list } = await this.sdk();
    const keys: string[] = [];
    let cursor: string | undefined;
    const p = prefix.endsWith("/") ? prefix : `${prefix}/`;
    do {
      const res = await list({ prefix: p, cursor, limit: 1000 });
      for (const b of res.blobs) keys.push(b.pathname);
      cursor = res.hasMore ? res.cursor : undefined;
    } while (cursor);
    return keys;
  }

  async remove(key: string) {
    assertSafeKey(key);
    const { del } = await this.sdk();
    await del(key);
  }

  async writeFile(key: string, data: Buffer, contentType: string) {
    assertSafeKey(key);
    const { put } = await this.sdk();
    await put(key, data, { access: "private", allowOverwrite: true, addRandomSuffix: false, contentType });
  }

  async readFile(key: string): Promise<StoredFile | null> {
    assertSafeKey(key);
    const { get } = await this.sdk();
    try {
      const res = await get(key, { access: "private", useCache: false });
      if (!res || res.statusCode !== 200) return null;
      return { body: res.stream, contentType: res.blob.contentType, size: res.blob.size };
    } catch (e) {
      if ((e as Error).name === "BlobNotFoundError") return null;
      throw e;
    }
  }
}

let instance: Storage | null = null;

export function getStorage(): Storage {
  if (!instance) {
    const cfg = getConfig();
    instance = cfg.driver === "blob" ? new BlobStorage() : new FsStorage(cfg.dataDir);
  }
  return instance;
}

/** Test hook. */
export function createFsStorage(base: string): Storage {
  return new FsStorage(path.resolve(base));
}

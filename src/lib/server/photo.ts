import "server-only";
import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { AssetMeta } from "@/lib/projects";
import { HttpError, type AppUser } from "./auth";
import { Repo } from "./repo";
import { sniffMedia } from "./sniff";

/**
 * Brings a photo referenced in Google Sheets into the asset store so designs and
 * videos can use it (canvas export needs same-origin images).
 *
 * Accepts "asset:<id>" (an existing upload), public https image links and Google
 * Drive share links ("Anyone with the link"). Guards against SSRF: https only, the
 * host must resolve to public addresses, redirects are re-checked hop by hop, and
 * the response must be a real PNG/JPEG/WebP under 10 MB.
 */

const MAX_BYTES = 10 * 1024 * 1024;

export function isPrivateAddress(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  if (v === 6) {
    const x = ip.toLowerCase();
    if (x === "::" || x === "::1") return true;
    if (x.startsWith("fc") || x.startsWith("fd") || x.startsWith("fe8") || x.startsWith("fe9") || x.startsWith("fea") || x.startsWith("feb")) return true;
    const mapped = /::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(x);
    return mapped ? isPrivateAddress(mapped[1]) : false;
  }
  return true;
}

/** Google Drive "view" links → direct download link. */
export function normalisePhotoUrl(raw: string): string {
  const u = raw.trim();
  const file = /drive\.google\.com\/file\/d\/([A-Za-z0-9_-]{10,})/.exec(u) ?? /drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([A-Za-z0-9_-]{10,})/.exec(u);
  if (file) return `https://drive.google.com/uc?export=download&id=${file[1]}`;
  return u;
}

async function assertPublicHttps(url: URL) {
  if (url.protocol !== "https:") throw new HttpError(400, "Photo links must start with https://");
  if (url.username || url.password) throw new HttpError(400, "Photo links can't contain credentials");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) throw new HttpError(400, "That photo link points to a private address");
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (!addrs.length) throw new HttpError(400, "Couldn't reach the photo link's website");
  if (addrs.some((a) => isPrivateAddress(a.address))) throw new HttpError(400, "That photo link points to a private address");
}

async function download(start: string): Promise<Buffer> {
  let url = new URL(start);
  for (let hop = 0; hop < 5; hop++) {
    await assertPublicHttps(url);
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(15000), headers: { "user-agent": "DAWB-Creative-Studio/1.0" } });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) break;
      url = new URL(loc, url);
      continue;
    }
    if (!res.ok || !res.body) throw new HttpError(400, `The photo link returned an error (${res.status}). For Google Drive, share the file as “Anyone with the link”.`);
    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) throw new HttpError(413, "Photo is larger than 10 MB");
    const chunks: Buffer[] = [];
    let total = 0;
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new HttpError(413, "Photo is larger than 10 MB");
      }
      chunks.push(Buffer.from(value));
    }
    return Buffer.concat(chunks);
  }
  throw new HttpError(400, "The photo link redirected too many times");
}

export async function importPhoto(user: AppUser, raw: string, label = "Photo"): Promise<AssetMeta | null> {
  const value = raw.trim();
  if (!value) return null;
  const repo = new Repo();
  const assetRef = /^asset:([A-Za-z0-9_-]{6,40})$/.exec(value);
  if (assetRef) return repo.getAsset(assetRef[1]);
  const url = normalisePhotoUrl(value);
  const name = `sheet-photo-${createHash("sha256").update(url).digest("hex").slice(0, 16)}`;
  const existing = (await repo.listAssets("image")).find((a) => a.name.startsWith(name));
  if (existing) return existing;
  const data = await download(url);
  const sniffed = sniffMedia(data);
  if (!sniffed || sniffed.kind !== "image") throw new HttpError(415, "The link didn't return a PNG, JPEG or WebP image. For Google Drive, share the file as “Anyone with the link”.");
  return repo.createAsset(user, { name: `${name} · ${label}`.slice(0, 160), kind: "image", contentType: sniffed.contentType, ext: sniffed.ext, data });
}

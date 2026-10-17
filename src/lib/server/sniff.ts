import "server-only";

/** Identify an upload by its magic bytes — never trust the browser-supplied MIME type. */
export function sniffMedia(buf: Buffer): { contentType: string; ext: string; kind: "image" | "audio" } | null {
  const b = buf;
  const ascii = (start: number, len: number) => b.subarray(start, start + len).toString("latin1");
  if (b.length < 12) return null;
  if (b[0] === 0x89 && ascii(1, 3) === "PNG") return { contentType: "image/png", ext: "png", kind: "image" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { contentType: "image/jpeg", ext: "jpg", kind: "image" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return { contentType: "image/webp", ext: "webp", kind: "image" };
  if (ascii(0, 4) === "RIFF" && ascii(8, 4) === "WAVE") return { contentType: "audio/wav", ext: "wav", kind: "audio" };
  if (ascii(0, 3) === "ID3" || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0)) return { contentType: "audio/mpeg", ext: "mp3", kind: "audio" };
  if (ascii(0, 4) === "OggS") return { contentType: "audio/ogg", ext: "ogg", kind: "audio" };
  if (ascii(4, 4) === "ftyp" && /M4A|mp42|isom|M4B/.test(ascii(8, 4))) return { contentType: "audio/mp4", ext: "m4a", kind: "audio" };
  return null;
}

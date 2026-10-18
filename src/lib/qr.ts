import QRCode from "qrcode";

export interface QrMatrix {
  size: number;
  /** Row-major: dark(r, c) */
  dark: (r: number, c: number) => boolean;
}

const cache = new Map<string, QrMatrix | null>();

/** QR modules for a value (error correction M). Returns null for empty/oversized input. */
export function qrMatrix(value: string): QrMatrix | null {
  const v = value.trim();
  if (!v) return null;
  if (cache.has(v)) return cache.get(v)!;
  let out: QrMatrix | null = null;
  try {
    const qr = QRCode.create(v, { errorCorrectionLevel: "M" });
    const { size, data } = qr.modules;
    out = { size, dark: (r, c) => Boolean(data[r * size + c]) };
  } catch {
    out = null;
  }
  if (cache.size > 50) cache.clear();
  cache.set(v, out);
  return out;
}

/** One SVG path for all dark modules (horizontal runs merged), in module units. */
export function qrPath(m: QrMatrix): string {
  let d = "";
  for (let r = 0; r < m.size; r++) {
    let c = 0;
    while (c < m.size) {
      if (!m.dark(r, c)) { c++; continue; }
      const start = c;
      while (c < m.size && m.dark(r, c)) c++;
      d += `M${start} ${r}h${c - start}v1h${start - c}z`;
    }
  }
  return d;
}

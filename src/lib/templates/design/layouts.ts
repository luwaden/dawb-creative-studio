import type { DesignElement } from "@/lib/design/types";
import { bar, footer, H, header, M, rule, textHeight, W, type B, type Theme } from "./common";

/**
 * Reusable slide layouts. Each post template combines these with its own theme,
 * copy from the campaign calendar, and post-specific visuals.
 */

interface Copy {
  eyebrow?: string;
  headline: string;
  body?: string;
  note?: string;
}

const CW = W - M * 2;

function headlineSize(text: string, base: number) {
  const n = text.length;
  if (n > 90) return base * 0.62;
  if (n > 64) return base * 0.72;
  if (n > 44) return base * 0.84;
  return base;
}

/** Full-bleed photo with the copy over a dark fade in the lower part. */
export function cinematic(b: B, t: Theme, c: Copy & { imageHint: string; footerLabel?: string; counter?: string; align?: "left" | "center"; headlineBase?: number }): DesignElement[] {
  const align = c.align ?? "left";
  const fs = headlineSize(c.headline, c.headlineBase ?? 96);
  const hh = textHeight(c.headline, CW, fs, 1.04, 0.5);
  const bodyFs = 32;
  const bh = c.body ? textHeight(c.body, CW, bodyFs, 1.4, 0.5) : 0;
  const bottom = H - 150;
  const headY = bottom - bh - (c.body ? 36 : 0) - hh;
  const els: DesignElement[] = [
    b.image({ x: 0, y: 0, w: W, h: H, placeholderFill: "$surface", hint: c.imageHint, label: "Main photo", name: "Main photo" }),
    b.rect({ x: 0, y: H * 0.38, w: W, h: H * 0.62, fill: "$paper", fade: "up", name: "Legibility fade" }),
    ...header(b, t),
  ];
  if (c.eyebrow) {
    els.push(b.text(c.eyebrow, { x: M, y: headY - 66, w: CW, fontFamily: t.body, fontSize: 24, fontWeight: 600, fill: "$accent", letterSpacing: 4, uppercase: true, align, label: "Eyebrow", name: "Eyebrow" }));
  }
  els.push(
    b.text(c.headline, { x: M, y: headY, w: CW, fontFamily: t.display, fontSize: fs, fontWeight: t.displayWeight, fill: "$ink", lineHeight: 1.04, letterSpacing: -fs * 0.015, align, label: "Headline", name: "Headline", multiline: true }),
  );
  if (c.body) {
    els.push(b.text(c.body, { x: M, y: headY + hh + 36, w: CW, fontFamily: t.body, fontSize: bodyFs, fontWeight: 400, fill: "$muted", lineHeight: 1.4, align, label: "Supporting text", name: "Supporting text", multiline: true }));
  }
  els.push(...footer(b, t, c.footerLabel ?? "", { counter: c.counter }));
  return els;
}

/** Photo panel at the top, copy below — the calendar's "visual 60% + text 40%". */
export function imageTop(b: B, t: Theme, c: Copy & { imageHint: string; counter?: string; footerLabel?: string; imageHeight?: number }): DesignElement[] {
  const ih = c.imageHeight ?? 600;
  const y0 = 190;
  const fs = headlineSize(c.headline, 74);
  const hh = textHeight(c.headline, CW, fs, 1.06, 0.5);
  const els: DesignElement[] = [
    ...header(b, t),
    b.image({ x: M, y: y0, w: CW, h: ih, placeholderFill: "$surface", hint: c.imageHint, label: "Slide photo", name: "Slide photo", cornerRadius: 4 }),
  ];
  let y = y0 + ih + 54;
  if (c.eyebrow) {
    els.push(b.text(c.eyebrow, { x: M, y, w: CW, fontFamily: "JetBrains Mono", fontSize: 22, fontWeight: 500, fill: "$primary", letterSpacing: 2, uppercase: true, label: "Eyebrow", name: "Eyebrow" }));
    y += 44;
  }
  els.push(b.text(c.headline, { x: M, y, w: CW, fontFamily: t.display, fontSize: fs, fontWeight: t.displayWeight, fill: "$ink", lineHeight: 1.06, letterSpacing: -fs * 0.01, label: "Headline", name: "Headline", multiline: true }));
  y += hh + 26;
  if (c.body) els.push(b.text(c.body, { x: M, y, w: CW, fontFamily: t.body, fontSize: 28, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body", multiline: true }));
  els.push(...footer(b, t, c.footerLabel ?? "Swipe →", { counter: c.counter }));
  return els;
}

/** Copy at the top, photo filling the lower part. */
export function textTop(b: B, t: Theme, c: Copy & { imageHint: string; counter?: string; footerLabel?: string }): DesignElement[] {
  const fs = headlineSize(c.headline, 80);
  const hh = textHeight(c.headline, CW, fs, 1.05, 0.5);
  let y = 200;
  const els: DesignElement[] = [...header(b, t)];
  if (c.eyebrow) {
    els.push(rule(b, M, y + 14, 56), b.text(c.eyebrow, { x: M + 76, y, w: CW - 76, fontFamily: t.body, fontSize: 24, fontWeight: 700, fill: "$primary", letterSpacing: 3, uppercase: true, label: "Eyebrow", name: "Eyebrow" }));
    y += 64;
  }
  els.push(b.text(c.headline, { x: M, y, w: CW, fontFamily: t.display, fontSize: fs, fontWeight: t.displayWeight, fill: "$ink", lineHeight: 1.05, letterSpacing: -fs * 0.012, label: "Headline", name: "Headline", multiline: true }));
  y += hh + 28;
  if (c.body) {
    const bh = textHeight(c.body, CW, 28, 1.45, 0.5);
    els.push(b.text(c.body, { x: M, y, w: CW, fontFamily: t.body, fontSize: 28, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body", multiline: true }));
    y += bh + 40;
  }
  const imgH = Math.max(260, H - 130 - y);
  els.push(b.image({ x: M, y, w: CW, h: imgH, placeholderFill: "$surface", hint: c.imageHint, label: "Slide photo", name: "Slide photo", cornerRadius: 4 }));
  els.push(...footer(b, t, c.footerLabel ?? "Swipe →", { counter: c.counter }));
  return els;
}

/** Pure typography — statement and manifesto slides. */
export function statement(b: B, t: Theme, c: Copy & { counter?: string; footerLabel?: string; align?: "left" | "center"; headlineBase?: number; quote?: boolean }): DesignElement[] {
  const align = c.align ?? "left";
  const fs = headlineSize(c.headline, c.headlineBase ?? 92);
  const font = c.quote ? t.quote : t.display;
  const hh = textHeight(c.headline, CW, fs, 1.08, c.quote ? 0.44 : 0.5);
  const bh = c.body ? textHeight(c.body, CW, 32, 1.45, 0.5) : 0;
  const total = hh + (c.body ? 60 + bh : 0) + (c.eyebrow ? 70 : 0);
  let y = Math.max(220, (H - total) / 2);
  const els: DesignElement[] = [...header(b, t)];
  if (c.eyebrow) {
    els.push(b.text(c.eyebrow, { x: M, y, w: CW, fontFamily: t.body, fontSize: 24, fontWeight: 700, fill: "$primary", letterSpacing: 4, uppercase: true, align, label: "Eyebrow", name: "Eyebrow" }));
    y += 70;
  }
  els.push(b.text(c.headline, { x: M, y, w: CW, fontFamily: font, fontSize: fs, fontWeight: c.quote ? 500 : t.displayWeight, italic: c.quote, fill: "$ink", lineHeight: 1.08, letterSpacing: c.quote ? 0 : -fs * 0.012, align, label: "Headline", name: "Headline", multiline: true }));
  y += hh + 30;
  if (c.body) {
    els.push(rule(b, align === "center" ? W / 2 - 40 : M, y, 80));
    els.push(b.text(c.body, { x: M, y: y + 30, w: CW, fontFamily: t.body, fontSize: 32, fill: "$muted", lineHeight: 1.45, align, label: "Body", name: "Body", multiline: true }));
  }
  els.push(...footer(b, t, c.footerLabel ?? "", { counter: c.counter }));
  return els;
}

/** Headline + bullet list (e.g. "What He Discovered", "What AI Can Do"). */
export function list(b: B, t: Theme, c: Copy & { items: string[]; counter?: string; footerLabel?: string; marker?: "number" | "dot" | "check" }): DesignElement[] {
  const fs = headlineSize(c.headline, 78);
  const hh = textHeight(c.headline, CW, fs, 1.05, 0.5);
  let y = 210;
  const els: DesignElement[] = [...header(b, t)];
  if (c.eyebrow) {
    els.push(b.text(c.eyebrow, { x: M, y, w: CW, fontFamily: "JetBrains Mono", fontSize: 22, fontWeight: 500, fill: "$primary", letterSpacing: 2, uppercase: true, label: "Eyebrow", name: "Eyebrow" }));
    y += 50;
  }
  els.push(b.text(c.headline, { x: M, y, w: CW, fontFamily: t.display, fontSize: fs, fontWeight: t.displayWeight, fill: "$ink", lineHeight: 1.05, label: "Headline", name: "Headline", multiline: true }));
  y += hh + 56;
  const gap = Math.min(150, (H - 170 - y) / Math.max(1, c.items.length));
  c.items.forEach((item, i) => {
    const marker = c.marker ?? "number";
    if (marker === "number") {
      els.push(b.text(String(i + 1).padStart(2, "0"), { x: M, y: y + 2, w: 80, fontFamily: "JetBrains Mono", fontSize: 30, fontWeight: 700, fill: "$primary", name: `Item ${i + 1} number` }));
    } else {
      els.push(b.shape(marker === "check" ? "ring" : "ellipse", { x: M + 6, y: y + 12, w: 20, h: 20, fill: "$primary", innerRatio: 0.55, name: `Item ${i + 1} marker` }));
    }
    els.push(b.text(item, { x: M + 92, y, w: CW - 92, fontFamily: t.body, fontSize: 36, fontWeight: 500, fill: "$ink", lineHeight: 1.3, label: `Point ${i + 1}`, name: `Point ${i + 1}` }));
    if (i < c.items.length - 1) els.push(b.shape("line", { x: M + 92, y: y + gap - 22, w: CW - 92, h: 2, stroke: "$muted", strokeWidth: 1.5, fill: "transparent", opacity: 0.35, name: "Divider" }));
    y += gap;
  });
  els.push(...footer(b, t, c.footerLabel ?? "Swipe →", { counter: c.counter }));
  return els;
}

/** One dominant number. */
export function stat(b: B, t: Theme, c: { number: string; numberSize?: number; line: string; body?: string; eyebrow?: string; counter?: string; footerLabel?: string; numberFont?: string }): DesignElement[] {
  const ns = c.numberSize ?? 220;
  const y = 380;
  const els: DesignElement[] = [...header(b, t)];
  if (c.eyebrow) els.push(b.text(c.eyebrow, { x: M, y: y - 80, w: CW, fontFamily: t.body, fontSize: 24, fontWeight: 700, fill: "$primary", letterSpacing: 4, uppercase: true, label: "Eyebrow", name: "Eyebrow" }));
  els.push(
    b.text(c.number, { x: M - 6, y, w: CW + 12, fontFamily: c.numberFont ?? t.display, fontSize: ns, fontWeight: 700, fill: "$ink", lineHeight: 0.95, letterSpacing: -ns * 0.04, label: "Big number", name: "Big number" }),
    rule(b, M, y + ns + 50, 120),
    b.text(c.line, { x: M, y: y + ns + 90, w: CW, fontFamily: t.display, fontSize: 56, fontWeight: t.displayWeight, fill: "$ink", lineHeight: 1.1, label: "Statement", name: "Statement", multiline: true }),
  );
  if (c.body) els.push(b.text(c.body, { x: M, y: y + ns + 110 + textHeight(c.line, CW, 56, 1.1, 0.5), w: CW, fontFamily: t.body, fontSize: 28, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body", multiline: true }));
  els.push(...footer(b, t, c.footerLabel ?? "", { counter: c.counter }));
  return els;
}

/** The DAWB closing slide: teal on dark, CTA bar. */
export function closing(b: B, t: Theme, c: Copy & { cta: string; counter?: string }): DesignElement[] {
  const fs = headlineSize(c.headline, 84);
  const hh = textHeight(c.headline, CW, fs, 1.06, 0.5);
  const bh = c.body ? textHeight(c.body, CW, 30, 1.45, 0.5) : 0;
  const y = Math.max(300, (H - (hh + bh + 260)) / 2);
  const els: DesignElement[] = [
    b.pattern("grid", { x: 0, y: 0, w: W, h: H, color: "$primary", spacing: 90, size: 1, opacity: 0.12, name: "Grid texture", locked: true }),
    ...header(b, t),
    rule(b, M, y - 50, 90),
    b.text(c.headline, { x: M, y, w: CW, fontFamily: t.display, fontSize: fs, fontWeight: t.displayWeight, fill: "$ink", lineHeight: 1.06, letterSpacing: -fs * 0.012, label: "Headline", name: "Headline", multiline: true }),
  ];
  if (c.body) els.push(b.text(c.body, { x: M, y: y + hh + 34, w: CW, fontFamily: t.body, fontSize: 30, fill: "$muted", lineHeight: 1.45, label: "Body", name: "Body", multiline: true }));
  els.push(...bar(b, c.cta, { x: M, y: y + hh + bh + 100, w: CW, fontSize: 30, font: t.body, label: "Call to action" }));
  els.push(b.text("www.dawblearn.org", { x: M, y: H - 90, w: CW, fontFamily: "Inter", fontSize: 24, fontWeight: 700, fill: "$primary", letterSpacing: 2, name: "Website", label: "Website" }));
  if (c.counter) els.push(b.text(c.counter, { x: W - M - 200, y: H - 88, w: 200, fontFamily: "JetBrains Mono", fontSize: 22, fill: "$muted", align: "right", name: "Slide number" }));
  return els;
}

/** Two-column comparison (e.g. 965 CE vs 1600s, AI can / cannot). */
export function compare(b: B, t: Theme, c: Copy & { left: { label: string; items: string[] }; right: { label: string; items: string[] }; counter?: string; footerLabel?: string }): DesignElement[] {
  const fs = headlineSize(c.headline, 70);
  const hh = textHeight(c.headline, CW, fs, 1.06, 0.5);
  const y0 = 210;
  const colW = (CW - 40) / 2;
  const colY = y0 + hh + 60;
  const colH = H - 150 - colY;
  const els: DesignElement[] = [
    ...header(b, t),
    b.text(c.headline, { x: M, y: y0, w: CW, fontFamily: t.display, fontSize: fs, fontWeight: t.displayWeight, fill: "$ink", lineHeight: 1.06, label: "Headline", name: "Headline", multiline: true }),
  ];
  [c.left, c.right].forEach((col, i) => {
    const x = M + i * (colW + 40);
    els.push(
      b.rect({ x, y: colY, w: colW, h: colH, fill: i === 0 ? "$surface" : "$primary", opacity: i === 0 ? 1 : 0.14, cornerRadius: 6, name: `Column ${i + 1}` }),
      b.text(col.label, { x: x + 36, y: colY + 36, w: colW - 72, fontFamily: "JetBrains Mono", fontSize: 26, fontWeight: 700, fill: i === 0 ? "$accent" : "$primary", uppercase: true, letterSpacing: 1, label: `Column ${i + 1} title`, name: `Column ${i + 1} title` }),
    );
    col.items.forEach((item, j) => {
      els.push(b.text(item, { x: x + 36, y: colY + 110 + j * ((colH - 150) / Math.max(1, col.items.length)), w: colW - 72, fontFamily: t.body, fontSize: 28, fontWeight: 500, fill: "$ink", lineHeight: 1.3, label: `Column ${i + 1} · item ${j + 1}`, name: `Column ${i + 1} item ${j + 1}` }));
    });
  });
  if (c.body) els.push(b.text(c.body, { x: M, y: H - 140, w: CW - 240, fontFamily: t.body, fontSize: 22, fill: "$muted", label: "Note", name: "Note" }));
  els.push(...footer(b, t, c.footerLabel ?? "", { counter: c.counter }));
  return els;
}

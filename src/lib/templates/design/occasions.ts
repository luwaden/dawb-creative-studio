import type { DesignElement } from "@/lib/design/types";
import { badgeLogo, confetti, defineArt, dottedLine, dottedRing, handles, logo, pill, sparkle, texture, type K } from "./kit";

const W = 1080;
const H = 1350;
const NAME = "[Name]";

// ═════════════════════════════════ CHRISTMAS ═════════════════════════════════

function ornament(b: K, x: number, y: number, r: number, from: string, to: string, stringTop = 0): DesignElement[] {
  return [
    b.shape("line", { x: x, y: stringTop, w: Math.max(1, y - r - stringTop), h: 0, rotation: 90, stroke: "#E8C170", strokeWidth: 2, fill: "transparent", opacity: 0.8, name: "Ornament string" }),
    b.rect({ x: x - r * 0.22, y: y - r - r * 0.18, w: r * 0.44, h: r * 0.24, fill: "#E8C170", cornerRadius: 4, name: "Ornament cap" }),
    b.shape("ellipse", { x: x - r, y: y - r, w: r * 2, h: r * 2, fill: from, gradient: [from, to], gradientAngle: 120, name: "Ornament" }),
    b.shape("ellipse", { x: x - r * 0.55, y: y - r * 0.62, w: r * 0.5, h: r * 0.3, fill: "#FFFFFF", opacity: 0.35, rotation: -25, name: "Ornament shine" }),
    b.shape("ellipse", { x: x - r, y: y - r * 0.12, w: r * 2, h: r * 0.24, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 3, dotted: true, dash: [0.1, 10], opacity: 0.55, name: "Ornament band" }),
  ];
}

export const xmasEmerald = defineArt({
  id: "xmas-emerald-ornaments",
  name: "Christmas — Emerald Ornaments",
  category: "christmas",
  format: "ig-portrait",
  style: "Deep emerald · gold ornaments · snowfall",
  tags: ["christmas", "holiday", "festive", "gold", "green"],
  description: "Gradient ornaments hanging on gold threads over deep emerald, snowfall dots and a heavy MERRY CHRISTMAS lockup.",
  pal: { paper: "#0B3B2E", surface: "#0F4D3C", ink: "#FFFFFF", muted: "#BFD8CE", primary: "#0097B2", accent: "#E8C170" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: false, glow: { color: "#1F8A63", x: 540, y: 300, size: 1400, opacity: 0.55 } }),
        b.pattern("dots", { x: 0, y: 0, w: W, h: H, color: "#FFFFFF", spacing: 54, size: 2.2, opacity: 0.35, name: "Snow", locked: true }),
        b.pattern("stars", { x: 0, y: 0, w: W, h: H * 0.6, color: "#FFFFFF", spacing: 70, size: 1.4, opacity: 0.6, name: "Snowflakes", locked: true }),
        ...ornament(b, 220, 330, 96, "#E8C170", "#9C6B1F"),
        ...ornament(b, 540, 470, 130, "#0097B2", "#00525F"),
        ...ornament(b, 860, 300, 84, "#C8102E", "#6E0717"),
        sparkle(b, 380, 220, 46, "#E8C170", 0),
        sparkle(b, 720, 600, 34, "#FFFFFF", 0),
        b.text("Merry", { x: 64, y: 720, w: 952, fontFamily: "Nunito", fontSize: 120, fontWeight: 400, italic: true, fill: "$accent", align: "center", label: "Greeting line 1", name: "Greeting line 1" }),
        b.text("CHRISTMAS", { x: 30, y: 840, w: 1020, fontFamily: "Nunito", fontSize: 172, fontWeight: 900, fill: "#FFFFFF", align: "center", letterSpacing: -4, label: "Greeting line 2", name: "Greeting line 2" }),
        b.text("May your season be full of light, rest and good questions.", { x: 140, y: 1050, w: 800, fontFamily: "Nunito Sans", fontSize: 32, fill: "$muted", align: "center", lineHeight: 1.4, label: "Message", name: "Message" }),
        dottedLine(b, 140, 1170, 800, "#E8C170", { gap: 14, opacity: 0.7 }),
        ...badgeLogo(b, 470, 1196, 140),
        b.text("from all of us at DAWB", { x: 64, y: 50, w: 952, fontFamily: "Nunito Sans", fontSize: 24, fontWeight: 800, fill: "$muted", align: "center", letterSpacing: 4, uppercase: true, label: "Sign-off", name: "Sign-off" }),
      ],
    },
  ],
});

export const xmasHexTree = defineArt({
  id: "xmas-hex-tree",
  name: "Christmas — Hexagon Tree",
  category: "christmas",
  format: "ig-portrait",
  style: "White · emblem-hexagon tree · dotted garlands",
  tags: ["christmas", "minimal", "white", "geometric", "hexagon"],
  description: "A Christmas tree built from the DAWB emblem's hexagons in teal tones, dotted garlands and a gold star — minimal and on-brand.",
  pal: { paper: "#FFFFFF", surface: "#E9F4F6", ink: "#071C24", muted: "#5B6E75", primary: "#0097B2", accent: "#E0A526" },
  pages: (b) => {
    const els: DesignElement[] = [...texture(b, W, H, { light: true, glow: { color: "#0097B2", x: 540, y: 560, size: 1200, opacity: 0.1 } })];
    const shades = ["#0097B2", "#007F96", "#00A9C7", "#00687C", "#2BB8D1"];
    const hw = 104;
    const hh = 120;
    const rows = [1, 2, 3, 4, 5];
    rows.forEach((n, r) => {
      const y = 260 + r * hh * 0.78;
      const startX = 540 - (n * hw) / 2;
      for (let i = 0; i < n; i++) {
        els.push(b.shape("hexagon", { x: startX + i * hw, y, w: hw - 6, h: hh - 6, fill: shades[(r + i) % shades.length], name: "Tree hexagon" }));
      }
    });
    els.push(b.rect({ x: 510, y: 260 + 5 * hh * 0.78, w: 60, h: 70, fill: "#071C24", cornerRadius: 6, name: "Trunk" }));
    els.push(b.shape("star", { x: 490, y: 170, w: 100, h: 100, fill: "$accent", points: 5, innerRatio: 0.45, name: "Star" }));
    els.push(b.shape("wave", { x: 330, y: 400, w: 420, h: 40, rotation: -12, stroke: "#E0A526", strokeWidth: 5, dotted: true, dash: [0.1, 14], fill: "transparent", points: 2, name: "Garland" }));
    els.push(b.shape("wave", { x: 280, y: 560, w: 520, h: 50, rotation: 10, stroke: "#071C24", strokeWidth: 5, dotted: true, dash: [0.1, 14], fill: "transparent", points: 2, opacity: 0.6, name: "Garland" }));
    [[400, 340], [660, 470], [470, 620], [700, 650], [360, 700]].forEach(([x, y], i) => els.push(b.shape("ellipse", { x, y, w: 22, h: 22, fill: i % 2 ? "#E0A526" : "#FFFFFF", name: "Bauble" })));
    els.push(
      logo(b, "light", 40, 30, 120),
      ...handles(b, 560, 60, 456, "$ink"),
      b.text("Merry Christmas", { x: 64, y: 900, w: 952, fontFamily: "Nunito", fontSize: 118, fontWeight: 900, fill: "$ink", align: "center", letterSpacing: -3, label: "Greeting", name: "Greeting" }),
      b.text("& a joyful holiday season", { x: 64, y: 1040, w: 952, fontFamily: "Nunito", fontSize: 44, fontWeight: 400, italic: true, fill: "$primary", align: "center", label: "Subline", name: "Subline" }),
      b.text("Thank you for learning, building and asking questions with us this year.", { x: 160, y: 1130, w: 760, fontFamily: "Nunito Sans", fontSize: 28, fill: "$muted", align: "center", lineHeight: 1.45, label: "Message", name: "Message" }),
    );
    return [{ name: "Card", els }];
  },
});

export const xmasGift = defineArt({
  id: "xmas-cyan-gift",
  name: "Christmas — Cyan Gift Tag",
  category: "christmas",
  format: "ig-portrait",
  style: "Brand cyan · ribbon & gift tag · halftone",
  tags: ["christmas", "cyan", "gift", "ribbon"],
  description: "The whole canvas becomes a gift: white ribbon cross, bow, and a tilted tag carrying the greeting.",
  pal: { paper: "#0097B2", surface: "#0A7F96", ink: "#071C24", muted: "#D4F3F8", primary: "#071C24", accent: "#FFFFFF" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: false, halftone: "#FFFFFF", glow: { color: "#003E4A", x: 100, y: 1300, size: 1300, opacity: 0.5 } }),
        b.pattern("dots", { x: 0, y: 0, w: W, h: H, color: "#FFFFFF", spacing: 60, size: 2.4, opacity: 0.3, name: "Snow", locked: true }),
        b.rect({ x: 690, y: 0, w: 110, h: H, fill: "#FFFFFF", name: "Ribbon vertical" }),
        b.rect({ x: 0, y: 330, w: W, h: 110, fill: "#FFFFFF", name: "Ribbon horizontal" }),
        b.rect({ x: 706, y: 0, w: 6, h: H, fill: "#0097B2", opacity: 0.25, name: "Ribbon stitch" }),
        b.rect({ x: 778, y: 0, w: 6, h: H, fill: "#0097B2", opacity: 0.25, name: "Ribbon stitch" }),
        b.shape("ellipse", { x: 560, y: 240, w: 200, h: 140, fill: "#FFFFFF", rotation: -20, stroke: "#E2F6FA", strokeWidth: 8, name: "Bow loop" }),
        b.shape("ellipse", { x: 730, y: 230, w: 200, h: 140, fill: "#FFFFFF", rotation: 20, stroke: "#E2F6FA", strokeWidth: 8, name: "Bow loop" }),
        b.shape("ellipse", { x: 700, y: 330, w: 90, h: 110, fill: "#E2F6FA", name: "Bow knot" }),
        b.rect({ x: 120, y: 560, w: 620, h: 560, fill: "#FFFFFF", cornerRadius: 36, rotation: -6, name: "Gift tag" }),
        b.shape("ellipse", { x: 160, y: 600, w: 46, h: 46, fill: "transparent", stroke: "#0097B2", strokeWidth: 6, rotation: -6, name: "Tag hole" }),
        b.text("Merry\nChristmas", { x: 170, y: 660, w: 540, fontFamily: "Nunito", fontSize: 110, fontWeight: 900, fill: "#071C24", lineHeight: 0.95, rotation: -6, letterSpacing: -2, label: "Greeting", name: "Greeting" }),
        b.text("To: you  ·  From: DAWB", { x: 190, y: 930, w: 520, fontFamily: "JetBrains Mono", fontSize: 26, fontWeight: 700, fill: "#0097B2", rotation: -6, label: "Tag line", name: "Tag line" }),
        b.text("Wishing you peace, joy\nand curiosity this season.", { x: 196, y: 990, w: 520, fontFamily: "Nunito Sans", fontSize: 28, fill: "#5B6E75", lineHeight: 1.4, rotation: -6, label: "Message", name: "Message" }),
        logo(b, "cyan", 40, 30, 120),
        ...handles(b, 64, 1250, 952, "#FFFFFF", "left"),
      ],
    },
  ],
});

// ═════════════════════════════════ NEW YEAR ═════════════════════════════════

function rays(b: K, cx: number, cy: number, len: number, count: number, color: string, opacity: number): DesignElement[] {
  return Array.from({ length: count }, (_, i) => b.shape("line", { x: cx, y: cy, w: len * (0.55 + ((i * 37) % 10) / 22), h: 0, rotation: (360 / count) * i, stroke: color, strokeWidth: i % 3 === 0 ? 4 : 2, dotted: i % 2 === 1, dash: i % 2 === 1 ? [0.1, 12] : undefined, fill: "transparent", opacity, name: "Burst ray" }));
}

export const nyChrome = defineArt({
  id: "ny-chrome-2027",
  name: "New Year — Chrome 2027",
  category: "newyear",
  format: "ig-portrait",
  style: "Black · chrome numerals · firework rays",
  tags: ["new year", "2027", "chrome", "fireworks", "dark"],
  description: "Huge chrome-gradient 2027 stacked over firework rays on black, with a gold-and-cyan sparkle field.",
  pal: { paper: "#000000", surface: "#111111", ink: "#FFFFFF", muted: "#A9B6BA", primary: "#0097B2", accent: "#FFC83D" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: false, glow: { color: "#0097B2", x: 540, y: 560, size: 1500, opacity: 0.45 } }),
        ...rays(b, 540, 560, 640, 36, "#FFFFFF", 0.22),
        ...rays(b, 860, 230, 260, 18, "#FFC83D", 0.5),
        ...confetti(b, W, H, ["#FFC83D", "#3CD3EC", "#FFFFFF"], 30, 9),
        logo(b, "dark", 40, 30, 120),
        ...handles(b, 560, 60, 456, "#FFFFFF"),
        ...pill(b, "Happy New Year", 340, 210, { fill: "#FFC83D", color: "#000000", size: 26, w: 400, label: "Greeting" }),
        b.text("20", { x: 40, y: 280, w: 1000, fontFamily: "Nunito", fontSize: 420, fontWeight: 900, fill: "#FFFFFF", gradient: ["#FFFFFF", "#9BEFFF", "#0097B2"], align: "center", lineHeight: 0.9, letterSpacing: -20, label: "Year top", name: "Year top" }),
        b.text("27", { x: 40, y: 640, w: 1000, fontFamily: "Nunito", fontSize: 420, fontWeight: 900, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 4, align: "center", lineHeight: 0.9, letterSpacing: 0, label: "Year bottom", name: "Year bottom" }),
        b.text("New year. New questions. Same curiosity.", { x: 100, y: 1060, w: 880, fontFamily: "Nunito", fontSize: 44, fontWeight: 800, fill: "#FFFFFF", align: "center", lineHeight: 1.2, label: "Message", name: "Message" }),
        b.text("Here's to a year of learning, building and discovery.", { x: 100, y: 1180, w: 880, fontFamily: "Nunito Sans", fontSize: 28, fill: "$muted", align: "center", label: "Sub-message", name: "Sub-message" }),
      ],
    },
  ],
});

export const nySwiss = defineArt({
  id: "ny-swiss-calendar",
  name: "New Year — Swiss 01 January",
  category: "newyear",
  format: "ig-portrait",
  style: "White Swiss grid · monumental 01 · red dot",
  tags: ["new year", "swiss", "minimal", "white", "typography"],
  description: "International-style poster: monumental 01, vertical JANUARY, a grid of thin rules and one red dot for punctuation.",
  pal: { paper: "#FFFFFF", surface: "#F1F4F5", ink: "#071C24", muted: "#5B6E75", primary: "#0097B2", accent: "#E5484D" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.06 }),
        ...[270, 540, 810].map((x) => b.rect({ x, y: 0, w: 1.5, h: H, fill: "$ink", opacity: 0.12, name: "Grid rule", locked: true })),
        ...[338, 675, 1012].map((y) => b.rect({ x: 0, y, w: W, h: 1.5, fill: "$ink", opacity: 0.12, name: "Grid rule", locked: true })),
        logo(b, "light", 40, 30, 120),
        ...handles(b, 560, 60, 456, "$ink"),
        b.text("01", { x: 20, y: 250, w: 900, fontFamily: "Nunito", fontSize: 640, fontWeight: 900, fill: "$ink", letterSpacing: -40, lineHeight: 0.85, label: "Day", name: "Day" }),
        b.shape("ellipse", { x: 790, y: 700, w: 110, h: 110, fill: "$accent", name: "Red dot" }),
        b.text("JANUARY", { x: 960, y: 260, w: 700, fontFamily: "Nunito", fontSize: 92, fontWeight: 900, fill: "$primary", rotation: 90, letterSpacing: 12, label: "Month", name: "Month" }),
        b.text("Happy New Year", { x: 64, y: 880, w: 900, fontFamily: "Nunito", fontSize: 104, fontWeight: 900, fill: "$ink", letterSpacing: -3, label: "Greeting", name: "Greeting" }),
        b.text("2027", { x: 64, y: 1000, w: 500, fontFamily: "Nunito", fontSize: 104, fontWeight: 300, fill: "$primary", label: "Year", name: "Year" }),
        b.text("Chapter one of three hundred and sixty-five. Make the first question count.", { x: 560, y: 1030, w: 440, fontFamily: "Nunito Sans", fontSize: 26, fill: "$muted", lineHeight: 1.45, label: "Message", name: "Message" }),
        b.text("DAWB DATA & RESEARCH", { x: 64, y: 1270, w: 952, fontFamily: "Nunito Sans", fontSize: 20, fontWeight: 900, fill: "$ink", letterSpacing: 6, name: "Footer" }),
      ],
    },
  ],
});

export const nyRings = defineArt({
  id: "ny-countdown-rings",
  name: "New Year — Twelve Rings",
  category: "newyear",
  format: "ig-square",
  style: "Cyan · 12 month arcs · centred year",
  tags: ["new year", "cyan", "rings", "square"],
  description: "Twelve concentric arcs — one per month of the year ahead — orbiting a bold 2027 on brand cyan.",
  pal: { paper: "#0097B2", surface: "#0A7F96", ink: "#FFFFFF", muted: "#D4F3F8", primary: "#071C24", accent: "#FFD24A" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, 1080, 1080, { light: false, glow: { color: "#9BEFFF", x: 540, y: 540, size: 1200, opacity: 0.35 } }),
        ...Array.from({ length: 12 }, (_, i) => {
          const r = 150 + i * 30;
          return b.shape("arc", { x: 540 - r, y: 520 - r, w: r * 2, h: r * 2, fill: i % 4 === 0 ? "#FFD24A" : i % 2 ? "#FFFFFF" : "#071C24", innerRatio: 1 - 8 / r, angle: 60 + ((i * 47) % 270), points: i * 29, opacity: i % 2 ? 0.75 : 0.9, name: `Month ${i + 1} arc` });
        }),
        logo(b, "cyan", 40, 30, 110),
        b.text("2027", { x: 140, y: 440, w: 800, fontFamily: "Nunito", fontSize: 170, fontWeight: 900, fill: "#FFFFFF", align: "center", letterSpacing: -6, label: "Year", name: "Year" }),
        b.text("HAPPY NEW YEAR", { x: 140, y: 400, w: 800, fontFamily: "Nunito Sans", fontSize: 28, fontWeight: 900, fill: "#071C24", align: "center", letterSpacing: 8, label: "Greeting", name: "Greeting" }),
        b.text("Twelve months. Endless questions worth answering.", { x: 90, y: 960, w: 900, fontFamily: "Nunito", fontSize: 34, fontWeight: 800, fill: "#FFFFFF", align: "center", label: "Message", name: "Message" }),
      ],
    },
  ],
});

// ═════════════════════════════════ NEW MONTH ═════════════════════════════════

function calendar(b: K, x: number, y: number, cell: number, start: number, days: number, o: { ink: string; muted: string; hi: string; hiText: string; cellFill: string }): DesignElement[] {
  const els: DesignElement[] = [];
  ["S", "M", "T", "W", "T", "F", "S"].forEach((d, i) => els.push(b.text(d, { x: x + i * (cell + 10), y, w: cell, fontFamily: "Nunito Sans", fontSize: cell * 0.3, fontWeight: 900, fill: o.muted, align: "center", name: "Weekday" })));
  for (let d = 1; d <= days; d++) {
    const idx = start + d - 1;
    const cx = x + (idx % 7) * (cell + 10);
    const cy = y + cell * 0.6 + Math.floor(idx / 7) * (cell + 10);
    const first = d === 1;
    els.push(b.rect({ x: cx, y: cy, w: cell, h: cell, fill: first ? o.hi : o.cellFill, cornerRadius: first ? cell / 2 : cell * 0.22, stroke: first ? "transparent" : o.muted, strokeWidth: first ? 0 : 1.5, dotted: !first, dash: first ? undefined : [0.1, 7], name: first ? "Day 1" : "Day" }));
    els.push(b.text(String(d), { x: cx, y: cy, w: cell, h: cell, verticalAlign: "middle", fontFamily: "Nunito", fontSize: cell * (first ? 0.44 : 0.34), fontWeight: first ? 900 : 700, fill: first ? o.hiText : o.ink, align: "center", name: "Date" }));
  }
  return els;
}

export const nmGrid = defineArt({
  id: "nm-month-grid",
  name: "New Month — Outline & Calendar",
  category: "newmonth",
  format: "ig-portrait",
  style: "White · outlined month · dotted calendar",
  tags: ["new month", "calendar", "white", "november"],
  description: "Outlined month name across the top, a dotted-cell calendar with day one circled in cyan and a quiet message.",
  pal: { paper: "#FFFFFF", surface: "#EEF7F9", ink: "#071C24", muted: "#7A8C92", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: true, contours: "#0097B2", glow: { color: "#0097B2", x: 1000, y: 1250, size: 900, opacity: 0.12 } }),
        logo(b, "light", 40, 30, 120),
        ...handles(b, 560, 60, 456, "$ink"),
        ...pill(b, "Happy New Month", 64, 200, { fill: "$primary", color: "#FFFFFF", size: 24, label: "Greeting" }),
        b.text("NOVEMBER", { x: 50, y: 280, w: 1000, fontFamily: "Nunito", fontSize: 150, fontWeight: 900, fill: "transparent", stroke: "$ink", strokeWidth: 3, letterSpacing: 0, label: "Month", name: "Month" }),
        b.text("2026", { x: 64, y: 470, w: 400, fontFamily: "Nunito", fontSize: 64, fontWeight: 300, fill: "$primary", label: "Year", name: "Year" }),
        ...calendar(b, 64, 580, 108, 0, 30, { ink: "#071C24", muted: "#7A8C92", hi: "#0097B2", hiText: "#FFFFFF", cellFill: "#FFFFFF" }),
        b.text("New month. New questions worth answering.", { x: 64, y: 1270, w: 952, fontFamily: "Nunito", fontSize: 32, fontWeight: 800, fill: "$ink", label: "Message", name: "Message" }),
      ],
    },
  ],
});

export const nmNumeral = defineArt({
  id: "nm-big-numeral",
  name: "New Month — Big Numeral",
  category: "newmonth",
  format: "ig-portrait",
  style: "Cyan · monumental outlined numeral · contours",
  tags: ["new month", "cyan", "numeral", "november"],
  description: "The month number as a monumental outline on cyan with topographic lines, plus a solid month name.",
  pal: { paper: "#0097B2", surface: "#0A7F96", ink: "#FFFFFF", muted: "#D4F3F8", primary: "#071C24", accent: "#FFFFFF" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: false, contours: "#FFFFFF", glow: { color: "#003E4A", x: 1000, y: 1300, size: 1300, opacity: 0.55 } }),
        b.text("11", { x: 40, y: 150, w: 1040, fontFamily: "Nunito", fontSize: 760, fontWeight: 900, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 4, letterSpacing: -20, lineHeight: 0.85, opacity: 0.85, label: "Month number", name: "Month number" }),
        logo(b, "cyan", 40, 30, 120),
        b.text("Happy\nNew Month", { x: 64, y: 760, w: 900, fontFamily: "Nunito", fontSize: 128, fontWeight: 900, fill: "#FFFFFF", lineHeight: 0.95, letterSpacing: -3, label: "Greeting", name: "Greeting" }),
        ...pill(b, "November 2026", 64, 1040, { fill: "#071C24", color: "#FFFFFF", size: 28, w: 420, label: "Month" }),
        b.text("May every day this month bring you closer to the answers you're looking for.", { x: 64, y: 1140, w: 820, fontFamily: "Nunito Sans", fontSize: 30, fill: "#D4F3F8", lineHeight: 1.4, label: "Message", name: "Message" }),
        ...handles(b, 560, 60, 456, "#FFFFFF"),
      ],
    },
  ],
});

export const nmTimeline = defineArt({
  id: "nm-days-timeline",
  name: "New Month — Thirty Days",
  category: "newmonth",
  format: "ig-portrait",
  style: "Dark · 30-dot timeline · glow",
  tags: ["new month", "dark", "timeline", "dots"],
  description: "Thirty days as a winding dotted timeline on black, the first day glowing cyan, the month name set big beneath.",
  pal: { paper: "#000000", surface: "#0B1A20", ink: "#FFFFFF", muted: "#9FB4BB", primary: "#0097B2", accent: "#3CD3EC" },
  pages: (b) => {
    const els: DesignElement[] = [...texture(b, W, H, { light: false, glow: { color: "#0097B2", x: 150, y: 330, size: 900, opacity: 0.6 } })];
    for (let d = 0; d < 30; d++) {
      const row = Math.floor(d / 10);
      const i = row % 2 === 0 ? d % 10 : 9 - (d % 10);
      const x = 120 + i * 92;
      const y = 300 + row * 150 + Math.sin(i * 0.8) * 16;
      const first = d === 0;
      if (first) els.push(b.shape("ellipse", { x: x - 60, y: y - 60, w: 120, h: 120, fill: "#0097B2", fade: undefined, opacity: 0.25, name: "Day 1 halo" }));
      els.push(b.shape("ellipse", { x: x - (first ? 30 : 12), y: y - (first ? 30 : 12), w: first ? 60 : 24, h: first ? 60 : 24, fill: first ? "#3CD3EC" : "transparent", stroke: "#FFFFFF", strokeWidth: first ? 0 : 2.5, opacity: first ? 1 : 0.55, name: "Day dot" }));
    }
    els.push(
      dottedLine(b, 120, 300, 828, "#FFFFFF", { gap: 12, opacity: 0.25, dot: 2 }),
      dottedLine(b, 120, 450, 828, "#FFFFFF", { gap: 12, opacity: 0.25, dot: 2 }),
      dottedLine(b, 120, 600, 828, "#FFFFFF", { gap: 12, opacity: 0.25, dot: 2 }),
      b.text("DAY 01", { x: 70, y: 210, w: 200, fontFamily: "JetBrains Mono", fontSize: 22, fontWeight: 700, fill: "$accent", label: "Day label", name: "Day label" }),
      logo(b, "dark", 40, 30, 120),
      ...handles(b, 560, 60, 456, "#FFFFFF"),
      b.text("Happy New Month", { x: 64, y: 760, w: 952, fontFamily: "Nunito Sans", fontSize: 34, fontWeight: 900, fill: "$accent", letterSpacing: 6, uppercase: true, label: "Greeting", name: "Greeting" }),
      b.text("November", { x: 56, y: 810, w: 980, fontFamily: "Nunito", fontSize: 200, fontWeight: 900, fill: "#FFFFFF", letterSpacing: -6, label: "Month", name: "Month" }),
      b.text("Thirty fresh days. One question at a time.", { x: 64, y: 1080, w: 900, fontFamily: "Nunito", fontSize: 40, fontWeight: 700, fill: "$muted", label: "Message", name: "Message" }),
    );
    return [{ name: "Card", els }];
  },
});

// ═════════════════════════════════ BIRTHDAY ═════════════════════════════════

export const bdSunshine = defineArt({
  id: "bd-sunshine-arch",
  name: "Birthday — Sunshine Arch",
  category: "birthday",
  format: "ig-portrait",
  style: "White · arch portrait · sunshine yellow confetti",
  tags: ["birthday", "celebration", "white", "yellow", "photo"],
  description: "Arch-framed portrait, sunshine-yellow and cyan confetti, outlined HAPPY over a solid Birthday and the name in cyan.",
  pal: { paper: "#FFFFFF", surface: "#FFF4D6", ink: "#071C24", muted: "#5B6E75", primary: "#0097B2", accent: "#FFB800" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: true, glow: { color: "#FFB800", x: 760, y: 420, size: 1000, opacity: 0.22 } }),
        b.shape("ellipse", { x: 600, y: 160, w: 500, h: 500, fill: "#FFB800", opacity: 0.9, name: "Sun" }),
        b.image({ x: 650, y: 240, w: 380, h: 600, cornerRadius: 190, placeholderFill: "$surface", hint: "Celebrant's photo", label: "Photo", name: "Photo", stroke: "#071C24", strokeWidth: 6 }),
        ...confetti(b, W, H, ["#FFB800", "#0097B2", "#071C24", "#FF6B6B"], 36, 4),
        logo(b, "light", 40, 30, 120),
        b.text("HAPPY", { x: 56, y: 240, w: 560, fontFamily: "Nunito", fontSize: 124, fontWeight: 900, fill: "transparent", stroke: "$ink", strokeWidth: 3, letterSpacing: 2, label: "Greeting line 1", name: "Greeting line 1" }),
        b.text("Birthday", { x: 56, y: 380, w: 560, fontFamily: "Nunito", fontSize: 104, fontWeight: 900, fill: "$ink", letterSpacing: -3, label: "Greeting line 2", name: "Greeting line 2" }),
        sparkle(b, 520, 560, 60, "#FFB800", 0),
        b.text(NAME, { x: 56, y: 940, w: 952, fontFamily: "Nunito", fontSize: 130, fontWeight: 900, fill: "$primary", letterSpacing: -3, label: "Name", name: "Name" }),
        b.text("Wishing you a year of big wins, bold questions and beautiful answers.", { x: 56, y: 1100, w: 760, fontFamily: "Nunito Sans", fontSize: 30, fill: "$muted", lineHeight: 1.4, label: "Message", name: "Message" }),
        b.text("— Team DAWB", { x: 56, y: 1240, w: 500, fontFamily: "Nunito", fontSize: 30, fontWeight: 800, italic: true, fill: "$ink", label: "Sign-off", name: "Sign-off" }),
      ],
    },
  ],
});

export const bdPolaroid = defineArt({
  id: "bd-cyan-polaroid",
  name: "Birthday — Cyan Polaroid",
  category: "birthday",
  format: "ig-portrait",
  style: "Cyan · tilted polaroid · tape · stacked HBD",
  tags: ["birthday", "cyan", "polaroid", "collage"],
  description: "Collage energy: a taped, tilted polaroid of the celebrant, a giant stacked HBD and sparkles on cyan.",
  pal: { paper: "#0097B2", surface: "#E9F4F6", ink: "#FFFFFF", muted: "#D4F3F8", primary: "#071C24", accent: "#FFD24A" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: false, halftone: "#FFFFFF", glow: { color: "#003E4A", x: 0, y: 1350, size: 1300, opacity: 0.5 } }),
        b.text("H\nB\nD", { x: 40, y: 150, w: 400, fontFamily: "Nunito", fontSize: 330, fontWeight: 900, fill: "#FFFFFF", lineHeight: 0.8, label: "Monogram", name: "Monogram" }),
        b.rect({ x: 440, y: 270, w: 560, h: 680, fill: "#071C24", opacity: 0.25, cornerRadius: 10, rotation: 7, name: "Polaroid shadow" }),
        b.rect({ x: 420, y: 250, w: 560, h: 680, fill: "#FFFFFF", cornerRadius: 10, rotation: 6, name: "Polaroid" }),
        b.image({ x: 455, y: 290, w: 490, h: 500, placeholderFill: "$surface", hint: "Celebrant's photo", label: "Photo", name: "Photo", rotation: 6 }),
        b.text(NAME, { x: 440, y: 830, w: 480, fontFamily: "Nunito", fontSize: 50, fontWeight: 900, fill: "#071C24", align: "center", rotation: 6, label: "Name on polaroid", name: "Name on polaroid" }),
        b.rect({ x: 600, y: 215, w: 200, h: 56, fill: "#FFD24A", opacity: 0.85, rotation: -4, name: "Tape" }),
        b.rect({ x: 900, y: 840, w: 160, h: 50, fill: "#FFFFFF", opacity: 0.7, rotation: 40, name: "Tape" }),
        sparkle(b, 380, 990, 80, "#FFD24A", 0),
        sparkle(b, 990, 200, 50, "#FFFFFF", 0),
        sparkle(b, 330, 1080, 40, "#FFFFFF", 20),
        logo(b, "cyan", 900, 30, 120),
        b.text("Happy Birthday!", { x: 56, y: 1050, w: 952, fontFamily: "Nunito", fontSize: 96, fontWeight: 900, fill: "#FFFFFF", letterSpacing: -2, label: "Greeting", name: "Greeting" }),
        b.text("Another year of growth. We're proud to learn alongside you.", { x: 56, y: 1170, w: 900, fontFamily: "Nunito Sans", fontSize: 30, fill: "#071C24", fontWeight: 700, label: "Message", name: "Message" }),
      ],
    },
  ],
});

export const bdGold = defineArt({
  id: "bd-gold-night",
  name: "Birthday — Gold Night",
  category: "birthday",
  format: "ig-portrait",
  style: "Black & gold · ring portrait · elegant",
  tags: ["birthday", "gold", "dark", "elegant", "staff"],
  description: "Elegant black-and-gold card: gold gradient lettering, ring-framed portrait inside dotted orbits and soft sparkles.",
  pal: { paper: "#050505", surface: "#1A1A1A", ink: "#FFFFFF", muted: "#BDB4A1", primary: "#0097B2", accent: "#E8C170" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: false, glow: { color: "#E8C170", x: 540, y: 520, size: 1200, opacity: 0.22 } }),
        dottedRing(b, 540, 520, 300, "#E8C170", { opacity: 0.65 }),
        dottedRing(b, 540, 520, 370, "#FFFFFF", { opacity: 0.2, dot: 3, gap: 12 }),
        b.shape("ring", { x: 290, y: 270, w: 500, h: 500, fill: "#E8C170", innerRatio: 0.94, gradient: ["#F7E2A5", "#B8862B"], gradientAngle: 135, name: "Gold ring" }),
        b.image({ x: 312, y: 292, w: 456, h: 456, circle: true, placeholderFill: "$surface", hint: "Celebrant's photo", label: "Photo", name: "Photo" }),
        sparkle(b, 830, 300, 70, "#E8C170", 0),
        sparkle(b, 250, 760, 46, "#F7E2A5", 0),
        sparkle(b, 880, 760, 30, "#FFFFFF", 0),
        logo(b, "dark", 40, 30, 120),
        b.text("Happy Birthday", { x: 64, y: 870, w: 952, fontFamily: "Nunito", fontSize: 112, fontWeight: 900, fill: "#E8C170", gradient: ["#F7E2A5", "#E8C170", "#B8862B"], align: "center", letterSpacing: -2, label: "Greeting", name: "Greeting" }),
        b.text(NAME, { x: 64, y: 1010, w: 952, fontFamily: "Nunito", fontSize: 72, fontWeight: 300, fill: "#FFFFFF", align: "center", letterSpacing: 6, label: "Name", name: "Name" }),
        dottedLine(b, 340, 1130, 400, "#E8C170", { gap: 12 }),
        b.text("Celebrating you today and always.", { x: 64, y: 1160, w: 952, fontFamily: "Nunito Sans", fontSize: 30, fill: "$muted", align: "center", label: "Message", name: "Message" }),
        ...handles(b, 64, 1260, 952, "#BDB4A1", "center", 20),
      ],
    },
  ],
});

export const bdPastel = defineArt({
  id: "bd-pastel-pop",
  name: "Birthday — Pastel Pop",
  category: "birthday",
  format: "ig-portrait",
  style: "Peach & lilac · soft blobs · playful",
  tags: ["birthday", "pastel", "playful", "colourful"],
  description: "A different flavour: peach and lilac blobs, wavy lines and a playful lowercase headline — DAWB cyan as the accent.",
  pal: { paper: "#FFE6D6", surface: "#F5D3FF", ink: "#2A1B3D", muted: "#6D5A80", primary: "#0097B2", accent: "#B79CFF" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: true, dots: 0.08 }),
        b.shape("ellipse", { x: -160, y: -120, w: 700, h: 620, fill: "#B79CFF", opacity: 0.55, rotation: -18, name: "Blob" }),
        b.shape("ellipse", { x: 620, y: 860, w: 620, h: 560, fill: "#0097B2", opacity: 0.35, rotation: 24, name: "Blob" }),
        b.shape("ellipse", { x: 700, y: 120, w: 300, h: 260, fill: "#FF9E7A", opacity: 0.6, rotation: 10, name: "Blob" }),
        b.shape("wave", { x: 60, y: 700, w: 520, h: 60, stroke: "#2A1B3D", strokeWidth: 5, fill: "transparent", points: 4, name: "Wave" }),
        b.shape("wave", { x: 520, y: 1150, w: 480, h: 50, stroke: "#0097B2", strokeWidth: 6, dotted: true, dash: [0.1, 14], fill: "transparent", points: 4, name: "Wave" }),
        ...badgeLogo(b, 40, 30, 120),
        b.image({ x: 560, y: 300, w: 440, h: 440, circle: true, placeholderFill: "$surface", hint: "Celebrant's photo", label: "Photo", name: "Photo", stroke: "#FFFFFF", strokeWidth: 14 }),
        b.text("it's\nyour\nday!", { x: 64, y: 220, w: 520, fontFamily: "Nunito", fontSize: 150, fontWeight: 900, fill: "$ink", lineHeight: 0.88, letterSpacing: -4, label: "Headline", name: "Headline" }),
        b.text(`Happy birthday, ${NAME}`, { x: 64, y: 820, w: 952, fontFamily: "Nunito", fontSize: 72, fontWeight: 900, fill: "$primary", letterSpacing: -1, label: "Greeting", name: "Greeting" }),
        b.text("Here's to more laughter, learning and little victories.", { x: 64, y: 930, w: 700, fontFamily: "Nunito Sans", fontSize: 32, fill: "$muted", lineHeight: 1.4, label: "Message", name: "Message" }),
        ...confetti(b, W, H, ["#2A1B3D", "#0097B2", "#FF9E7A", "#FFFFFF"], 16, 11, { x: 0, y: 1050, w: 600, h: 260 }),
        ...handles(b, 64, 1250, 600, "$ink", "left", 20),
      ],
    },
  ],
});

// ═════════════════════════════════ WEEKEND ═════════════════════════════════

export const wkSun = defineArt({
  id: "wk-sun-waves",
  name: "Weekend — Sun & Waves",
  category: "weekend",
  format: "ig-portrait",
  style: "Cyan · warm sun gradient · dotted waves",
  tags: ["weekend", "cyan", "sun", "relax"],
  description: "A warm sun rising out of dotted waves on cyan. Rest. Reflect. Recharge.",
  pal: { paper: "#0097B2", surface: "#0A7F96", ink: "#FFFFFF", muted: "#D4F3F8", primary: "#071C24", accent: "#FFC83D" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: false, glow: { color: "#FFC83D", x: 540, y: 640, size: 1200, opacity: 0.35 } }),
        b.shape("ellipse", { x: 240, y: 340, w: 600, h: 600, fill: "#FFC83D", gradient: ["#FFE08A", "#FF8A3D"], gradientAngle: 90, name: "Sun" }),
        b.rect({ x: 0, y: 700, w: W, h: 650, fill: "#0097B2", name: "Sea" }),
        ...[0, 1, 2, 3, 4, 5].map((i) => b.shape("wave", { x: -40, y: 690 + i * 70, w: 1160, h: 30 + i * 4, stroke: i % 2 ? "#FFFFFF" : "#071C24", strokeWidth: 5, dotted: i % 2 === 0, dash: i % 2 === 0 ? [0.1, 14] : undefined, fill: "transparent", points: 5 + i, opacity: 0.7 - i * 0.07, name: "Wave" })),
        logo(b, "cyan", 40, 30, 120),
        ...handles(b, 560, 60, 456, "#FFFFFF"),
        b.text("Happy\nWeekend", { x: 64, y: 140, w: 952, fontFamily: "Nunito", fontSize: 116, fontWeight: 900, fill: "#FFFFFF", align: "center", lineHeight: 0.95, letterSpacing: -2, label: "Greeting", name: "Greeting" }),
        b.text("Rest. Reflect. Recharge.", { x: 64, y: 1150, w: 952, fontFamily: "Nunito", fontSize: 56, fontWeight: 900, fill: "#FFFFFF", align: "center", label: "Message", name: "Message" }),
        b.text("The best insights often arrive when you step away from the screen.", { x: 140, y: 1230, w: 800, fontFamily: "Nunito Sans", fontSize: 26, fill: "#D4F3F8", align: "center", label: "Sub-message", name: "Sub-message" }),
      ],
    },
  ],
});

export const wkStrip = defineArt({
  id: "wk-week-strip",
  name: "Weekend — Weekend Mode On",
  category: "weekend",
  format: "ig-portrait",
  style: "White · day chips · toggle switch",
  tags: ["weekend", "white", "ui", "playful"],
  description: "Product-UI wit: a week of day chips with Fri–Sun lit up, and a big toggle switched to Weekend mode.",
  pal: { paper: "#FFFFFF", surface: "#F1F4F5", ink: "#071C24", muted: "#7A8C92", primary: "#0097B2", accent: "#0097B2" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: true, orbits: { color: "#0097B2", x: 980, y: 1250, r: [240, 360, 500] } }),
        logo(b, "light", 40, 30, 120),
        ...handles(b, 560, 60, 456, "$ink"),
        ...["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].flatMap((d, i) => {
          const on = i >= 4;
          const x = 64 + i * 136;
          return [
            b.rect({ x, y: 260, w: 120, h: 160, fill: on ? "#0097B2" : "#F1F4F5", cornerRadius: 26, stroke: on ? "transparent" : "#D5DADE", strokeWidth: on ? 0 : 2, name: "Day chip" }),
            b.text(d, { x, y: 300, w: 120, fontFamily: "Nunito Sans", fontSize: 26, fontWeight: 900, fill: on ? "#FFFFFF" : "#7A8C92", align: "center", name: "Day" }),
            b.shape("ellipse", { x: x + 48, y: 360, w: 24, h: 24, fill: on ? "#FFFFFF" : "#D5DADE", name: "Day dot" }),
          ];
        }),
        b.text("WEEKEND MODE", { x: 64, y: 520, w: 952, fontFamily: "Nunito Sans", fontSize: 34, fontWeight: 900, fill: "$muted", letterSpacing: 8, label: "Label", name: "Label" }),
        b.rect({ x: 64, y: 590, w: 440, h: 220, fill: "#0097B2", cornerRadius: 110, name: "Toggle track" }),
        b.shape("ellipse", { x: 300, y: 610, w: 180, h: 180, fill: "#FFFFFF", name: "Toggle knob" }),
        b.text("ON", { x: 104, y: 590, w: 180, h: 220, verticalAlign: "middle", fontFamily: "Nunito", fontSize: 84, fontWeight: 900, fill: "#FFFFFF", label: "Toggle text", name: "Toggle text" }),
        b.text("Happy\nWeekend.", { x: 64, y: 880, w: 952, fontFamily: "Nunito", fontSize: 150, fontWeight: 900, fill: "$ink", lineHeight: 0.92, letterSpacing: -4, label: "Greeting", name: "Greeting" }),
        b.text("Notifications paused. Curiosity still running.", { x: 64, y: 1200, w: 900, fontFamily: "Nunito Sans", fontSize: 32, fill: "$muted", label: "Message", name: "Message" }),
      ],
    },
  ],
});

export const wkRecharge = defineArt({
  id: "wk-recharge",
  name: "Weekend — Recharge",
  category: "weekend",
  format: "ig-portrait",
  style: "Dark · charging battery · contour lines",
  tags: ["weekend", "dark", "recharge", "battery"],
  description: "A data-style battery charging up in cyan gradient bars on black. Time to recharge.",
  pal: { paper: "#000000", surface: "#0B1A20", ink: "#FFFFFF", muted: "#9FB4BB", primary: "#0097B2", accent: "#3CD3EC" },
  pages: (b) => [
    {
      name: "Card",
      els: [
        ...texture(b, W, H, { light: false, contours: "#0097B2", glow: { color: "#0097B2", x: 540, y: 480, size: 1100, opacity: 0.45 } }),
        b.rect({ x: 240, y: 260, w: 560, h: 300, fill: "transparent", stroke: "#FFFFFF", strokeWidth: 10, cornerRadius: 40, name: "Battery body" }),
        b.rect({ x: 808, y: 360, w: 40, h: 100, fill: "#FFFFFF", cornerRadius: 10, name: "Battery cap" }),
        ...[0, 1, 2, 3, 4].map((i) => b.rect({ x: 272 + i * 104, y: 292, w: 88, h: 236, fill: i < 3 ? "#0097B2" : "transparent", gradient: i < 3 ? ["#3CD3EC", "#0097B2"] : undefined, gradientAngle: 90, stroke: i < 3 ? "transparent" : "#3CD3EC", strokeWidth: i < 3 ? 0 : 3, dotted: i >= 3, dash: i >= 3 ? [0.1, 10] : undefined, cornerRadius: 16, name: "Charge bar" })),
        b.shape("star", { x: 470, y: 330, w: 100, h: 160, fill: "#FFFFFF", points: 2, innerRatio: 0.2, rotation: 20, name: "Bolt" }),
        b.text("60%", { x: 240, y: 590, w: 560, fontFamily: "JetBrains Mono", fontSize: 40, fontWeight: 700, fill: "$accent", align: "center", label: "Charge label", name: "Charge label" }),
        logo(b, "dark", 40, 30, 120),
        ...handles(b, 560, 60, 456, "#FFFFFF"),
        b.text("Happy Weekend", { x: 40, y: 770, w: 1000, fontFamily: "Nunito", fontSize: 108, fontWeight: 900, fill: "#FFFFFF", align: "center", letterSpacing: -3, label: "Greeting", name: "Greeting" }),
        b.text("Time to recharge.", { x: 64, y: 920, w: 952, fontFamily: "Nunito", fontSize: 60, fontWeight: 300, fill: "$accent", align: "center", label: "Message", name: "Message" }),
        b.text("Unplug, rest well, and come back ready for Monday's questions.", { x: 160, y: 1050, w: 760, fontFamily: "Nunito Sans", fontSize: 30, fill: "$muted", align: "center", lineHeight: 1.4, label: "Sub-message", name: "Sub-message" }),
      ],
    },
  ],
});

export const OCCASIONS = [xmasEmerald, xmasHexTree, xmasGift, nyChrome, nySwiss, nyRings, nmGrid, nmNumeral, nmTimeline, bdSunshine, bdPolaroid, bdGold, bdPastel, wkSun, wkStrip, wkRecharge];

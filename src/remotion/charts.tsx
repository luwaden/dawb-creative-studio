import { useId } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { CHART_COLORS, formatValue, isLightColor, niceScale, rampColor, waterfallSteps } from "@/lib/charts";
import { fontStack } from "@/lib/fonts";
import { findRegion, MAPS } from "@/lib/geo/match";
import { qrMatrix, qrPath } from "@/lib/qr";

export type VideoChartKind = "column" | "bar" | "line" | "pie" | "donut" | "waterfall" | "histogram" | "scatter" | "map";

export interface ChartDatum {
  label: string;
  value: number;
  x?: number;
}

interface Props {
  kind: VideoChartKind;
  data: ChartDatum[];
  width: number;
  height: number;
  /** Design unit (1 at 1080 px) so type scales with the frame. */
  u: number;
  unit?: string;
  map?: "nigeria" | "africa";
  /** Light surface? Picks the categorical palette and gridline ink. */
  light: boolean;
  accent: string;
  ink: string;
  muted: string;
  /** Frame the build-in starts. */
  delay?: number;
  font?: string;
  xTitle?: string;
  yTitle?: string;
}

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Animated chart drawn in SVG: marks build in one by one, values count up. */
export function AnimatedChart({ kind, data, width: W, height: H, u, unit = "", map = "nigeria", light, accent, ink, muted, delay = 0, font = "Nunito Sans", xTitle, yTitle }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f = frame - delay;
  const sp = (i: number, stagger = 5) => spring({ frame: f - i * stagger, fps, config: { damping: 200, stiffness: 120 } });
  const fs = 26 * u;
  const ff = fontStack(font);
  const vals = data.map((d) => Number(d.value) || 0);
  const grid = light ? "rgba(7,28,36,0.12)" : "rgba(255,255,255,0.14)";
  const cat = CHART_COLORS[light ? "light" : "dark"];
  const second = light ? "rgba(7,28,36,0.22)" : "rgba(255,255,255,0.3)";
  const text = (x: number, y: number, s: string, o: { size?: number; weight?: number; anchor?: "start" | "middle" | "end"; fill?: string; opacity?: number } = {}) => (
    <text x={x} y={y} textAnchor={o.anchor ?? "middle"} fontFamily={ff} fontSize={o.size ?? fs} fontWeight={o.weight ?? 600} fill={o.fill ?? ink} opacity={o.opacity ?? 1}>{s}</text>
  );

  const axis = (lo: number, hi: number, left: number, top: number, bottom: number) => {
    const { step } = niceScale(Math.max(Math.abs(lo), Math.abs(hi)));
    const min = lo < 0 ? -Math.ceil(-lo / step) * step : 0;
    const max = hi > 0 ? Math.ceil(hi / step) * step : step;
    const yOf = (v: number) => bottom - ((v - min) / (max - min)) * (bottom - top);
    const lines = [];
    const gp = interpolate(f, [0, 18], [0, 1], cl);
    for (let v = min; v <= max + 1e-9; v += step) {
      lines.push(
        <g key={`g${v}`} opacity={gp}>
          <line x1={left} x2={W} y1={yOf(v)} y2={yOf(v)} stroke={grid} strokeWidth={v === 0 ? 2.5 * u : 1.5 * u} strokeDasharray={v === 0 ? undefined : `${2 * u} ${6 * u}`} />
          {text(left - 14 * u, yOf(v) + fs * 0.32, formatValue(v, unit), { anchor: "end", size: fs * 0.78, weight: 500, fill: muted })}
        </g>,
      );
    }
    return { yOf, lines };
  };

  const left = 92 * u;
  const bottomLabel = 64 * u;
  const top = 46 * u;
  const out: React.ReactNode[] = [];

  if (kind === "column" || kind === "histogram") {
    const max = Math.max(...vals, 0);
    const { yOf, lines } = axis(Math.min(0, ...vals), max, left, top, H - bottomLabel);
    out.push(...lines);
    const n = vals.length;
    const plotW = W - left - 10 * u;
    const gap = kind === "histogram" ? 4 * u : (plotW / n) * 0.3;
    const bw = (plotW - gap * (n - 1)) / n;
    vals.forEach((v, i) => {
      const p = sp(i, kind === "histogram" ? 3 : 6);
      const x = left + 10 * u + i * (bw + gap);
      const y = yOf(v * p);
      const base = yOf(0);
      const hi = v === max;
      out.push(<rect key={`b${i}`} x={x} y={Math.min(y, base)} width={bw} height={Math.max(1, Math.abs(base - y))} rx={Math.min(8 * u, bw / 4)} fill={kind === "histogram" || hi ? accent : second} />);
      out.push(<g key={`t${i}`} opacity={p}>{text(x + bw / 2, Math.min(y, base) - 14 * u, formatValue(Math.round(v * p * 10) / 10, unit), { weight: 800 })}</g>);
      out.push(<g key={`l${i}`} opacity={interpolate(f, [10, 24], [0, 1], cl)}>{text(x + bw / 2, H - bottomLabel + 40 * u, data[i].label, { size: fs * 0.82, fill: muted })}</g>);
    });
  } else if (kind === "waterfall") {
    // A trailing item with value 0 names the total bar (e.g. "Enrolled").
    const totalNamed = data.length > 1 && vals[vals.length - 1] === 0;
    const steps = waterfallSteps(totalNamed ? vals.slice(0, -1) : vals, true);
    const all = steps.flatMap((s) => [s.from, s.to]);
    const { yOf, lines } = axis(Math.min(0, ...all), Math.max(0, ...all), left, top, H - bottomLabel);
    out.push(...lines);
    const n = steps.length;
    const plotW = W - left - 10 * u;
    const gap = (plotW / n) * 0.3;
    const bw = (plotW - gap * (n - 1)) / n;
    steps.forEach((s, i) => {
      const p = sp(i, 9);
      const x = left + 10 * u + i * (bw + gap);
      const cur = s.from + (s.to - s.from) * p;
      const y1 = yOf(Math.max(s.from, cur));
      const y2 = yOf(Math.min(s.from, cur));
      const fill = s.kind === "up" ? accent : s.kind === "down" ? "#E8684A" : ink;
      out.push(<rect key={`w${i}`} x={x} y={y1} width={bw} height={Math.max(1, y2 - y1)} rx={6 * u} fill={fill} opacity={s.kind === "total" || s.kind === "start" ? 0.9 : 1} />);
      if (i < n - 1) out.push(<line key={`c${i}`} x1={x + bw} x2={x + bw + gap} y1={yOf(s.to)} y2={yOf(s.to)} stroke={ink} strokeWidth={2 * u} strokeDasharray={`${4 * u} ${5 * u}`} opacity={0.45 * sp(i + 1, 9)} />);
      const d = s.to - s.from;
      const label = s.kind === "up" ? `+${formatValue(d, unit)}` : s.kind === "down" ? `−${formatValue(-d, unit)}` : formatValue(s.to, unit);
      out.push(<g key={`t${i}`} opacity={p}>{text(x + bw / 2, y1 - 14 * u, label, { weight: 800 })}</g>);
      out.push(<g key={`l${i}`} opacity={interpolate(f, [10, 24], [0, 1], cl)}>{text(x + bw / 2, H - bottomLabel + 40 * u, s.kind === "total" ? (totalNamed ? data[data.length - 1].label : "Total") : data[i]?.label ?? "", { size: fs * 0.82, fill: muted })}</g>);
    });
  } else if (kind === "bar") {
    const max = Math.max(...vals, 1);
    const n = vals.length;
    const rowH = H / n;
    const labelW = W * 0.3;
    const valueW = 120 * u;
    const plotW = W - labelW - valueW;
    vals.forEach((v, i) => {
      const p = sp(i, 6);
      const y = i * rowH + rowH * 0.2;
      const bh = rowH * 0.6;
      out.push(<g key={`r${i}`}>
        {text(labelW - 20 * u, y + bh / 2 + fs * 0.34, data[i].label, { anchor: "end", weight: 700, opacity: interpolate(f - i * 6, [0, 12], [0, 1], cl) })}
        <rect x={labelW} y={y} width={plotW} height={bh} rx={bh / 2} fill={grid} />
        <rect x={labelW} y={y} width={Math.max(bh, (v / max) * plotW * p)} height={bh} rx={bh / 2} fill={v === max ? accent : second} />
        {text(labelW + Math.max(bh, (v / max) * plotW * p) + 16 * u, y + bh / 2 + fs * 0.34, formatValue(Math.round(v * p * 10) / 10, unit), { anchor: "start", weight: 800, opacity: p })}
      </g>);
    });
  } else if (kind === "line") {
    const { yOf, lines } = axis(Math.min(0, ...vals), Math.max(...vals, 0), left, top, H - bottomLabel);
    out.push(...lines);
    const n = vals.length;
    const x0 = left + 24 * u;
    const step = n > 1 ? (W - x0 - 24 * u) / (n - 1) : 0;
    const pts = vals.map((v, i) => [x0 + i * step, yOf(v)] as const);
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join("");
    const draw = interpolate(f, [6, 6 + n * 7], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
    const len = pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0);
    out.push(<path key="area" d={`${d}L${pts[n - 1][0]},${yOf(0)}L${pts[0][0]},${yOf(0)}Z`} fill={accent} opacity={0.12 * draw} />);
    out.push(<path key="line" d={d} fill="none" stroke={accent} strokeWidth={6 * u} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={len} strokeDashoffset={len * (1 - draw)} />);
    const maxI = vals.indexOf(Math.max(...vals));
    pts.forEach(([x, y], i) => {
      const shown = draw * (n - 1) >= i - 0.01 ? 1 : 0;
      const p = shown * sp(0, 0);
      const hi = i === maxI || i === n - 1;
      out.push(<circle key={`p${i}`} cx={x} cy={y} r={(hi ? 12 : 8) * u * p} fill={accent} stroke={light ? "#FFFFFF" : "#071C24"} strokeWidth={3 * u} />);
      if (hi || n <= 7) out.push(<g key={`t${i}`} opacity={shown}>{text(x, y - 26 * u, formatValue(vals[i], unit), { weight: 800, size: fs * (hi ? 1.05 : 0.85) })}</g>);
      out.push(<g key={`l${i}`} opacity={interpolate(f, [10, 24], [0, 1], cl)}>{text(x, H - bottomLabel + 40 * u, data[i].label, { size: fs * 0.82, fill: muted })}</g>);
    });
  } else if (kind === "scatter") {
    const xs = data.map((d, i) => (Number.isFinite(Number(d.x)) && d.x !== undefined ? Number(d.x) : i));
    const bottom = H - bottomLabel - 20 * u;
    const { yOf, lines } = axis(Math.min(0, ...vals), Math.max(...vals, 0), left, top, bottom);
    out.push(...lines);
    const xScale = niceScale(Math.max(...xs));
    const xOf = (x: number) => left + 20 * u + (x / xScale.max) * (W - left - 40 * u);
    for (let x = 0; x <= xScale.max + 1e-9; x += xScale.step) out.push(<g key={`xt${x}`} opacity={interpolate(f, [0, 18], [0, 1], cl)}>{text(xOf(x), bottom + 36 * u, formatValue(x), { size: fs * 0.78, weight: 500, fill: muted })}</g>);
    if (vals.length >= 3) {
      const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
      const my = vals.reduce((a, b) => a + b, 0) / vals.length;
      const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1;
      const slope = xs.reduce((a, x, i) => a + (x - mx) * (vals[i] - my), 0) / sxx;
      const xa = Math.min(...xs), xb = Math.max(...xs);
      const t = interpolate(f, [vals.length * 2 + 10, vals.length * 2 + 40], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
      const xe = xa + (xb - xa) * t;
      out.push(<line key="trend" x1={xOf(xa)} y1={yOf(my + slope * (xa - mx))} x2={xOf(xe)} y2={yOf(my + slope * (xe - mx))} stroke={ink} strokeWidth={3 * u} strokeDasharray={`${10 * u} ${8 * u}`} opacity={0.55} />);
    }
    vals.forEach((v, i) => {
      const p = spring({ frame: f - 8 - i * 2, fps, config: { damping: 11, stiffness: 160 } });
      out.push(<circle key={`s${i}`} cx={xOf(xs[i])} cy={yOf(v)} r={13 * u * p} fill={accent} opacity={0.85} stroke={light ? "#FFFFFF" : "#071C24"} strokeWidth={3 * u} />);
    });
    if (xTitle) out.push(<g key="xT">{text(left + (W - left) / 2, H - 6 * u, xTitle, { size: fs * 0.85, weight: 800, fill: muted })}</g>);
    if (yTitle) out.push(<g key="yT">{text(left + 20 * u, top - 18 * u, yTitle, { anchor: "start", size: fs * 0.85, weight: 800, fill: muted })}</g>);
  } else if (kind === "map") {
    const geo = MAPS[map];
    const legendH = 70 * u;
    const s = Math.min(W / geo.width, (H - legendH) / geo.height);
    const ox = (W - geo.width * s) / 2;
    const byId = new Map<string, { v: number; rank: number }>();
    data.map((d, i) => ({ r: findRegion(map, d.label), v: vals[i] })).filter((x) => x.r).sort((a, b) => b.v - a.v).forEach((x, rank) => byId.set(x.r!.id, { v: x.v, rank }));
    const max = Math.max(1, ...[...byId.values()].map((x) => x.v));
    const base = light ? "#E3EBEE" : "#16323B";
    out.push(
      <g key="map" transform={`translate(${ox},0) scale(${s})`}>
        {geo.regions.map((r) => {
          const hit = byId.get(r.id);
          const p = hit ? sp(hit.rank, 7) : 0;
          return <path key={r.id} d={r.d} fill={hit ? rampColor(accent, base, (hit.v / max) * p) : base} stroke={light ? "#FFFFFF" : "#071C24"} strokeWidth={1.4 * u} vectorEffect="non-scaling-stroke" />;
        })}
      </g>,
    );
    // Tag the largest regions; skip any tag that would collide with one already placed.
    const placed: Array<[number, number, number, number]> = [];
    [...byId.entries()].sort((a, b) => a[1].rank - b[1].rank).filter(([, x]) => x.rank < 8).forEach(([id, x]) => {
      const r = geo.regions.find((g) => g.id === id)!;
      const p = sp(x.rank + 2, 7);
      const label = `${r.name} · ${formatValue(Math.round(x.v * p), unit)}`;
      const full = `${r.name} · ${formatValue(x.v, unit)}`;
      const tw = full.length * fs * 0.5 + 30 * u;
      const cx = Math.min(W - tw / 2, Math.max(tw / 2, ox + r.cx * s));
      const cy = r.cy * s;
      const box: [number, number, number, number] = [cx - tw / 2, cy - 34 * u - fs, tw, fs * 1.6];
      if (placed.some(([px, py, pw, ph]) => box[0] < px + pw + 6 * u && box[0] + tw + 6 * u > px && box[1] < py + ph + 6 * u && box[1] + box[3] + 6 * u > py)) return;
      placed.push(box);
      out.push(<g key={`tag${id}`} opacity={p} transform={`translate(${cx},${cy - 34 * u * p})`}>
        <circle cx={0} cy={34 * u} r={7 * u} fill={light ? "#071C24" : "#FFFFFF"} />
        <rect x={-tw / 2} y={-fs * 0.95} width={tw} height={fs * 1.6} rx={fs * 0.8} fill="#071C24" opacity={0.9} />
        <text x={0} y={fs * 0.28} textAnchor="middle" fontFamily={ff} fontSize={fs * 0.8} fontWeight={800} fill="#FFFFFF">{label}</text>
      </g>);
    });
    const lw = Math.min(W * 0.5, 420 * u);
    const ly = Math.min(H - 26 * u, geo.height * s + 64 * u);
    [0, 0.25, 0.5, 0.75, 1].forEach((t, i) => out.push(<rect key={`lg${i}`} x={i * (lw / 5)} y={ly} width={lw / 5 - 4 * u} height={14 * u} rx={3 * u} fill={rampColor(accent, base, t)} opacity={interpolate(f, [20, 34], [0, 1], cl)} />));
    out.push(<g key="lgt" opacity={interpolate(f, [20, 34], [0, 1], cl)}>{text(0, ly - 14 * u, "Fewer", { anchor: "start", size: fs * 0.72, fill: muted })}{text(lw, ly - 14 * u, `More (${formatValue(max, unit)})`, { anchor: "end", size: fs * 0.72, fill: muted })}</g>);
  } else {
    // pie / donut with a legend
    const total = vals.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const side = W > H * 1.2;
    const d = side ? Math.min(H, W * 0.5) : Math.min(W, H - 60 * u * Math.min(vals.length, 6) - 30 * u);
    const r = d / 2;
    const cx = side ? r : W / 2;
    const cy = r;
    const sweep = interpolate(f, [0, 34], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
    let acc = 0;
    const inner = kind === "donut" ? r * 0.6 : 0;
    const gap = vals.length > 1 ? 0.012 : 0;
    vals.forEach((v, i) => {
      const share = Math.max(0, v) / total;
      const a0 = acc * Math.PI * 2 * sweep - Math.PI / 2 + gap;
      const a1 = (acc + share) * Math.PI * 2 * sweep - Math.PI / 2 - gap;
      acc += share;
      if (a1 <= a0) return;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const P = (rad: number, a: number) => `${cx + Math.cos(a) * rad},${cy + Math.sin(a) * rad}`;
      const path = inner
        ? `M${P(r, a0)}A${r},${r} 0 ${large} 1 ${P(r, a1)}L${P(inner, a1)}A${inner},${inner} 0 ${large} 0 ${P(inner, a0)}Z`
        : `M${cx},${cy}L${P(r, a0)}A${r},${r} 0 ${large} 1 ${P(r, a1)}Z`;
      const fill = cat[i % cat.length];
      out.push(<path key={`a${i}`} d={path} fill={fill} />);
      const mid = (a0 + a1) / 2;
      if (share >= 0.07) {
        const lr = inner ? (r + inner) / 2 : r * 0.62;
        out.push(<g key={`pv${i}`} opacity={interpolate(f, [30, 42], [0, 1], cl)}>{text(cx + Math.cos(mid) * lr, cy + Math.sin(mid) * lr + fs * 0.35, `${Math.round(share * 100)}%`, { weight: 900, size: fs * 1.05, fill: isLightColor(fill) ? "#071C24" : "#FFFFFF" })}</g>);
      }
    });
    if (kind === "donut") {
      out.push(<g key="ct" opacity={interpolate(f, [26, 40], [0, 1], cl)}>{text(cx, cy + fs * 0.6, formatValue(Math.round(total), unit === "%" ? "" : unit), { size: fs * 2.2, weight: 900 })}{text(cx, cy + fs * 1.9, "total", { size: fs * 0.8, fill: muted })}</g>);
    }
    const lx = side ? d + 60 * u : 0;
    const rowH = 60 * u;
    const ly = side ? cy - (Math.min(vals.length, 6) * rowH) / 2 + rowH * 0.6 : d + 70 * u;
    vals.slice(0, 6).forEach((v, i) => {
      const p = sp(i + 6, 4);
      const y = ly + i * rowH;
      const legendW = side ? W - lx : W;
      out.push(<g key={`lg${i}`} opacity={p} transform={`translate(${(1 - p) * 30 * u},0)`}>
        <rect x={lx} y={y - fs * 0.8} width={fs * 0.9} height={fs * 0.9} rx={fs * 0.22} fill={cat[i % cat.length]} />
        {text(lx + fs * 1.5, y, data[i].label, { anchor: "start", weight: 700 })}
        {text(lx + legendW, y, unit === "%" ? formatValue(v, "%") : `${formatValue(v, unit)}  ·  ${Math.round((Math.max(0, v) / total) * 100)}%`, { anchor: "end", weight: 800 })}
      </g>);
    });
  }

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", display: "block" }}>
      {out}
    </svg>
  );
}

/** QR code that assembles row by row, with a scan line sweep. */
export function QrCode({ value, size, fg = "#071C24", bg = "#FFFFFF", delay = 0, u }: { value: string; size: number; fg?: string; bg?: string; delay?: number; u: number }) {
  const frame = useCurrentFrame();
  const clipId = `qr${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const m = qrMatrix(value);
  const f = frame - delay;
  if (!m) {
    return (
      <div style={{ width: size, height: size, borderRadius: 24 * u, border: `${4 * u}px dashed ${fg}`, background: bg, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: size / 10, color: fg }}>
        Add your<br />form link
      </div>
    );
  }
  const margin = 2;
  const total = m.size + margin * 2;
  const reveal = interpolate(f, [0, 26], [0, total], { ...cl, easing: Easing.out(Easing.cubic) });
  // Two scan sweeps, then the code is left clean so phones can read it from the screen.
  const scanning = f > 30 && f < 30 + 2 * 50;
  const scan = interpolate((f - 30) % 50, [0, 50], [0, 1], cl);
  return (
    <div style={{ position: "relative", width: size, height: size, borderRadius: 22 * u, overflow: "hidden", background: bg }}>
      <svg width={size} height={size} viewBox={`0 0 ${total} ${total}`} shapeRendering="crispEdges" style={{ display: "block" }}>
        <defs>
          <clipPath id={clipId}><rect x={0} y={0} width={total} height={reveal} /></clipPath>
        </defs>
        <path d={qrPath(m)} transform={`translate(${margin},${margin})`} fill={fg} clipPath={`url(#${clipId})`} />
      </svg>
      {scanning && <div style={{ position: "absolute", left: 0, right: 0, top: `${scan * 100}%`, height: 4 * u, background: "#0097B2", boxShadow: `0 0 ${24 * u}px ${6 * u}px rgba(0,151,178,0.45)`, opacity: 0.85 }} />}
    </div>
  );
}

"use client";

import { Arc, Ellipse, Group, Line, Path, Rect, Text } from "react-konva";
import type { ReactNode } from "react";
import type { ChartElement, QrElement } from "@/lib/design/types";
import { resolveColor } from "@/lib/design/types";
import { CHART_COLORS, formatValue, isLightColor, niceScale, rampColor, waterfallSteps } from "@/lib/charts";
import { findRegion, MAPS } from "@/lib/geo/match";
import { qrMatrix, qrPath } from "@/lib/qr";

/**
 * Chart marks for the design canvas (editor, thumbnails and PNG/JPEG export share this).
 * Conventions: thin marks, rounded data-ends, faint gridlines, text in the label
 * colour (never the series colour), direct labels instead of legends where possible.
 */
export function ChartMarks({ el, palette }: { el: ChartElement; palette: Record<string, string> }) {
  const color = resolveColor(el.color, palette);
  const color2 = resolveColor(el.secondaryColor, palette);
  const ink = resolveColor(el.labelColor, palette);
  const w = el.width;
  const ht = el.height;
  const fs = Math.max(12, Math.min(w, ht) / 16);
  const font = el.fontFamily;
  const unit = el.unit ?? "";
  const vals = el.values.length ? el.values : [0];
  const parts: ReactNode[] = [<Rect key="hit" width={w} height={ht} fill="rgba(0,0,0,0)" />];
  const T = (key: string, text: string, x: number, y: number, o: { width?: number; align?: "left" | "center" | "right"; size?: number; weight?: string; opacity?: number; fill?: string; height?: number; vAlign?: "top" | "middle" | "bottom" } = {}) =>
    parts.push(<Text key={key} x={x} y={y} width={o.width} height={o.height} verticalAlign={o.vAlign} align={o.align ?? "left"} text={text} fontSize={o.size ?? fs} fontFamily={font} fontStyle={o.weight ?? "400"} fill={o.fill ?? ink} opacity={o.opacity ?? 1} wrap="none" ellipsis />);

  /** Shrink a category label so it fits its slot instead of being truncated. */
  const fit = (label: string, width: number, base = fs * 0.82) => Math.max(fs * 0.5, Math.min(base, width / (Math.max(1, label.length) * 0.64)));

  // ── shared value axis for column / histogram / waterfall / line ──
  const valueAxis = (lo: number, hi: number, x0: number, top: number, bottom: number) => {
    const { max, step } = niceScale(Math.max(Math.abs(hi), Math.abs(lo)));
    const min = lo < 0 ? -Math.ceil(-lo / step) * step : 0;
    const top2 = Math.max(hi, 0) > 0 ? Math.ceil(hi / step) * step : step;
    const yOf = (v: number) => bottom - ((v - min) / (top2 - min)) * (bottom - top);
    if (el.showGrid) {
      for (let v = min; v <= top2 + 1e-9; v += step) {
        const y = yOf(v);
        parts.push(<Line key={`g${v}`} points={[x0, y, w, y]} stroke={ink} strokeWidth={v === 0 ? 1.5 : 1} opacity={v === 0 ? 0.35 : 0.12} />);
        T(`gt${v}`, formatValue(v, unit), 0, y - fs * 0.45, { width: x0 - fs * 0.5, align: "right", size: fs * 0.75, opacity: 0.6 });
      }
    }
    void max;
    return yOf;
  };
  const gutter = el.showGrid ? fs * 3 : 0;
  const labelSpace = el.showLabels ? fs * 1.9 : 0;
  const valueSpace = el.showValues ? fs * 1.7 : fs * 0.4;

  if (el.chart === "bar" || el.chart === "histogram") {
    const n = vals.length;
    const plotW = w - gutter;
    const gap = el.chart === "histogram" ? 3 : (plotW / n) * 0.28;
    const bw = (plotW - gap * (n - 1)) / n;
    const max = Math.max(...vals, 0);
    const yOf = valueAxis(Math.min(0, ...vals), max, gutter, valueSpace, ht - labelSpace);
    const base = yOf(0);
    vals.forEach((v, i) => {
      const x = gutter + i * (bw + gap);
      const y = yOf(v);
      const top = Math.min(y, base);
      const bh = Math.max(2, Math.abs(base - y));
      const r = Math.min(4, bw / 4);
      const fill = el.chart === "histogram" ? color : v === max ? color : color2;
      parts.push(<Rect key={`b${i}`} x={x} y={top} width={bw} height={bh} fill={fill} cornerRadius={el.chart === "histogram" ? [2, 2, 0, 0] : v >= 0 ? [r, r, 0, 0] : [0, 0, r, r]} />);
      if (el.showValues) T(`v${i}`, formatValue(v, unit), x - gap / 2, top - fs * 1.35, { width: bw + gap, align: "center", weight: "700" });
      if (el.showLabels) T(`l${i}`, el.labels[i] ?? "", x - gap / 2, ht - labelSpace + fs * 0.5, { width: bw + gap, align: "center", size: fit(el.labels[i] ?? "", bw + gap), opacity: 0.75 });
    });
  } else if (el.chart === "waterfall") {
    const steps = waterfallSteps(vals, el.showTotal !== false);
    const all = steps.flatMap((s) => [s.from, s.to]);
    const n = steps.length;
    const plotW = w - gutter;
    const gap = (plotW / n) * 0.3;
    const bw = (plotW - gap * (n - 1)) / n;
    const yOf = valueAxis(Math.min(0, ...all), Math.max(0, ...all), gutter, valueSpace, ht - labelSpace);
    steps.forEach((s, i) => {
      const x = gutter + i * (bw + gap);
      const y1 = yOf(Math.max(s.from, s.to));
      const y2 = yOf(Math.min(s.from, s.to));
      const fill = s.kind === "up" ? color : s.kind === "down" ? color2 : ink;
      parts.push(<Rect key={`w${i}`} x={x} y={y1} width={bw} height={Math.max(2, y2 - y1)} fill={fill} cornerRadius={3} opacity={s.kind === "total" || s.kind === "start" ? 0.9 : 1} />);
      if (i < n - 1) {
        const ly = yOf(s.to);
        parts.push(<Line key={`c${i}`} points={[x + bw, ly, x + bw + gap, ly]} stroke={ink} strokeWidth={1.5} dash={[3, 4]} opacity={0.45} />);
      }
      const delta = s.kind === "up" || s.kind === "down" ? s.to - s.from : s.to;
      const txt = s.kind === "up" ? `+${formatValue(delta, unit)}` : s.kind === "down" ? `−${formatValue(Math.abs(delta), unit)}` : formatValue(delta, unit);
      if (el.showValues) T(`v${i}`, txt, x - gap / 2, y1 - fs * 1.35, { width: bw + gap, align: "center", weight: "700" });
      const lab = s.kind === "total" ? el.labels[i] ?? "Total" : el.labels[i] ?? "";
      if (el.showLabels) T(`l${i}`, lab, x - gap / 2, ht - labelSpace + fs * 0.5, { width: bw + gap, align: "center", size: fit(lab, bw + gap), opacity: 0.75 });
    });
  } else if (el.chart === "hbar") {
    const n = vals.length;
    const rowH = ht / n;
    const labelW = el.showLabels ? w * 0.3 : 0;
    const valueW = el.showValues ? fs * 3.4 : 0;
    const plotW = w - labelW - valueW;
    const max = Math.max(...vals, 1);
    vals.forEach((v, i) => {
      const y = i * rowH + rowH * 0.18;
      const bh = rowH * 0.64;
      const bw = Math.max(2, (v / max) * plotW);
      if (el.showLabels) T(`l${i}`, el.labels[i] ?? "", 0, y, { height: bh, vAlign: "middle", width: labelW - fs * 0.6, weight: "600", size: fit(el.labels[i] ?? "", labelW - fs * 0.6, fs) });
      parts.push(<Rect key={`tr${i}`} x={labelW} y={y} width={plotW} height={bh} fill={color2} opacity={0.35} cornerRadius={bh / 2} />);
      parts.push(<Rect key={`b${i}`} x={labelW} y={y} width={bw} height={bh} fill={color} cornerRadius={bh / 2} />);
      if (el.showValues) T(`v${i}`, formatValue(v, unit), labelW + plotW + fs * 0.5, y, { height: bh, vAlign: "middle", weight: "700" });
    });
  } else if (el.chart === "line") {
    const n = vals.length;
    const yOf = valueAxis(Math.min(0, ...vals), Math.max(...vals, 0), gutter, valueSpace, ht - labelSpace);
    const plotW = w - gutter - fs;
    const step = n > 1 ? plotW / (n - 1) : 0;
    const pts: number[] = [];
    vals.forEach((v, i) => pts.push(gutter + fs / 2 + i * step, yOf(v)));
    const base = yOf(0);
    parts.push(<Line key="area" points={[pts[0], base, ...pts, pts[pts.length - 2], base]} closed fill={color} opacity={0.1} />);
    parts.push(<Line key="line" points={pts} stroke={color} strokeWidth={Math.max(3, fs / 5)} lineJoin="round" lineCap="round" tension={0.2} />);
    const maxI = vals.indexOf(Math.max(...vals));
    vals.forEach((v, i) => {
      const x = pts[i * 2];
      const y = pts[i * 2 + 1];
      const hi = i === maxI || i === n - 1;
      parts.push(<Ellipse key={`p${i}`} x={x} y={y} radiusX={hi ? fs * 0.42 : fs * 0.28} radiusY={hi ? fs * 0.42 : fs * 0.28} fill={color} stroke={color2} strokeWidth={0} />);
      if (el.showValues && (hi || n <= 7)) T(`v${i}`, formatValue(v, unit), x - fs * 3, y - fs * 1.7, { width: fs * 6, align: "center", size: fs * 0.9, weight: "700" });
      if (el.showLabels) T(`l${i}`, el.labels[i] ?? "", x - fs * 4, ht - labelSpace + fs * 0.5, { width: fs * 8, align: "center", size: fs * 0.82, opacity: 0.75 });
    });
  } else if (el.chart === "scatter") {
    const xs = vals.map((_, i) => el.xValues?.[i] ?? i);
    const xMin = Math.min(...xs);
    const xs2 = niceScale(Math.max(...xs) - Math.min(0, xMin));
    const left = gutter + fs * 0.5;
    const bottom = ht - (el.showLabels ? fs * 3.2 : fs);
    const yOf = valueAxis(Math.min(0, ...vals), Math.max(...vals, 0), gutter, fs, bottom);
    const xLo = xMin < 0 ? xMin : 0;
    const xOf = (x: number) => left + ((x - xLo) / (xs2.max - xLo)) * (w - left - fs);
    if (el.showGrid) {
      for (let x = xLo; x <= xs2.max + 1e-9; x += xs2.step) T(`xt${x}`, formatValue(x), xOf(x) - fs * 2, bottom + fs * 0.4, { width: fs * 4, align: "center", size: fs * 0.75, opacity: 0.6 });
    }
    // Least-squares trend line (descriptive only — not a causal claim).
    if (vals.length >= 3) {
      const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
      const my = vals.reduce((a, b) => a + b, 0) / vals.length;
      const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1;
      const slope = xs.reduce((a, x, i) => a + (x - mx) * (vals[i] - my), 0) / sxx;
      const x1 = Math.min(...xs), x2 = Math.max(...xs);
      parts.push(<Line key="trend" points={[xOf(x1), yOf(my + slope * (x1 - mx)), xOf(x2), yOf(my + slope * (x2 - mx))]} stroke={ink} strokeWidth={2} dash={[8, 6]} opacity={0.5} />);
    }
    vals.forEach((v, i) => parts.push(<Ellipse key={`s${i}`} x={xOf(xs[i])} y={yOf(v)} radiusX={fs * 0.36} radiusY={fs * 0.36} fill={color} opacity={0.82} stroke={color2} strokeWidth={1.5} />));
    if (el.showLabels) {
      T("xa", el.labels[0] ?? "", left, ht - fs * 1.4, { width: w - left, align: "center", size: fs * 0.85, weight: "700", opacity: 0.8 });
      if (el.labels[1]) T("ya", el.labels[1], left + fs * 0.3, 0, { width: w - left, size: fs * 0.85, weight: "700", opacity: 0.8 });
    }
  } else if (el.chart === "map") {
    const geo = MAPS[el.map ?? "nigeria"];
    const s = Math.min(w / geo.width, (ht - (el.showLabels ? fs * 2.6 : 0)) / geo.height);
    const ox = (w - geo.width * s) / 2;
    const byId = new Map<string, number>();
    el.labels.forEach((l, i) => {
      const r = findRegion(el.map ?? "nigeria", l);
      if (r && Number.isFinite(vals[i])) byId.set(r.id, vals[i]);
    });
    const max = Math.max(1, ...byId.values());
    const regions = geo.regions.map((r) => {
      const v = byId.get(r.id);
      return <Path key={r.id} data={r.d} fill={v === undefined ? color2 : rampColor(color, color2, v / max)} opacity={v === undefined ? 0.55 : 1} />;
    });
    parts.push(
      <Group key="map" x={ox} y={0} scaleX={s} scaleY={s}>
        {regions}
        {geo.regions.map((r) => <Path key={`o${r.id}`} data={r.d} stroke={ink} strokeWidth={1} strokeScaleEnabled={false} opacity={0.28} />)}
      </Group>,
    );
    if (el.showValues) {
      // Label the largest regions; skip a tag that would collide with one already placed.
      const tfs = Math.max(11, fs * 0.62);
      const placed: Array<[number, number, number, number]> = [];
      [...byId.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).forEach(([id, v], i) => {
        const r = geo.regions.find((g) => g.id === id)!;
        const text = `${r.name}  ${formatValue(v, unit)}`;
        const tw = text.length * tfs * 0.56 + tfs * 1.4;
        const th = tfs * 1.8;
        const x = Math.min(w - tw, Math.max(0, ox + r.cx * s - tw / 2));
        const y = r.cy * s - th / 2;
        if (placed.some(([px, py, pw, ph]) => x < px + pw + 4 && x + tw + 4 > px && y < py + ph + 4 && y + th + 4 > py)) return;
        placed.push([x, y, tw, th]);
        parts.push(<Ellipse key={`tagdot${i}`} x={ox + r.cx * s} y={r.cy * s} radiusX={tfs * 0.3} radiusY={tfs * 0.3} fill="#071C24" />);
        parts.push(<Rect key={`tagbg${i}`} x={x} y={y} width={tw} height={th} fill="#071C24" opacity={0.88} cornerRadius={th / 2} />);
        parts.push(<Text key={`tag${i}`} x={x} y={y} width={tw} height={th} align="center" verticalAlign="middle" text={text} fontSize={tfs} fontFamily={font} fontStyle="700" fill="#FFFFFF" />);
      });
    }
    if (el.showLabels) {
      const lw = Math.min(w * 0.5, fs * 14);
      const y = ht - fs * 1.4;
      [0, 0.25, 0.5, 0.75, 1].forEach((t, i) => parts.push(<Rect key={`lg${i}`} x={i * (lw / 5)} y={y} width={lw / 5 - 2} height={fs * 0.55} fill={rampColor(color, color2, t)} cornerRadius={2} />));
      T("lgmin", "Fewer", 0, y - fs * 1.15, { size: fs * 0.75, opacity: 0.7 });
      T("lgmax", `More (${formatValue(max, unit)})`, 0, y - fs * 1.15, { width: lw, align: "right", size: fs * 0.75, opacity: 0.7 });
    }
  } else {
    // pie / donut
    const total = vals.reduce((a, b) => a + Math.max(0, b), 0) || 1;
    const legend = (el.chart === "pie" || Boolean(el.colors?.length)) && el.showLabels;
    const side = legend && w > ht * 1.25;
    const d = legend ? (side ? Math.min(ht, w * 0.45) : Math.min(w, ht - fs * 2.2 * Math.min(vals.length, 6))) : Math.min(w, ht);
    const r = d / 2;
    const cx = legend && side ? r : w / 2;
    const cy = legend && !side ? r : ht / 2;
    const shades = el.colors?.length ? el.colors.map((c) => resolveColor(c, palette)) : el.chart === "pie" ? CHART_COLORS[isLightColor(ink) ? "dark" : "light"] : [color, color2, ink];
    const multi = el.chart === "pie" || Boolean(el.colors?.length);
    const gapDeg = vals.length > 1 ? 1.4 : 0;
    let start = -90;
    vals.forEach((v, i) => {
      const angle = (Math.max(0, v) / total) * 360;
      const fill = shades[i % shades.length];
      parts.push(<Arc key={`a${i}`} x={cx} y={cy} innerRadius={el.chart === "pie" ? 0 : r * 0.62} outerRadius={r} angle={Math.max(0.1, angle - gapDeg)} rotation={start + gapDeg / 2} fill={fill} opacity={!multi && i >= 3 ? 0.6 : 1} />);
      if (el.chart === "pie" && el.showValues && angle >= 22) {
        const mid = ((start + angle / 2) * Math.PI) / 180;
        const pct = Math.round((Math.max(0, v) / total) * 100);
        parts.push(<Text key={`pv${i}`} x={cx + Math.cos(mid) * r * 0.62 - fs * 2} y={cy + Math.sin(mid) * r * 0.62 - fs * 0.6} width={fs * 4} align="center" text={`${pct}%`} fontSize={fs * 1.05} fontFamily={font} fontStyle="800" fill={isLightColor(fill) ? "#071C24" : "#FFFFFF"} />);
      }
      start += angle;
    });
    if (el.chart === "donut" && el.showValues) {
      const pct = Math.round((Math.max(0, vals[0]) / total) * 100);
      parts.push(<Text key="center" x={cx - r} y={cy - r * 0.22} width={r * 2} align="center" text={`${pct}%`} fontSize={r * 0.4} fontFamily={font} fontStyle="800" fill={ink} />);
    }
    if (legend && el.showLabels) {
      const rowH = fs * 2;
      const lx = side ? d + fs * 1.6 : 0;
      const ly = side ? cy - (Math.min(vals.length, 8) * rowH) / 2 : d + fs * 0.8;
      const lwid = w - lx - fs * 1.5 - fs * 3.4;
      // One size for every legend label (the longest decides), so rows stay consistent.
      const legendSize = Math.min(...el.labels.slice(0, 8).map((l) => fit(l, lwid, fs * 0.95)));
      vals.slice(0, 8).forEach((v, i) => {
        const y = ly + i * rowH;
        parts.push(<Rect key={`lk${i}`} x={lx} y={y + fs * 0.2} width={fs * 0.9} height={fs * 0.9} cornerRadius={fs * 0.2} fill={shades[i % shades.length]} />);
        T(`ll${i}`, el.labels[i] ?? "", lx + fs * 1.5, y, { width: lwid, size: legendSize, weight: "600" });
        T(`lv${i}`, `${Math.round((Math.max(0, v) / total) * 100)}%`, lx, y, { width: w - lx, align: "right", size: fs * 0.95, weight: "800" });
      });
    } else if (!legend && el.showLabels && el.labels[0]) {
      T("lab", el.labels[0], cx - r, cy + r * 0.2, { width: r * 2, align: "center", size: r * 0.12, opacity: 0.7 });
    }
  }
  return <>{parts}</>;
}

/** Vector QR code; an empty value shows an "add your link" placeholder (never exported as a fake code). */
export function QrMarks({ el, palette }: { el: QrElement; palette: Record<string, string> }) {
  const fg = resolveColor(el.fg, palette);
  const bg = resolveColor(el.bg, palette);
  const m = qrMatrix(el.value);
  const size = Math.min(el.width, el.height);
  if (!m) {
    return (
      <>
        <Rect width={size} height={size} fill={bg} stroke={fg} strokeWidth={2} dash={[8, 6]} cornerRadius={8} />
        <Text width={size} height={size} align="center" verticalAlign="middle" text={"Add your\nform link"} fontSize={size / 9} fontFamily="Nunito Sans" fontStyle="800" fill={fg} />
      </>
    );
  }
  const total = m.size + el.margin * 2;
  const s = size / total;
  return (
    <>
      <Rect width={size} height={size} fill={bg} />
      <Path data={qrPath(m)} x={el.margin * s} y={el.margin * s} scaleX={s} scaleY={s} fill={fg} />
    </>
  );
}

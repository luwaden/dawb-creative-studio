import type { ReactElement } from "react";
import { Audio } from "@remotion/media";
import type { CSSProperties } from "react";
import { AbsoluteFill, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/** Sound effects shipped in /public/audio (synthesised by scripts/synth-audio.mjs). */
export type SfxName = "whoosh" | "impact" | "click" | "shimmer" | "riser" | "pop" | "chime" | "glitch";

export function Sfx({ name, at, volume = 0.8 }: { name: SfxName; at: number; volume?: number }) {
  return (
    <Sequence from={Math.max(0, Math.round(at))} layout="none" name={`sfx:${name}`}>
      <Audio src={staticFile(`audio/${name}.mp3`)} volume={volume} />
    </Sequence>
  );
}

/** Animated film grain (SVG turbulence, re-seeded every 2 frames). */
export function Grain({ opacity = 0.18, dark = true }: { opacity?: number; dark?: boolean }) {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2) % 12;
  const id = `grain-${seed}`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity, mixBlendMode: dark ? "screen" : "multiply" }}>
      <svg width="100%" height="100%">
        <filter id={id}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
}

export function DotGrid({ color, spacing = 40, size = 1.6, opacity = 0.18, drift = 0 }: { color: string; spacing?: number; size?: number; opacity?: number; drift?: number }) {
  const frame = useCurrentFrame();
  const off = (frame * drift) % spacing;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id={`dg-${spacing}-${size}`} width={spacing} height={spacing} patternUnits="userSpaceOnUse" patternTransform={`translate(${off} ${off})`}>
            <circle cx={spacing / 2} cy={spacing / 2} r={size} fill={color} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dg-${spacing}-${size})`} />
      </svg>
    </AbsoluteFill>
  );
}

/** Halftone field: dot size grows towards a focal point. */
export function Halftone({ color, cx = 0.85, cy = 0.15, spacing = 34, max = 13, opacity = 0.35, pulse = 0 }: { color: string; cx?: number; cy?: number; spacing?: number; max?: number; opacity?: number; pulse?: number }) {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const fx = cx * width;
  const fy = cy * height;
  const reach = Math.hypot(width, height) * 0.62;
  const dots: ReactElement[] = [];
  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      const d = Math.hypot(x - fx, y - fy) / reach;
      const wave = pulse ? 0.5 + 0.5 * Math.sin(d * 14 - frame * pulse) : 1;
      const r = Math.max(0, (1 - d) * max * (pulse ? 0.55 + 0.45 * wave : 1));
      if (r > 0.6) dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={r} />);
    }
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <svg width="100%" height="100%" fill={color}>{dots}</svg>
    </AbsoluteFill>
  );
}

/** Topographic contour lines — a "research terrain" motif. */
export function Contours({ color, count = 14, opacity = 0.18, speed = 0.4, cx = 0.75, cy = 0.8 }: { color: string; count?: number; opacity?: number; speed?: number; cx?: number; cy?: number }) {
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();
  const paths: string[] = [];
  const ox = width * cx;
  const oy = height * cy;
  const base = Math.max(width, height) * 0.06;
  for (let k = 1; k <= count; k++) {
    const r = base * k * 1.25 + ((frame * speed) % (base * 1.25));
    let d = "";
    for (let a = 0; a <= 64; a++) {
      const th = (a / 64) * Math.PI * 2;
      const wob = 1 + 0.08 * Math.sin(th * 3 + k * 0.7) + 0.05 * Math.sin(th * 5 - k * 0.4);
      const x = ox + Math.cos(th) * r * wob * 1.15;
      const y = oy + Math.sin(th) * r * wob * 0.85;
      d += `${a ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    paths.push(d + "Z");
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      <svg width="100%" height="100%">{paths.map((d, i) => <path key={i} d={d} fill="none" stroke={color} strokeWidth={1.6} />)}</svg>
    </AbsoluteFill>
  );
}

export function Glow({ color, x, y, size, opacity = 0.6 }: { color: string; x: number; y: number; size: number; opacity?: number }) {
  return <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, ${color}66 35%, ${color}00 70%)`, opacity, pointerEvents: "none" }} />;
}

/** Dotted orbit ring that draws on and slowly rotates. */
export function DottedOrbit({ cx, cy, r, color, opacity = 0.5, dot = 3, gap = 14, rotate = 0.25, drawIn = 0, delay = 0, style }: { cx: number; cy: number; r: number; color: string; opacity?: number; dot?: number; gap?: number; rotate?: number; drawIn?: number; delay?: number; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const circ = 2 * Math.PI * r;
  const shown = drawIn ? interpolate(frame - delay, [0, drawIn], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return (
    <svg style={{ position: "absolute", left: cx - r - dot, top: cy - r - dot, width: (r + dot) * 2, height: (r + dot) * 2, overflow: "visible", opacity, pointerEvents: "none", ...style }}>
      <g transform={`rotate(${frame * rotate} ${r + dot} ${r + dot})`}>
        <circle cx={r + dot} cy={r + dot} r={r} fill="none" stroke={color} strokeWidth={dot} strokeLinecap="round" strokeDasharray={`0.1 ${gap}`} style={{ clipPath: shown < 1 ? `inset(0 ${(1 - shown) * 100}% 0 0)` : undefined }} />
      </g>
    </svg>
  );
}

export function Snow({ count = 120, color = "#FFFFFF" }: { count?: number; color?: string }) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const depth = 0.4 + random(`sd${i}`) * 0.6;
        const speed = (40 + random(`ss${i}`) * 70) * depth;
        const y = ((random(`sy${i}`) * height + t * speed * (height / 1080)) % (height + 40)) - 20;
        const x = random(`sx${i}`) * width + Math.sin(t * (0.6 + depth) + i) * 22 * depth;
        const s = (2 + random(`sz${i}`) * 7) * depth * (width / 1080);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: color, opacity: 0.35 + depth * 0.55, filter: depth < 0.6 ? `blur(${(0.6 - depth) * 4}px)` : undefined }} />;
      })}
    </AbsoluteFill>
  );
}

export function Sparkles({ count = 40, colors, startFrame = 0 }: { count?: number; colors: string[]; startFrame?: number }) {
  const frame = useCurrentFrame() - startFrame;
  const { width, height } = useVideoConfig();
  if (frame < 0) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const period = 40 + Math.floor(random(`sp${i}`) * 50);
        const phase = Math.floor(random(`ph${i}`) * period);
        const local = (frame + phase) % period;
        const life = Math.sin((local / period) * Math.PI);
        const s = (10 + random(`ssz${i}`) * 26) * (width / 1080) * life;
        const x = random(`spx${i}`) * width;
        const y = random(`spy${i}`) * height;
        const c = colors[i % colors.length];
        return (
          <svg key={i} style={{ position: "absolute", left: x - s, top: y - s, width: s * 2, height: s * 2, opacity: life }} viewBox="-10 -10 20 20">
            <path d="M0 -10 C1 -2 2 -1 10 0 C2 1 1 2 0 10 C-1 2 -2 1 -10 0 C-2 -1 -1 -2 0 -10Z" fill={c} />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
}

/** Firework bursts at deterministic times and places. */
export function Fireworks({ bursts = 6, colors, startFrame = 0, every = 22 }: { bursts?: number; colors: string[]; startFrame?: number; every?: number }) {
  const frame = useCurrentFrame() - startFrame;
  const { width, height } = useVideoConfig();
  if (frame < 0) return null;
  const u = width / 1080;
  const out: ReactElement[] = [];
  for (let b = 0; b < bursts * 3; b++) {
    const start = b * every;
    const t = frame - start;
    if (t < 0 || t > 55) continue;
    const bx = (0.15 + random(`fx${b}`) * 0.7) * width;
    const by = (0.12 + random(`fy${b}`) * 0.4) * height;
    const color = colors[b % colors.length];
    const n = 28;
    const R = (180 + random(`fr${b}`) * 160) * u;
    const p = 1 - Math.pow(1 - Math.min(1, t / 30), 3);
    const fade = interpolate(t, [20, 55], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2;
      const r = R * p;
      const x = bx + Math.cos(a) * r;
      const y = by + Math.sin(a) * r + t * t * 0.03 * u;
      const tail = 18 * u * (1 - p * 0.6);
      out.push(<div key={`${b}-${k}`} style={{ position: "absolute", left: x, top: y, width: 5 * u, height: tail, borderRadius: 4, background: color, opacity: fade, transform: `rotate(${(a * 180) / Math.PI + 90}deg)`, transformOrigin: "top center", boxShadow: `0 0 ${10 * u}px ${color}` }} />);
    }
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{out}</AbsoluteFill>;
}

export function Bokeh({ count = 18, colors }: { count?: number; colors: string[] }) {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const s = (60 + random(`bs${i}`) * 220) * (width / 1080);
        const x = random(`bx${i}`) * width + Math.sin(frame / 60 + i) * 20;
        const y = random(`by${i}`) * height + Math.cos(frame / 70 + i) * 20;
        return <div key={i} style={{ position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: "50%", background: colors[i % colors.length], opacity: 0.12 + random(`bo${i}`) * 0.18, filter: `blur(${s / 10}px)` }} />;
      })}
    </AbsoluteFill>
  );
}

/** Horizontal light sweep band. */
export function LightSweep({ progress, color = "#FFFFFF", opacity = 0.55, angle = 100 }: { progress: number; color?: string; opacity?: number; angle?: number }) {
  if (progress <= 0 || progress >= 1) return null;
  return <AbsoluteFill style={{ pointerEvents: "none", background: `linear-gradient(${angle}deg, ${color}00 ${progress * 140 - 30}%, ${color} ${progress * 140 - 15}%, ${color}00 ${progress * 140}%)`, opacity, mixBlendMode: "overlay" }} />;
}

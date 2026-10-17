import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, Img, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { SceneBackground } from "@/lib/video/types";
import { fontStack } from "@/lib/fonts";
import { useAsset, useColor, useLayout, useVideoCtx } from "./context";

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export function useSpring(delay = 0, config: { damping?: number; stiffness?: number; mass?: number } = {}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 200, ...config } });
}

/** Fades the whole scene out over its last frames when it has no outgoing transition. */
export function useExit(frames = 12) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return interpolate(frame, [durationInFrames - frames, durationInFrames], [1, 0], clamp);
}

export function Background({ bg, children }: { bg: SceneBackground; children?: ReactNode }) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const color = useColor();
  const asset = useAsset();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], clamp);
  let transform = "none";
  if (bg.motion === "zoom-in") transform = `scale(${1 + 0.12 * t})`;
  if (bg.motion === "zoom-out") transform = `scale(${1.12 - 0.12 * t})`;
  if (bg.motion === "pan-left") transform = `scale(1.12) translateX(${interpolate(t, [0, 1], [4, -4])}%)`;
  if (bg.motion === "pan-right") transform = `scale(1.12) translateX(${interpolate(t, [0, 1], [-4, 4])}%)`;
  const src = asset(bg.imageSrc);
  return (
    <AbsoluteFill style={{ backgroundColor: color(bg.color), overflow: "hidden" }}>
      {src && (
        <AbsoluteFill style={{ transform }}>
          <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
      )}
      {src && bg.overlay > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(0,0,0,${bg.overlay})` }} />}
      {bg.texture && bg.texture !== "none" && <Texture kind={bg.texture} />}
      {children}
    </AbsoluteFill>
  );
}

function Texture({ kind }: { kind: "dots" | "grid" | "lines" }) {
  const { u } = useLayout();
  const s = 48 * u;
  const stroke = "rgba(127,127,127,0.18)";
  const id = `tx-${kind}`;
  return (
    <AbsoluteFill>
      <svg width="100%" height="100%">
        <defs>
          <pattern id={id} width={s} height={s} patternUnits="userSpaceOnUse">
            {kind === "dots" && <circle cx={s / 2} cy={s / 2} r={2.2 * u} fill={stroke} />}
            {kind === "grid" && <path d={`M ${s} 0 L 0 0 0 ${s}`} fill="none" stroke={stroke} strokeWidth={1.5 * u} />}
            {kind === "lines" && <path d={`M 0 ${s} L ${s} 0`} fill="none" stroke={stroke} strokeWidth={1.5 * u} />}
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </AbsoluteFill>
  );
}

export function Display({ children, size, color, weight = 800, style, font }: { children: ReactNode; size: number; color: string; weight?: number; style?: CSSProperties; font?: string }) {
  const { theme } = useVideoCtx();
  return (
    <div style={{ fontFamily: fontStack(font ?? theme.displayFont), fontSize: size, fontWeight: weight, color, lineHeight: 1.02, letterSpacing: -0.02 * size, ...style }}>
      {children}
    </div>
  );
}

export function Body({ children, size, color, weight = 400, style }: { children: ReactNode; size: number; color: string; weight?: number; style?: CSSProperties }) {
  const { theme } = useVideoCtx();
  return <div style={{ fontFamily: fontStack(theme.bodyFont), fontSize: size, fontWeight: weight, color, lineHeight: 1.35, ...style }}>{children}</div>;
}

export function FadeUp({ delay = 0, distance = 40, children, style }: { delay?: number; distance?: number; children: ReactNode; style?: CSSProperties }) {
  const p = useSpring(delay);
  const { u } = useLayout();
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * distance * u}px)`, ...style }}>{children}</div>;
}

export function SlideIn({ delay = 0, from = "left", children, style }: { delay?: number; from?: "left" | "right"; children: ReactNode; style?: CSSProperties }) {
  const p = useSpring(delay, { damping: 18, stiffness: 120 });
  const d = from === "left" ? -1 : 1;
  return <div style={{ opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * d * 120}%)`, ...style }}>{children}</div>;
}

export type WordAnimation = "rise" | "typewriter" | "scale" | "mask";

/** Headline animator: splits text into words and reveals them with the chosen style. */
export function AnimatedWords({
  text,
  highlight,
  animation,
  delay = 0,
  stagger = 3,
  highlightColor,
  style,
}: {
  text: string;
  highlight?: string;
  animation: WordAnimation;
  delay?: number;
  stagger?: number;
  highlightColor: string;
  style?: CSSProperties;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const hl = new Set((highlight ?? "").toLowerCase().split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}]/gu, "")).filter(Boolean));
  const isHl = (w: string) => hl.has(w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, ""));

  if (animation === "typewriter") {
    const chars = Math.floor(interpolate(frame - delay, [0, text.length * 1.4], [0, text.length], clamp));
    const visible = text.slice(0, chars);
    const blink = Math.floor(frame / 15) % 2 === 0;
    return (
      <div style={style}>
        {visible.split(/(\s+)/).map((w, i) => (
          <span key={i} style={{ color: isHl(w) ? highlightColor : undefined }}>{w}</span>
        ))}
        <span style={{ opacity: chars < text.length || blink ? 1 : 0, color: highlightColor }}>▍</span>
      </div>
    );
  }

  if (animation === "scale") {
    const p = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 110 } });
    return (
      <div style={{ ...style, transform: `scale(${interpolate(p, [0, 1], [0.82, 1])})`, opacity: Math.min(1, p * 1.5), transformOrigin: "left center" }}>
        {renderWords(text, isHl, highlightColor)}
      </div>
    );
  }

  const lines = text.split("\n");
  let wordIndex = 0;
  return (
    <div style={style}>
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(/\s+/).filter(Boolean).map((w, wi) => {
            const idx = wordIndex++;
            const p = spring({ frame: frame - delay - idx * stagger, fps, config: { damping: 200 } });
            const color = isHl(w) ? highlightColor : undefined;
            if (animation === "mask") {
              return (
                <span key={wi} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.08em", marginRight: "0.25em" }}>
                  <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`, color }}>{w}</span>
                </span>
              );
            }
            return (
              <span key={wi} style={{ display: "inline-block", marginRight: "0.25em", opacity: p, transform: `translateY(${(1 - p) * 0.5}em)`, color }}>
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function renderWords(text: string, isHl: (w: string) => boolean, color: string) {
  return text.split("\n").map((line, li) => (
    <div key={li}>
      {line.split(/(\s+)/).map((w, i) => (
        <span key={i} style={{ color: isHl(w) ? color : undefined }}>{w}</span>
      ))}
    </div>
  ));
}

/** The official logo file, shown on its own background as a neat chip. */
export function LogoChip({ size, style, onDark }: { size: number; style?: CSSProperties; onDark?: boolean }) {
  const { doc } = useVideoCtx();
  const asset = useAsset();
  if (doc.logo === "none") return null;
  const variant = doc.logo === "auto" ? (onDark === false ? "light" : "dark") : doc.logo;
  const src = asset(variant === "dark" ? "/brand/dawb-logo-dark.svg" : "/brand/dawb-logo-light.svg");
  return <Img src={src!} style={{ width: size, height: size, borderRadius: size * 0.14, display: "block", ...style }} />;
}

export function Photo({ src, style, circle, radius = 0 }: { src?: string; style?: CSSProperties; circle?: boolean; radius?: number }) {
  const asset = useAsset();
  const color = useColor();
  const url = asset(src);
  const shape: CSSProperties = { borderRadius: circle ? "50%" : radius, overflow: "hidden" };
  if (!url) {
    return (
      <div style={{ ...shape, background: `repeating-linear-gradient(135deg, ${color("$primary")}22 0 14px, ${color("$primary")}11 14px 28px)`, ...style }} />
    );
  }
  return (
    <div style={{ ...shape, ...style }}>
      <Img src={url} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </div>
  );
}

/** Deterministic confetti burst — same frames every render. */
export function Confetti({ count = 90, colors, startFrame = 0 }: { count?: number; colors: string[]; startFrame?: number }) {
  const frame = useCurrentFrame() - startFrame;
  const { width, height, fps } = useVideoConfig();
  if (frame < 0) return null;
  const t = frame / fps;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: count }).map((_, i) => {
        const angle = -Math.PI / 2 + (random(`a${i}`) - 0.5) * Math.PI * 0.95;
        const speed = (0.9 + random(`s${i}`) * 1.1) * height * 0.95;
        const x0 = width / 2 + (random(`x${i}`) - 0.5) * width * 0.25;
        const y0 = height * 0.62;
        const g = height * 1.25;
        const drag = 0.55;
        const x = x0 + Math.cos(angle) * speed * t * drag;
        const y = y0 + Math.sin(angle) * speed * t + 0.5 * g * t * t;
        const rot = random(`r${i}`) * 360 + frame * (6 + random(`rv${i}`) * 10);
        const w = (10 + random(`w${i}`) * 14) * (width / 1080);
        const h = w * (0.4 + random(`h${i}`) * 0.5);
        const opacity = interpolate(t, [0, 0.1, 2.6, 3.2], [0, 1, 1, 0], clamp);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: w,
              height: h,
              background: colors[i % colors.length],
              borderRadius: i % 4 === 0 ? "50%" : 2,
              opacity,
              transform: `rotate(${rot}deg) scaleX(${Math.cos((frame + i) / 4)})`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

export function DrawLine({ delay = 0, width, color, thickness, style }: { delay?: number; width: number; color: string; thickness: number; style?: CSSProperties }) {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 18], [0, width], { ...clamp, easing: Easing.out(Easing.cubic) });
  return <div style={{ width: w, height: thickness, background: color, ...style }} />;
}

export function Icon({ name, size, color }: { name: "calendar" | "clock" | "pin" | "check" | "arrow"; size: number; color: string }) {
  const sw = 2;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "calendar":
      return (<svg {...common}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /></svg>);
    case "clock":
      return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
    case "pin":
      return (<svg {...common}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
    case "check":
      return (<svg {...common}><path d="M5 12.5l4.5 4.5L19 7" /></svg>);
    default:
      return (<svg {...common}><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
  }
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString("en-US");
}

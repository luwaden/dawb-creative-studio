import type { ReactElement } from "react";
import { AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { fontStack } from "@/lib/fonts";
import { Contours, DotGrid, DottedOrbit, Glow, Grain, Halftone, LightSweep, Sfx } from "./fx";
import { LogoMark, type LogoPiece, type LogoVariant, type PieceState } from "./logo";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export type LogoRevealStyle = "assemble" | "signal" | "prism";

interface Props {
  style: LogoRevealStyle;
  tagline: string;
  sound: boolean;
}

function useBase() {
  const frame = useCurrentFrame();
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const sp = (delay: number, cfg: Parameters<typeof spring>[0]["config"] = { damping: 14, stiffness: 140 }) => spring({ frame: frame - delay, fps, config: cfg });
  const out = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], cl);
  return { frame, fps, width, height, u, sp, out, durationInFrames };
}

function Tagline({ text, color, delay, u }: { text: string; color: string; delay: number; u: number }) {
  const frame = useCurrentFrame();
  if (!text) return null;
  const chars = text.split("");
  return (
    <div style={{ marginTop: 34 * u, fontFamily: fontStack("Nunito Sans"), fontWeight: 700, fontSize: 30 * u, letterSpacing: 8 * u, textTransform: "uppercase", color, display: "flex", justifyContent: "center" }}>
      {chars.map((ch, i) => {
        const p = interpolate(frame - delay - i * 1.2, [0, 10], [0, 1], cl);
        return <span key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 14 * u}px)`, display: "inline-block", whiteSpace: "pre" }}>{ch}</span>;
      })}
    </div>
  );
}

// ─────────────────────────── 1 · ASSEMBLE (dark) ───────────────────────────
// A scan line crosses the void, the emblem outline is drawn, its facets punch out
// with clicks, the data dots pop, the letters slam in — impact + light sweep.
function Assemble({ tagline, sound }: Props) {
  const { frame, width, height, u, sp, out } = useBase();
  const size = 740 * u;
  const cx = width / 2;
  const cy = height / 2 - 30 * u;
  const scan = interpolate(frame, [0, 22], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const draw = interpolate(frame, [12, 42], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
  const fill = interpolate(frame, [40, 50], [0, 1], cl);
  const cut = (d: number): PieceState => ({ transform: `scale(${sp(d, { damping: 11, stiffness: 220 })})` });
  const dot = (d: number): PieceState => {
    const p = sp(d, { damping: 8, stiffness: 260 });
    return { transform: `scale(${p})`, opacity: Math.min(1, p * 2) };
  };
  const letter = (d: number, dx: number): PieceState => {
    const p = sp(d, { damping: 16, stiffness: 180 });
    return { transform: `translateX(${(1 - p) * dx}px)`, opacity: Math.min(1, p * 1.6) };
  };
  const hit = 88;
  const shake = frame >= hit && frame < hit + 10 ? Math.sin((frame - hit) * 2.4) * (10 - (frame - hit)) * 0.9 * u : 0;
  const ring = interpolate(frame, [hit, hit + 30], [0.4, 2.4], cl);
  const ringO = interpolate(frame, [hit, hit + 30], [0.8, 0], cl);
  const zoom = interpolate(frame, [0, 150], [1.08, 1], cl);
  const pieces: Partial<Record<LogoPiece, PieceState>> = {
    emblem: { draw, fill },
    cut1: cut(48), cut2: cut(53), cut3: cut(58),
    dot1: dot(62), dot2: dot(66), dot3: dot(70),
    D: letter(72, 120), A: letter(77, 120), W: letter(80, -120), B: letter(85, -120),
  };
  return (
    <AbsoluteFill style={{ background: "#000000", overflow: "hidden", opacity: out }}>
      <Glow color="#0097B2" x={cx} y={cy} size={1400 * u} opacity={interpolate(frame, [0, 60, hit, hit + 20], [0.15, 0.35, 0.35, 0.65], cl)} />
      <DotGrid color="#FFFFFF" spacing={44 * u} size={1.7 * u} opacity={0.14} drift={0.15} />
      <Contours color="#0097B2" opacity={0.18} cx={0.5} cy={0.5} count={10} speed={0.6} />
      <DottedOrbit cx={cx} cy={cy} r={430 * u} color="#FFFFFF" opacity={0.35} dot={3 * u} gap={16 * u} rotate={0.2} drawIn={40} delay={6} />
      <DottedOrbit cx={cx} cy={cy} r={560 * u} color="#0097B2" opacity={0.6} dot={4.5 * u} gap={22 * u} rotate={-0.15} drawIn={40} delay={16} />
      {/* scan line */}
      {scan < 1 && <div style={{ position: "absolute", top: cy, left: 0, width: width * scan, height: 3 * u, background: "linear-gradient(90deg, #0097B200, #0097B2, #FFFFFF)", boxShadow: "0 0 24px #0097B2" }} />}
      <div style={{ position: "absolute", width: 400 * u, height: 400 * u, left: cx - 200 * u, top: cy - 200 * u, borderRadius: "50%", border: `${4 * u}px solid #0097B2`, transform: `scale(${ring})`, opacity: ringO }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translate(${shake}px, ${-30 * u}px) scale(${zoom})` }}>
        <LogoMark variant="dark" size={size} pieces={pieces} />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: height * 0.2 }}>
        <Tagline text={tagline} color="#9fdbe6" delay={hit + 8} u={u} />
      </AbsoluteFill>
      <LightSweep progress={interpolate(frame, [hit, hit + 26], [0, 1], cl)} />
      <Grain opacity={0.16} />
      {sound && (
        <>
          <Sfx name="riser" at={0} volume={0.5} />
          <Sfx name="click" at={48} /> <Sfx name="click" at={53} /> <Sfx name="click" at={58} />
          <Sfx name="pop" at={62} volume={0.5} /> <Sfx name="pop" at={66} volume={0.5} /> <Sfx name="pop" at={70} volume={0.5} />
          <Sfx name="whoosh" at={70} volume={0.6} />
          <Sfx name="impact" at={hit} volume={0.95} />
          <Sfx name="shimmer" at={hit + 4} volume={0.45} />
        </>
      )}
    </AbsoluteFill>
  );
}

// ─────────────────────────── 2 · SIGNAL (cyan) ───────────────────────────
// A pulse ripples through a halftone field, the mark arrives as glitching RGB
// slices, locks in on a scan line, and the field settles into a calm rhythm.
function Signal({ tagline, sound }: Props) {
  const { frame, width, height, u, sp, out } = useBase();
  const size = 740 * u;
  const cx = width / 2;
  const cy = height / 2 - 30 * u;
  const lock = 58;
  const glitchOn = frame >= 22 && frame < lock;
  const slices = 9;
  const settle = sp(lock, { damping: 12, stiffness: 160 });
  const scanY = interpolate(frame, [lock - 6, lock + 18], [-0.1, 1.1], cl) * height;
  const letters = (d: number): PieceState => {
    const p = sp(d, { damping: 200 });
    return { opacity: p, transform: `translateY(${(1 - p) * 40}px)` };
  };
  const logoPieces = frame < lock ? {} : { D: letters(lock + 4), A: letters(lock + 8), W: letters(lock + 12), B: letters(lock + 16), spark: { transform: `scale(${sp(lock + 22, { damping: 6, stiffness: 300 })})` } };
  return (
    <AbsoluteFill style={{ background: "#0097B2", overflow: "hidden", opacity: out }}>
      <Glow color="#003E4A" x={width * 0.1} y={height * 0.95} size={1500 * u} opacity={0.6} />
      <Glow color="#9BEFFF" x={width * 0.9} y={height * 0.05} size={1200 * u} opacity={0.45} />
      <Halftone color="#FFFFFF" cx={0.5} cy={0.46} spacing={30 * u} max={11 * u} opacity={0.22} pulse={0.18} />
      <DotGrid color="#003E4A" spacing={30 * u} size={1.2 * u} opacity={0.25} />
      {/* concentric dotted pulses */}
      {[0, 18, 36].map((d) => {
        const p = ((frame + d) % 54) / 54;
        return <div key={d} style={{ position: "absolute", left: cx - 300 * u, top: cy - 300 * u, width: 600 * u, height: 600 * u, borderRadius: "50%", border: `${3 * u}px dotted #FFFFFF`, transform: `scale(${0.4 + p * 1.8})`, opacity: (1 - p) * 0.55 }} />;
      })}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${-30 * u}px)` }}>
        {glitchOn ? (
          <div style={{ position: "relative", width: size, height: size }}>
            {Array.from({ length: slices }).map((_, i) => {
              const off = (random(`g${i}-${Math.floor(frame / 3)}`) - 0.5) * 120 * u * interpolate(frame, [22, lock], [1, 0.1], cl);
              const top = (i / slices) * 100;
              const clip = `inset(${top}% 0 ${100 - top - 100 / slices}% 0)`;
              return (
                <div key={i} style={{ position: "absolute", inset: 0, clipPath: clip }}>
                  <LogoMark variant="dark" size={size} style={{ position: "absolute", left: off + 8 * u, top: 0, opacity: 0.55, filter: "hue-rotate(0deg)" }} />
                  <LogoMark variant="cyan" size={size} style={{ position: "absolute", left: off, top: 0 }} />
                </div>
              );
            })}
          </div>
        ) : frame >= lock ? (
          <div style={{ transform: `scale(${interpolate(settle, [0, 1], [1.12, 1])})` }}>
            <LogoMark variant="cyan" size={size} pieces={logoPieces} />
          </div>
        ) : null}
      </AbsoluteFill>
      {frame > lock - 8 && frame < lock + 20 && <div style={{ position: "absolute", left: 0, right: 0, top: scanY, height: 6 * u, background: "#FFFFFF", boxShadow: "0 0 40px #FFFFFF", opacity: 0.8 }} />}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: height * 0.2 }}>
        <Tagline text={tagline} color="#FFFFFF" delay={lock + 24} u={u} />
      </AbsoluteFill>
      <Grain opacity={0.2} />
      {sound && (
        <>
          <Sfx name="riser" at={4} volume={0.55} />
          <Sfx name="glitch" at={22} volume={0.7} />
          <Sfx name="glitch" at={40} volume={0.6} />
          <Sfx name="impact" at={lock} volume={0.9} />
          <Sfx name="click" at={lock + 4} volume={0.5} /> <Sfx name="click" at={lock + 8} volume={0.5} /> <Sfx name="click" at={lock + 12} volume={0.5} /> <Sfx name="click" at={lock + 16} volume={0.5} />
          <Sfx name="chime" at={lock + 22} volume={0.5} />
        </>
      )}
    </AbsoluteFill>
  );
}

// ─────────────────────────── 3 · PRISM (white) ───────────────────────────
// A wall of hexagons (the emblem's geometry) flips away in a diagonal wave,
// revealing paper white; the mark rises with a soft 3D tilt and a light sweep,
// letters typeset in one by one, finishing on a shimmer.
function Prism({ tagline, sound }: Props) {
  const { frame, width, height, u, sp, out } = useBase();
  const size = 720 * u;
  const cx = width / 2;
  const cy = height / 2 - 30 * u;
  const hexW = 120 * u;
  const hexH = hexW * 1.15;
  const cols = Math.ceil(width / (hexW * 0.75 * 1.33)) + 2;
  const rows = Math.ceil(height / hexH) + 2;
  const tiles: ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * hexW * 1.0 - hexW / 2;
      const y = r * hexH * 0.87 + (c % 2 ? hexH * 0.43 : 0) - hexH / 2;
      const d = (x / width + y / height) * 22;
      const p = interpolate(frame - 4 - d, [0, 16], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
      if (p >= 1) continue;
      const shade = ["#0097B2", "#007F96", "#00A9C7", "#006B80"][(r * 7 + c * 3) % 4];
      tiles.push(
        <svg key={`${r}-${c}`} viewBox="0 0 100 115" style={{ position: "absolute", left: x, top: y, width: hexW, height: hexH, transform: `perspective(600px) rotateY(${p * 180}deg) scale(${1 - p * 0.3})`, opacity: 1 - p }}>
          <polygon points="50,0 100,28.75 100,86.25 50,115 0,86.25 0,28.75" fill={shade} stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>,
      );
    }
  }
  const rise = sp(34, { damping: 15, stiffness: 110 });
  const tilt = interpolate(rise, [0, 1], [35, 0]);
  const type = (i: number): PieceState => {
    const p = interpolate(frame - 62 - i * 6, [0, 6], [0, 1], cl);
    return { opacity: p, transform: `scale(${0.6 + p * 0.4})` };
  };
  const emblemP = sp(34, { damping: 13, stiffness: 120 });
  return (
    <AbsoluteFill style={{ background: "#FFFFFF", overflow: "hidden", opacity: out }}>
      <Glow color="#0097B2" x={cx} y={cy} size={1300 * u} opacity={0.16} />
      <DotGrid color="#071C24" spacing={36 * u} size={1.4 * u} opacity={0.14} />
      <Contours color="#0097B2" opacity={0.14} cx={0.15} cy={0.9} count={12} speed={0.3} />
      <DottedOrbit cx={cx} cy={cy} r={460 * u} color="#0097B2" opacity={0.45} dot={4 * u} gap={18 * u} rotate={0.12} drawIn={50} delay={30} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 1400, transform: `translateY(${-30 * u}px)` }}>
        <div style={{ transform: `rotateX(${tilt}deg) translateY(${(1 - rise) * 160 * u}px)`, opacity: Math.min(1, rise * 1.5), filter: `drop-shadow(0 ${30 * u * rise}px ${40 * u}px rgba(0,151,178,0.25))` }}>
          <LogoMark variant="light" size={size} pieces={{ emblem: { transform: `rotate(${(1 - emblemP) * -60}deg) scale(${emblemP})` }, D: type(0), A: type(1), W: type(2), B: type(3) }} />
        </div>
      </AbsoluteFill>
      {tiles}
      <LightSweep progress={interpolate(frame, [70, 100], [0, 1], cl)} color="#0097B2" opacity={0.35} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: height * 0.2 }}>
        <Tagline text={tagline} color="#0097B2" delay={92} u={u} />
      </AbsoluteFill>
      <Grain opacity={0.12} dark={false} />
      {sound && (
        <>
          <Sfx name="whoosh" at={2} volume={0.7} />
          <Sfx name="whoosh" at={14} volume={0.45} />
          <Sfx name="impact" at={36} volume={0.6} />
          {[0, 1, 2, 3].map((i) => <Sfx key={i} name="click" at={62 + i * 6} volume={0.55} />)}
          <Sfx name="shimmer" at={86} volume={0.6} />
        </>
      )}
    </AbsoluteFill>
  );
}

export function LogoReveal(props: Props) {
  if (props.style === "signal") return <Signal {...props} />;
  if (props.style === "prism") return <Prism {...props} />;
  return <Assemble {...props} />;
}

export const LOGO_STYLE_VARIANT: Record<LogoRevealStyle, LogoVariant> = { assemble: "dark", signal: "cyan", prism: "light" };

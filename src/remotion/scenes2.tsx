import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "@/lib/video/types";
import { fontStack } from "@/lib/fonts";
import { useColor, useLayout, useVideoCtx } from "./context";
import { Bokeh, DottedOrbit, Fireworks, Snow, Sparkles } from "./fx";
import { LogoReveal, type LogoRevealStyle } from "./logoReveal";
import { Background, Confetti, Icon, Photo } from "./primitives";

type Props = { scene: Scene };
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const str = (s: Scene, k: string, d = "") => (typeof s.props[k] === "string" ? (s.props[k] as string) : d);
const num = (s: Scene, k: string, d = 0) => (typeof s.props[k] === "number" ? (s.props[k] as number) : Number(s.props[k] ?? d) || d);
const bool = (s: Scene, k: string, d = true) => (typeof s.props[k] === "boolean" ? (s.props[k] as boolean) : d);

function lum(hex: string) {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return 0;
  const n = parseInt(m[1], 16);
  return 0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255);
}

export function useTone(scene: Scene) {
  const color = useColor();
  const bg = color(scene.background.color);
  const isCyan = bg.toLowerCase() === "#0097b2";
  const light = !scene.background.imageSrc && lum(bg) > 150;
  return {
    bg,
    light,
    isCyan,
    fg: light ? "#071C24" : "#FFFFFF",
    soft: light ? "rgba(7,28,36,0.68)" : "rgba(255,255,255,0.8)",
    accent: isCyan ? "#FFFFFF" : color("$accent") === bg ? "#0097B2" : color("$accent"),
    teal: isCyan ? "#071C24" : "#0097B2",
  };
}

/** Letters rise one by one with a slight overshoot. */
export function KineticLine({ text, size, color, delay = 0, weight = 900, font = "Nunito", stagger = 1.6, outline }: { text: string; size: number; color: string; delay?: number; weight?: number; font?: string; stagger?: number; outline?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ fontFamily: fontStack(font), fontWeight: weight, fontSize: size, lineHeight: 0.98, letterSpacing: -0.02 * size, whiteSpace: "pre-wrap" }}>
      {text.split("\n").map((line, li) => {
        let idx = 0;
        // Words stay unbreakable; letters inside them animate individually.
        return (
          <div key={li} style={{ overflow: "hidden", paddingBottom: size * 0.06 }}>
            {line.split(/(\s+)/).map((word, wi) =>
              /^\s+$/.test(word) ? (
                <span key={wi} style={{ whiteSpace: "pre" }}>{word}</span>
              ) : (
                <span key={wi} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
                  {word.split("").map((ch, i) => {
                    const n = idx++;
                    const p = spring({ frame: frame - delay - (li * 6 + n) * stagger, fps, config: { damping: 13, stiffness: 150 } });
                    return (
                      <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%) rotate(${(1 - p) * 8}deg)`, color: outline ? "transparent" : color, WebkitTextStroke: outline ? `${Math.max(2, size / 45)}px ${color}` : undefined }}>
                        {ch}
                      </span>
                    );
                  })}
                </span>
              ),
            )}
          </div>
        );
      })}
    </div>
  );
}

export function Pill({ text, bg, color, u, delay = 0 }: { text: string; bg: string; color: string; u: number; delay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  if (!text) return null;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 12 * u, background: bg, color, borderRadius: 999, padding: `${12 * u}px ${26 * u}px`, fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 26 * u, letterSpacing: 3 * u, textTransform: "uppercase", opacity: p, transform: `translateY(${(1 - p) * 20 * u}px)` }}>
      <span style={{ width: 10 * u, height: 10 * u, borderRadius: "50%", background: color }} />
      {text}
    </div>
  );
}

// ─────────────── Greeting (Christmas, New Year, Birthday, Weekend …) ───────────────
function Greeting({ scene }: Props) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const { u, width, isLandscape, isPortrait } = useLayout();
  const t = useTone(scene);
  const color = useColor();
  const effect = str(scene, "effect", "sparkles");
  const left = str(scene, "layout", "center") === "left";
  const big = str(scene, "big");
  const headline = str(scene, "headline");
  const hasPhoto = Boolean(str(scene, "image")) || bool(scene, "photoSlot", false);
  const drift = interpolate(frame, [0, durationInFrames], [0, -120 * u]);
  const bigP = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 90 } });
  const msgP = interpolate(frame, [30, 48], [0, 1], cl);
  const photoP = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const hsize = (headline.length > 22 ? 112 : 156) * u * (isLandscape ? 0.85 : 1);
  const palette = [color("$primary"), color("$accent"), t.light ? "#071C24" : "#FFFFFF", "#FFC83D"];
  return (
    <Background bg={scene.background}>
      {/* giant outlined echo word drifting behind */}
      {big && (
        <div style={{ position: "absolute", left: left ? -40 * u : 0, right: 0, top: isPortrait ? "70%" : "8%", textAlign: left ? "left" : "center", transform: `translateX(${drift}px) scale(${0.9 + bigP * 0.1})`, opacity: bigP * 0.9 }}>
          <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: Math.min(560 * u, (width * 1.5) / Math.max(2, big.length)), lineHeight: 0.85, color: "transparent", WebkitTextStroke: `${3 * u}px ${t.accent}`, letterSpacing: -10 * u, whiteSpace: "nowrap" }}>{big}</div>
        </div>
      )}
      {effect === "snow" && <Snow count={170} color={t.light ? "#9FD8E3" : "#FFFFFF"} />}
      {effect === "bokeh" && <Bokeh colors={palette} />}
      {effect === "fireworks" && <Fireworks colors={["#FFFFFF", "#FFC83D", "#3CD3EC", color("$accent")]} startFrame={6} />}
      {effect === "sparkles" && <Sparkles colors={palette} startFrame={4} />}
      {effect === "confetti" && <Confetti count={170} colors={palette} startFrame={6} />}
      <AbsoluteFill style={{ padding: 96 * u, paddingTop: 220 * u, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: left ? "flex-start" : "center", textAlign: left ? "left" : "center" }}>
        {hasPhoto && (
          <div style={{ position: "relative", marginBottom: 44 * u, transform: `scale(${photoP})` }}>
            <DottedOrbit cx={190 * u} cy={190 * u} r={215 * u} color={t.accent} opacity={0.8} dot={5 * u} gap={18 * u} rotate={0.5} />
            <Photo src={str(scene, "image")} circle style={{ width: 380 * u, height: 380 * u, border: `${8 * u}px solid ${t.accent}` }} />
          </div>
        )}
        <Pill text={str(scene, "eyebrow")} bg={t.isCyan ? "#071C24" : "#0097B2"} color="#FFFFFF" u={u} delay={2} />
        <div style={{ marginTop: 28 * u }}>
          <KineticLine text={headline} size={hsize} color={t.fg} delay={10} />
        </div>
        {big && !hasPhoto && /^\d+$/.test(big) && (
          <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: (isPortrait ? 280 : 220) * u, lineHeight: 0.9, color: t.accent, letterSpacing: -8 * u, transform: `scale(${interpolate(bigP, [0, 1], [0.6, 1])})`, opacity: bigP }}>{big}</div>
        )}
        {str(scene, "message") && (
          <div style={{ marginTop: 34 * u, maxWidth: 820 * u, fontFamily: fontStack("Nunito Sans"), fontSize: 38 * u, lineHeight: 1.4, color: t.soft, opacity: msgP, transform: `translateY(${(1 - msgP) * 24 * u}px)` }}>{str(scene, "message")}</div>
        )}
      </AbsoluteFill>
    </Background>
  );
}

// ─────────────── New month ───────────────
function Month({ scene }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isLandscape, isPortrait, width } = useLayout();
  const t = useTone(scene);
  const month = str(scene, "month", "November");
  const start = Math.round(num(scene, "startDay", 0)) % 7;
  const days = Math.min(31, Math.max(28, Math.round(num(scene, "days", 30))));
  const cell = (isLandscape ? 58 : isPortrait ? 92 : 66) * u;
  const cells: Array<number | null> = [...Array(start).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: 90 * u, paddingTop: (isPortrait ? 300 : 200) * u, display: "flex", flexDirection: isLandscape ? "row" : "column", gap: (isPortrait ? 60 : 36) * u, justifyContent: isLandscape ? "center" : "flex-start" }}>
        <div style={{ flex: isLandscape ? 1 : undefined }}>
          <Pill text={str(scene, "greeting")} bg={t.isCyan ? "#071C24" : "#0097B2"} color="#FFFFFF" u={u} />
          <div style={{ marginTop: 26 * u }}>
            <KineticLine text={month.toUpperCase()} size={Math.min(190 * u, ((isLandscape ? width * 0.5 : width) - 200 * u) / (Math.max(5, month.length) * 0.7))} color={t.fg} delay={6} stagger={2.2} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 * u, marginTop: 10 * u }}>
            <div style={{ height: 6 * u, width: interpolate(frame, [20, 44], [0, 160 * u], { ...cl, easing: Easing.out(Easing.cubic) }), background: t.accent }} />
            <span style={{ fontFamily: fontStack("Nunito"), fontWeight: 300, fontSize: 64 * u, color: t.fg, opacity: interpolate(frame, [26, 40], [0, 1], cl) }}>{str(scene, "year")}</span>
          </div>
          {str(scene, "message") && <div style={{ marginTop: 30 * u, maxWidth: 760 * u, fontFamily: fontStack("Nunito Sans"), fontSize: 36 * u, lineHeight: 1.4, color: t.soft, opacity: interpolate(frame, [40, 56], [0, 1], cl) }}>{str(scene, "message")}</div>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(7, ${cell}px)`, gap: 10 * u, alignSelf: isLandscape ? "center" : "flex-start" }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={`h${i}`} style={{ height: cell * 0.6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 24 * u, color: t.soft }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            const p = spring({ frame: frame - 24 - i * 1.1, fps, config: { damping: 15, stiffness: 180 } });
            const first = d === 1;
            const ring = first ? 1 + 0.08 * Math.sin(frame / 6) : 1;
            return (
              <div key={i} style={{ width: cell, height: cell, borderRadius: first ? "50%" : 12 * u, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack("Nunito"), fontWeight: first ? 900 : 600, fontSize: (first ? 40 : 30) * u, color: first ? (t.isCyan ? "#0097B2" : "#FFFFFF") : t.fg, background: d === null ? "transparent" : first ? (t.isCyan ? "#FFFFFF" : "#0097B2") : t.light ? "rgba(7,28,36,0.05)" : "rgba(255,255,255,0.08)", border: d === null || first ? "none" : `${1.5 * u}px dotted ${t.light ? "rgba(7,28,36,0.25)" : "rgba(255,255,255,0.3)"}`, opacity: p, transform: `scale(${p * ring})` }}>
                {d}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Background>
  );
}

// ─────────────── Webinar (Beyond The Dashboard) ───────────────
function Webinar({ scene }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isLandscape, width } = useLayout();
  const t = useTone(scene);
  const { theme } = useVideoCtx();
  const photoP = spring({ frame: frame - 18, fps, config: { damping: 14, stiffness: 110 } });
  const title = str(scene, "title");
  const tiles: Array<{ icon: "calendar" | "clock" | "pin"; label: string; value: string }> = [
    { icon: "calendar", label: "Date", value: str(scene, "date") },
    { icon: "clock", label: "Time", value: str(scene, "time") },
    { icon: "pin", label: "Where", value: str(scene, "platform") },
  ];
  const photoSize = (isLandscape ? 380 : 400) * u;
  const tileBg = t.light ? "#FFFFFF" : t.isCyan ? "rgba(7,28,36,0.22)" : "rgba(255,255,255,0.06)";
  const tileBorder = t.light ? "rgba(7,28,36,0.1)" : "rgba(255,255,255,0.16)";
  void theme;
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: 84 * u, paddingTop: 210 * u, display: "flex", flexDirection: "column", gap: 34 * u }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 * u }}>
          <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: 36 * u, color: t.fg, letterSpacing: 1 * u, opacity: interpolate(frame, [0, 12], [0, 1], cl) }}>
            <span style={{ color: t.accent }}>/// </span>{str(scene, "series").toUpperCase()}
          </div>
          <Pill text={str(scene, "episode")} bg="#E5484D" color="#FFFFFF" u={u} delay={6} />
        </div>
        <div style={{ display: "flex", flexDirection: isLandscape ? "row" : "column", gap: (isLandscape ? 40 : 60) * u, flex: isLandscape ? 1 : undefined, marginTop: isLandscape ? 0 : 30 * u }}>
          <div style={{ flex: isLandscape ? 1 : undefined }}>
            <KineticLine text={title} size={(title.length > 48 ? 82 : 100) * u} color={t.fg} delay={8} stagger={0.9} />
            <div style={{ display: "flex", alignItems: "center", gap: 28 * u, marginTop: 40 * u }}>
              <div style={{ position: "relative", width: photoSize, height: photoSize, flexShrink: 0, transform: `scale(${photoP})` }}>
                <DottedOrbit cx={photoSize / 2} cy={photoSize / 2} r={photoSize / 2 + 26 * u} color={t.accent} opacity={0.9} dot={5 * u} gap={16 * u} rotate={0.4} />
                <Photo src={str(scene, "image")} circle style={{ width: photoSize, height: photoSize }} />
              </div>
              <div style={{ opacity: interpolate(frame, [30, 44], [0, 1], cl), transform: `translateX(${interpolate(frame, [30, 44], [30, 0], cl) * u}px)` }}>
                <div style={{ fontFamily: fontStack("Nunito Sans"), fontSize: 24 * u, fontWeight: 800, letterSpacing: 3 * u, color: t.accent, textTransform: "uppercase" }}>Speaker</div>
                <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: 52 * u, color: t.fg, lineHeight: 1.05, marginTop: 8 * u, maxWidth: (width - photoSize - 260 * u) }}>{str(scene, "speaker")}</div>
                <div style={{ fontFamily: fontStack("Nunito Sans"), fontSize: 30 * u, color: t.soft, marginTop: 8 * u }}>{str(scene, "role")}</div>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isLandscape ? "1fr" : "1fr 1fr 1fr", gap: 16 * u, alignSelf: isLandscape ? "center" : "stretch", width: isLandscape ? 520 * u : undefined }}>
            {tiles.map((tile, i) => {
              const p = spring({ frame: frame - 40 - i * 6, fps, config: { damping: 200 } });
              return (
                <div key={i} style={{ background: tileBg, border: `${1.5 * u}px solid ${tileBorder}`, borderRadius: 22 * u, padding: `${24 * u}px ${24 * u}px`, opacity: p, transform: `translateY(${(1 - p) * 30 * u}px)` }}>
                  <Icon name={tile.icon} size={40 * u} color={t.accent} />
                  <div style={{ fontFamily: fontStack("Nunito Sans"), fontSize: 20 * u, fontWeight: 800, letterSpacing: 2 * u, color: t.soft, textTransform: "uppercase", marginTop: 14 * u }}>{tile.label}</div>
                  <div style={{ fontFamily: fontStack("Nunito"), fontSize: 32 * u, fontWeight: 900, color: t.fg, marginTop: 4 * u, lineHeight: 1.1 }}>{tile.value}</div>
                </div>
              );
            })}
          </div>
        </div>
        {str(scene, "cta") && (
          <div style={{ alignSelf: "flex-start", background: t.isCyan ? "#071C24" : "#0097B2", color: "#FFFFFF", borderRadius: 999, padding: `${22 * u}px ${40 * u}px`, fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: 34 * u, transform: `scale(${1 + Math.sin(frame / 8) * 0.02})`, opacity: interpolate(frame, [60, 74], [0, 1], cl), display: "flex", alignItems: "center", gap: 16 * u }}>
            {str(scene, "cta")} <Icon name="arrow" size={36 * u} color="#FFFFFF" />
          </div>
        )}
      </AbsoluteFill>
    </Background>
  );
}

function LogoRevealScene({ scene }: Props) {
  return <LogoReveal style={str(scene, "style", "assemble") as LogoRevealStyle} tagline={str(scene, "tagline")} sound={bool(scene, "sound", true)} />;
}

export const NEW_SCENES = { greeting: Greeting, month: Month, webinar: Webinar, "logo-reveal": LogoRevealScene };

import { NEW_SCENES } from "./scenes2";
import { SCENES3 } from "./scenes3";
import { SCENES4 } from "./scenes4";
import type { CSSProperties } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene, SceneType } from "@/lib/video/types";
import { fontStack } from "@/lib/fonts";
import { useColor, useLayout, useVideoCtx } from "./context";
import {
  AnimatedWords,
  Background,
  Body,
  clamp,
  Confetti,
  Display,
  DrawLine,
  FadeUp,
  formatNumber,
  Icon,
  LogoChip,
  Photo,
  SlideIn,
  useSpring,
  type WordAnimation,
} from "./primitives";

type Props = { scene: Scene };

const str = (s: Scene, k: string, d = "") => (typeof s.props[k] === "string" ? (s.props[k] as string) : d);
const num = (s: Scene, k: string, d = 0) => (typeof s.props[k] === "number" ? (s.props[k] as number) : Number(s.props[k] ?? d) || d);
const bool = (s: Scene, k: string, d = false) => (typeof s.props[k] === "boolean" ? (s.props[k] as boolean) : d);
const list = (s: Scene, k: string) => (Array.isArray(s.props[k]) ? (s.props[k] as Array<Record<string, string | number>>) : []);

/** Pick text colour that reads on the scene background. */
function useOnBg(scene: Scene) {
  const color = useColor();
  const bg = color(scene.background.color);
  const dark = scene.background.imageSrc ? true : isDark(bg);
  const { theme } = useVideoCtx();
  // On brand-cyan backgrounds the teal accent disappears: switch to deep navy / white.
  const same = (c: string) => !scene.background.imageSrc && c.toLowerCase() === bg.toLowerCase();
  const accent = same(color("$primary")) ? "#071C24" : color("$primary");
  const highlight = same(color("$accent")) ? "#FFFFFF" : color("$accent");
  return { fg: dark ? "#ffffff" : theme.ink, soft: dark ? "rgba(255,255,255,0.78)" : `${theme.ink}b3`, dark, accent, highlight };
}

export function isDark(hex: string) {
  const m = /^#?([0-9a-f]{6})/i.exec(hex);
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
}

function Content({ children, style, align = "left" }: { children: React.ReactNode; style?: CSSProperties; align?: string }) {
  const { pad } = useLayout();
  return (
    <AbsoluteFill style={{ padding: pad, paddingTop: pad * 1.9, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: align === "center" ? "center" : "flex-start", textAlign: align === "center" ? "center" : "left", ...style }}>
      {children}
    </AbsoluteFill>
  );
}

function Eyebrow({ text, color, delay = 0, lineColor }: { text: string; color: string; delay?: number; lineColor: string }) {
  const { u } = useLayout();
  const { theme } = useVideoCtx();
  if (!text) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 * u, marginBottom: 34 * u }}>
      <DrawLine delay={delay} width={64 * u} thickness={6 * u} color={lineColor} />
      <FadeUp delay={delay + 4} distance={16}>
        <div style={{ fontFamily: fontStack(theme.bodyFont), fontSize: 30 * u, fontWeight: 700, letterSpacing: 4 * u, textTransform: "uppercase", color }}>{text}</div>
      </FadeUp>
    </div>
  );
}

function KineticTitle({ scene }: Props) {
  const { u, isLandscape } = useLayout();
  const c = useOnBg(scene);
  const headline = str(scene, "headline");
  const align = str(scene, "align", "left");
  const size = (headline.length > 60 ? 96 : headline.length > 30 ? 122 : 150) * u * (isLandscape ? 1.05 : 1);
  return (
    <Background bg={scene.background}>
      <Content align={align}>
        <Eyebrow text={str(scene, "eyebrow")} color={c.fg} lineColor={c.accent} />
        <Display size={size} color={c.fg} style={{ maxWidth: isLandscape ? "78%" : "100%" }}>
          <AnimatedWords text={headline} highlight={str(scene, "highlight")} animation={str(scene, "animation", "rise") as WordAnimation} delay={6} highlightColor={c.highlight === c.fg ? c.accent : c.highlight} />
        </Display>
        {str(scene, "subline") && (
          <FadeUp delay={22} style={{ marginTop: 40 * u, maxWidth: isLandscape ? "60%" : "92%" }}>
            <Body size={40 * u} color={c.soft}>{str(scene, "subline")}</Body>
          </FadeUp>
        )}
      </Content>
    </Background>
  );
}

function PhotoHero({ scene }: Props) {
  const { u, pad, isLandscape } = useLayout();
  const c = useOnBg({ ...scene, background: { ...scene.background, imageSrc: str(scene, "image") || scene.background.imageSrc } });
  const position = str(scene, "position", "bottom");
  const bg = { ...scene.background, imageSrc: str(scene, "image") || scene.background.imageSrc, overlay: Math.max(scene.background.overlay, str(scene, "image") ? 0.15 : 0) };
  const hasImage = Boolean(bg.imageSrc);
  const headline = str(scene, "headline");
  const { theme } = useVideoCtx();
  return (
    <Background bg={bg}>
      {hasImage && (
        <AbsoluteFill style={{ background: position === "top" ? "linear-gradient(180deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 55%)" : position === "center" ? "rgba(0,0,0,0.35)" : "linear-gradient(0deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0) 60%)" }} />
      )}
      <AbsoluteFill style={{ padding: pad, paddingTop: pad * 2, display: "flex", flexDirection: "column", justifyContent: position === "top" ? "flex-start" : position === "center" ? "center" : "flex-end" }}>
        {str(scene, "tag") && (
          <FadeUp delay={4}>
            <div style={{ display: "inline-block", background: c.accent, color: "#fff", fontFamily: fontStack(theme.bodyFont), fontWeight: 700, fontSize: 28 * u, padding: `${10 * u}px ${22 * u}px`, letterSpacing: 2 * u, textTransform: "uppercase", marginBottom: 30 * u }}>{str(scene, "tag")}</div>
          </FadeUp>
        )}
        <Display size={(headline.length > 50 ? 92 : 118) * u} color={hasImage ? "#fff" : c.fg} style={{ maxWidth: isLandscape ? "70%" : "100%" }}>
          <AnimatedWords text={headline} animation="mask" delay={8} highlightColor={c.accent} />
        </Display>
        {str(scene, "subline") && (
          <FadeUp delay={24} style={{ marginTop: 30 * u, maxWidth: isLandscape ? "55%" : "95%" }}>
            <Body size={38 * u} color={hasImage ? "rgba(255,255,255,0.85)" : c.soft}>{str(scene, "subline")}</Body>
          </FadeUp>
        )}
      </AbsoluteFill>
    </Background>
  );
}

function LowerThird({ scene }: Props) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { u, pad, isLandscape } = useLayout();
  const color = useColor();
  const { theme } = useVideoCtx();
  const bg = { ...scene.background, imageSrc: str(scene, "image") || scene.background.imageSrc };
  const out = interpolate(frame, [durationInFrames - 14, durationInFrames - 2], [0, 1], clamp);
  const pIn = useSpring(10, { damping: 20, stiffness: 140 });
  const p = pIn * (1 - out);
  const roleP = useSpring(18);
  const style = str(scene, "style", "bar");
  return (
    <Background bg={bg}>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: pad, paddingBottom: pad * (isLandscape ? 0.9 : 2.2) }}>
        {style === "bar" ? (
          <div style={{ transform: `translateX(${(p - 1) * 110}%)`, display: "inline-flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ background: color("$primary"), color: "#fff", padding: `${18 * u}px ${30 * u}px`, fontFamily: fontStack(theme.displayFont), fontWeight: 800, fontSize: 64 * u, letterSpacing: -1 * u }}>{str(scene, "name")}</div>
            <div style={{ background: "#fff", color: theme.ink, padding: `${12 * u}px ${30 * u}px`, fontFamily: fontStack(theme.bodyFont), fontWeight: 600, fontSize: 32 * u, transform: `translateX(${(1 - roleP) * -40}px)`, opacity: roleP * (1 - out) }}>{str(scene, "role")}</div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: 26 * u, alignItems: "stretch", opacity: p }}>
            <div style={{ width: 8 * u, background: color("$primary"), transform: `scaleY(${p})`, transformOrigin: "bottom" }} />
            <div style={{ transform: `translateY(${(1 - p) * 30}px)` }}>
              <div style={{ fontFamily: fontStack(theme.displayFont), fontWeight: 800, fontSize: 66 * u, color: "#fff", lineHeight: 1 }}>{str(scene, "name")}</div>
              <div style={{ fontFamily: fontStack(theme.bodyFont), fontWeight: 500, fontSize: 32 * u, color: "rgba(255,255,255,0.85)", marginTop: 12 * u }}>{str(scene, "role")}</div>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </Background>
  );
}

function SpeakerCard({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape, isPortrait } = useLayout();
  const c = useOnBg(scene);
  const { theme } = useVideoCtx();
  const photo = (isLandscape ? 520 : isPortrait ? 560 : 360) * u;
  const ringR = photo / 2 + 18 * u;
  const circ = 2 * Math.PI * ringR;
  const ring = interpolate(frame, [6, 40], [circ, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const pop = useSpring(4, { damping: 16, stiffness: 120 });
  const text = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: isLandscape ? "flex-start" : "center", textAlign: isLandscape ? "left" : "center", maxWidth: isLandscape ? 820 * u : "100%" }}>
      <FadeUp delay={14}><div style={{ fontFamily: fontStack(theme.bodyFont), fontSize: 30 * u, fontWeight: 700, letterSpacing: 4 * u, textTransform: "uppercase", color: c.accent }}>{str(scene, "label")}</div></FadeUp>
      <FadeUp delay={20}><Display size={96 * u} color={c.fg} style={{ marginTop: 18 * u }}>{str(scene, "name")}</Display></FadeUp>
      <FadeUp delay={26}><Body size={36 * u} color={c.soft} style={{ marginTop: 14 * u }}>{str(scene, "role")}</Body></FadeUp>
      {str(scene, "topic") && (
        <FadeUp delay={34}>
          <div style={{ marginTop: 40 * u, borderLeft: isLandscape ? `${6 * u}px solid ${c.accent}` : undefined, borderTop: isLandscape ? undefined : `${4 * u}px solid ${c.accent}`, padding: isLandscape ? `${6 * u}px ${24 * u}px` : `${26 * u}px ${10 * u}px 0` }}>
            <Body size={40 * u} color={c.fg} weight={600}>{str(scene, "topic")}</Body>
          </div>
        </FadeUp>
      )}
    </div>
  );
  const photoEl = (
    <div style={{ position: "relative", width: ringR * 2 + 8 * u, height: ringR * 2 + 8 * u, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={ringR * 2 + 8 * u} height={ringR * 2 + 8 * u} style={{ position: "absolute", inset: 0 }}>
        <circle cx={ringR + 4 * u} cy={ringR + 4 * u} r={ringR} fill="none" stroke={c.accent} strokeWidth={6 * u} strokeDasharray={circ} strokeDashoffset={ring} transform={`rotate(-90 ${ringR + 4 * u} ${ringR + 4 * u})`} />
      </svg>
      <Photo src={str(scene, "image")} circle style={{ width: photo, height: photo, transform: `scale(${pop})` }} />
    </div>
  );
  return (
    <Background bg={scene.background}>
      <Content align="center" style={{ flexDirection: isLandscape ? "row" : "column", gap: 70 * u, justifyContent: "center" }}>
        {photoEl}
        {text}
      </Content>
    </Background>
  );
}

function Countdown({ scene }: Props) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { u } = useLayout();
  const c = useOnBg(scene);
  const { theme } = useVideoCtx();
  const from = Math.round(num(scene, "from", 5));
  const to = Math.min(from, Math.round(num(scene, "to", 0)));
  const steps = from - to + 1;
  const usable = durationInFrames - 20;
  const per = usable / steps;
  const idx = Math.min(steps - 1, Math.max(0, Math.floor((frame - 10) / per)));
  const value = from - idx;
  const local = frame - 10 - idx * per;
  const pop = spring({ frame: local, fps: useVideoConfig().fps, config: { damping: 12, stiffness: 160 } });
  const R = 330 * u;
  const circ = 2 * Math.PI * R;
  const prog = interpolate(frame, [10, usable + 10], [0, 1], clamp);
  return (
    <Background bg={scene.background}>
      <Content align="center">
        <FadeUp delay={0}><Body size={42 * u} color={c.soft} weight={600} style={{ textTransform: "uppercase", letterSpacing: 4 * u }}>{str(scene, "label")}</Body></FadeUp>
        <div style={{ position: "relative", width: R * 2 + 40 * u, height: R * 2 + 40 * u, margin: `${40 * u}px 0`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={R * 2 + 40 * u} height={R * 2 + 40 * u} style={{ position: "absolute", inset: 0 }}>
            <circle cx={R + 20 * u} cy={R + 20 * u} r={R} fill="none" stroke={c.dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"} strokeWidth={16 * u} />
            <circle cx={R + 20 * u} cy={R + 20 * u} r={R} fill="none" stroke={c.accent} strokeWidth={16 * u} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog)} transform={`rotate(-90 ${R + 20 * u} ${R + 20 * u})`} />
          </svg>
          <div style={{ textAlign: "center", transform: `scale(${interpolate(pop, [0, 1], [1.35, 1])})`, opacity: Math.min(1, 0.35 + pop * 2) }}>
            <div style={{ fontFamily: fontStack(theme.displayFont), fontWeight: 900, fontSize: 340 * u, lineHeight: 0.9, color: c.fg, letterSpacing: -10 * u }}>{value}</div>
            <div style={{ fontFamily: fontStack(theme.bodyFont), fontWeight: 700, fontSize: 48 * u, color: c.accent, textTransform: "uppercase", letterSpacing: 6 * u }}>{value === 1 ? str(scene, "unit").replace(/s$/, "") : str(scene, "unit")}</div>
          </div>
        </div>
        <FadeUp delay={16}><Display size={60 * u} color={c.fg}>{str(scene, "caption")}</Display></FadeUp>
      </Content>
    </Background>
  );
}

function StatCounter({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape, width, pad } = useLayout();
  const c = useOnBg(scene);
  const stats = list(scene, "stats").slice(0, 3);
  return (
    <Background bg={scene.background}>
      <Content>
        <Eyebrow text={str(scene, "title")} color={c.fg} lineColor={c.accent} />
        <div style={{ display: "flex", flexDirection: isLandscape ? "row" : "column", gap: (isLandscape ? 80 : 54) * u, width: "100%" }}>
          {stats.map((s, i) => {
            const delay = 10 + i * 14;
            const target = Number(s.value) || 0;
            const v = interpolate(frame - delay, [0, 45], [0, target], { ...clamp, easing: Easing.out(Easing.cubic) });
            const chars = formatNumber(target).length + String(s.suffix ?? "").length * 0.55;
            const base = (isLandscape ? 150 : 170) * u;
            const fit = Math.min(base, ((isLandscape ? width / Math.max(1, stats.length) : width) - pad * 2) / (chars * 0.6));
            return (
              <FadeUp key={i} delay={delay} style={{ flex: 1, borderTop: `${4 * u}px solid ${i === 0 ? c.accent : c.dark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.12)"}`, paddingTop: 24 * u }}>
                <Display size={fit} color={i === 0 ? c.accent : c.fg} weight={900}>
                  {formatNumber(v)}
                  <span style={{ fontSize: "0.55em" }}>{String(s.suffix ?? "")}</span>
                </Display>
                <Body size={38 * u} color={c.soft} weight={500} style={{ marginTop: 6 * u }}>{String(s.label ?? "")}</Body>
              </FadeUp>
            );
          })}
        </div>
        {str(scene, "note") && <FadeUp delay={50} style={{ marginTop: 50 * u }}><Body size={24 * u} color={c.soft}>{str(scene, "note")}</Body></FadeUp>}
      </Content>
    </Background>
  );
}

function BarChart({ scene }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isLandscape, ratio } = useLayout();
  const c = useOnBg(scene);
  const items = list(scene, "items").slice(0, 6);
  const max = Math.max(1, ...items.map((i) => Number(i.value) || 0));
  const unit = str(scene, "unit");
  const vertical = isLandscape || ratio >= 0.95;
  const track = c.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";
  return (
    <Background bg={scene.background}>
      <Content>
        <FadeUp><Display size={84 * u} color={c.fg} style={{ marginBottom: 50 * u }}>{str(scene, "title")}</Display></FadeUp>
        {vertical ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 34 * u, height: 520 * u, width: "100%" }}>
            {items.map((it, i) => {
              const p = spring({ frame: frame - 12 - i * 6, fps, config: { damping: 200 } });
              const v = Number(it.value) || 0;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  <Body size={34 * u} color={c.fg} weight={800} style={{ opacity: p }}>{formatNumber(v * p)}{unit}</Body>
                  <div style={{ width: "100%", height: `${(v / max) * 80 * p}%`, background: v === max ? c.accent : c.dark ? "rgba(255,255,255,0.55)" : `${c.fg}55`, borderRadius: `${8 * u}px ${8 * u}px 0 0`, marginTop: 10 * u }} />
                  <Body size={28 * u} color={c.soft} weight={600} style={{ marginTop: 14 * u, textAlign: "center" }}>{String(it.label ?? "")}</Body>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 34 * u, width: "100%" }}>
            {items.map((it, i) => {
              const p = spring({ frame: frame - 12 - i * 6, fps, config: { damping: 200 } });
              const v = Number(it.value) || 0;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 * u }}>
                    <Body size={34 * u} color={c.fg} weight={600}>{String(it.label ?? "")}</Body>
                    <Body size={34 * u} color={c.fg} weight={800}>{formatNumber(v * p)}{unit}</Body>
                  </div>
                  <div style={{ height: 34 * u, background: track, borderRadius: 17 * u, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(v / max) * 100 * p}%`, background: v === max ? c.accent : c.dark ? "rgba(255,255,255,0.6)" : `${c.fg}66`, borderRadius: 17 * u }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {str(scene, "caption") && <FadeUp delay={40} style={{ marginTop: 44 * u }}><Body size={24 * u} color={c.soft}>{str(scene, "caption")}</Body></FadeUp>}
      </Content>
    </Background>
  );
}

function Quote({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape } = useLayout();
  const c = useOnBg(scene);
  const { theme } = useVideoCtx();
  const words = str(scene, "quote").split(/\s+/).filter(Boolean);
  const markP = useSpring(0, { damping: 14 });
  const size = (words.length > 30 ? 58 : words.length > 16 ? 70 : 86) * u;
  return (
    <Background bg={scene.background}>
      <Content>
        <div style={{ fontFamily: fontStack("Nunito"), fontSize: 300 * u, lineHeight: 0.6, height: 150 * u, color: c.accent, transform: `scale(${markP})`, transformOrigin: "left top" }}>“</div>
        <div style={{ fontFamily: fontStack("Nunito"), fontSize: size, lineHeight: 1.25, color: c.fg, fontWeight: 500, maxWidth: isLandscape ? "80%" : "100%" }}>
          {words.map((w, i) => (
            <span key={i} style={{ opacity: interpolate(frame - 8 - i * 2, [0, 10], [0.12, 1], clamp) }}>{w} </span>
          ))}
        </div>
        <FadeUp delay={14 + words.length * 2} style={{ display: "flex", alignItems: "center", gap: 26 * u, marginTop: 50 * u }}>
          {str(scene, "image") && <Photo src={str(scene, "image")} circle style={{ width: 110 * u, height: 110 * u }} />}
          <div>
            <div style={{ fontFamily: fontStack(theme.displayFont), fontWeight: 800, fontSize: 40 * u, color: c.fg }}>{str(scene, "author")}</div>
            {str(scene, "role") && <Body size={30 * u} color={c.soft}>{str(scene, "role")}</Body>}
          </div>
        </FadeUp>
      </Content>
    </Background>
  );
}

function Celebration({ scene }: Props) {
  const { u, isLandscape } = useLayout();
  const c = useOnBg(scene);
  const color = useColor();
  const { theme } = useVideoCtx();
  const nameP = useSpring(10, { damping: 11, stiffness: 120 });
  const hasPhoto = Boolean(str(scene, "image"));
  const photoP = useSpring(0, { damping: 14 });
  return (
    <Background bg={scene.background}>
      {bool(scene, "confetti", true) && <Confetti colors={[color("$primary"), color("$accent"), c.dark ? "#ffffff" : theme.ink, "#f2c14e"]} startFrame={6} />}
      <Content align="center">
        {hasPhoto && (
          <div style={{ transform: `scale(${photoP})`, marginBottom: 40 * u }}>
            <Photo src={str(scene, "image")} circle style={{ width: (isLandscape ? 300 : 420) * u, height: (isLandscape ? 300 : 420) * u, border: `${10 * u}px solid ${c.accent}` }} />
          </div>
        )}
        <FadeUp delay={4}>
          <div style={{ fontFamily: fontStack("Nunito"), fontSize: 130 * u, color: c.accent, lineHeight: 1 }}>{str(scene, "eyebrow")}</div>
        </FadeUp>
        <div style={{ transform: `scale(${interpolate(nameP, [0, 1], [0.6, 1])})`, opacity: Math.min(1, nameP * 1.6) }}>
          <Display size={(str(scene, "name").length > 14 ? 120 : 170) * u} color={c.fg} weight={900} style={{ textTransform: "uppercase", marginTop: 10 * u }}>{str(scene, "name")}</Display>
        </div>
        <FadeUp delay={26} style={{ marginTop: 34 * u, maxWidth: isLandscape ? "60%" : "88%" }}>
          <Body size={42 * u} color={c.soft}>{str(scene, "message")}</Body>
        </FadeUp>
      </Content>
    </Background>
  );
}

function ListReveal({ scene }: Props) {
  const { u, isLandscape } = useLayout();
  const c = useOnBg(scene);
  const { theme } = useVideoCtx();
  const items = list(scene, "items").slice(0, 5);
  const numbered = bool(scene, "numbered", true);
  return (
    <Background bg={scene.background}>
      <Content>
        <FadeUp><Display size={92 * u} color={c.fg} style={{ marginBottom: 56 * u, maxWidth: isLandscape ? "70%" : "100%" }}>{str(scene, "title")}</Display></FadeUp>
        <div style={{ display: "flex", flexDirection: "column", gap: 30 * u, width: "100%" }}>
          {items.map((it, i) => (
            <SlideIn key={i} delay={14 + i * 12} style={{ display: "flex", alignItems: "center", gap: 30 * u }}>
              <div style={{ width: 84 * u, height: 84 * u, flexShrink: 0, borderRadius: 12 * u, background: i === 0 ? c.accent : c.dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)", color: i === 0 ? "#fff" : c.fg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack(theme.displayFont), fontWeight: 800, fontSize: 40 * u }}>
                {numbered ? i + 1 : <Icon name="check" size={44 * u} color={i === 0 ? "#fff" : c.accent} />}
              </div>
              <Body size={44 * u} color={c.fg} weight={600}>{String(it.text ?? "")}</Body>
            </SlideIn>
          ))}
        </div>
      </Content>
    </Background>
  );
}

function EventDetails({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape } = useLayout();
  const c = useOnBg(scene);
  const { theme } = useVideoCtx();
  const rows: Array<{ icon: "calendar" | "clock" | "pin"; text: string }> = [
    { icon: "calendar", text: str(scene, "date") },
    { icon: "clock", text: str(scene, "time") },
    { icon: "pin", text: str(scene, "venue") },
  ].filter((r) => r.text) as Array<{ icon: "calendar" | "clock" | "pin"; text: string }>;
  const pulse = 1 + Math.sin(frame / 7) * 0.025;
  return (
    <Background bg={scene.background}>
      <Content>
        <Display size={(isLandscape ? 100 : 108) * u} color={c.fg} style={{ marginBottom: 56 * u, maxWidth: isLandscape ? "75%" : "100%" }}>
          <AnimatedWords text={str(scene, "title")} animation="rise" highlightColor={c.accent} />
        </Display>
        <div style={{ display: "flex", flexDirection: isLandscape ? "row" : "column", gap: 24 * u, width: "100%" }}>
          {rows.map((r, i) => (
            <FadeUp key={i} delay={16 + i * 8} style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24 * u, padding: `${28 * u}px ${30 * u}px`, borderRadius: 12 * u, background: c.dark ? "rgba(255,255,255,0.08)" : "#ffffff", border: `${2 * u}px solid ${c.dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)"}` }}>
                <Icon name={r.icon} size={52 * u} color={c.accent} />
                <Body size={40 * u} color={c.fg} weight={700}>{r.text}</Body>
              </div>
            </FadeUp>
          ))}
        </div>
        {str(scene, "cta") && (
          <FadeUp delay={44} style={{ marginTop: 56 * u }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 18 * u, background: c.accent, color: "#fff", padding: `${24 * u}px ${40 * u}px`, borderRadius: 999, transform: `scale(${pulse})`, fontFamily: fontStack(theme.bodyFont), fontWeight: 800, fontSize: 38 * u }}>
              {str(scene, "cta")}
              <Icon name="arrow" size={40 * u} color="#fff" />
            </div>
          </FadeUp>
        )}
      </Content>
    </Background>
  );
}

function SplitMedia({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape, pad } = useLayout();
  const c = useOnBg(scene);
  const reveal = interpolate(frame, [0, 22], [0, 100], { ...clamp, easing: Easing.out(Easing.cubic) });
  const photoFirst = str(scene, "side", "left") === "left";
  const photo = (
    <div style={{ flex: isLandscape ? "0 0 46%" : "0 0 50%", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, clipPath: isLandscape ? `inset(0 ${100 - reveal}% 0 0)` : `inset(0 0 ${100 - reveal}% 0)` }}>
        <Photo src={str(scene, "image")} style={{ width: "100%", height: "100%", transform: `scale(${1.1 - reveal / 1000})` }} />
      </div>
    </div>
  );
  const text = (
    <div style={{ flex: 1, padding: pad, paddingTop: isLandscape ? pad * 1.6 : pad, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Eyebrow text={str(scene, "eyebrow")} color={c.fg} lineColor={c.accent} delay={10} />
      <Display size={(isLandscape ? 88 : 86) * u} color={c.fg}>
        <AnimatedWords text={str(scene, "headline")} animation="rise" delay={14} highlightColor={c.accent} />
      </Display>
      {str(scene, "body") && <FadeUp delay={30} style={{ marginTop: 30 * u }}><Body size={36 * u} color={c.soft}>{str(scene, "body")}</Body></FadeUp>}
    </div>
  );
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ flexDirection: isLandscape ? "row" : "column" }}>
        {photoFirst ? photo : text}
        {photoFirst ? text : photo}
      </AbsoluteFill>
    </Background>
  );
}

const CODE_KEYWORDS = /\b(SELECT|FROM|WHERE|GROUP|BY|ORDER|HAVING|JOIN|LEFT|RIGHT|INNER|ON|AS|COUNT|SUM|AVG|MIN|MAX|LIMIT|AND|OR|NOT|IN|IS|NULL|DISTINCT|CASE|WHEN|THEN|ELSE|END|def|return|import|from|as|for|in|if|else|elif|print|lambda|with|True|False|None)\b/g;

function CodeTyping({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape } = useLayout();
  const c = useOnBg(scene);
  const { theme } = useVideoCtx();
  const code = str(scene, "code");
  const chars = Math.floor(interpolate(frame, [14, 14 + code.length * 1.1], [0, code.length], clamp));
  const typed = code.slice(0, chars);
  const blink = Math.floor(frame / 14) % 2 === 0;
  const win = useSpring(0, { damping: 18 });
  const highlight = (line: string) => {
    const parts: Array<{ t: string; k: boolean }> = [];
    let last = 0;
    line.replace(CODE_KEYWORDS, (m, _g, offset: number) => {
      if (offset > last) parts.push({ t: line.slice(last, offset), k: false });
      parts.push({ t: m, k: true });
      last = offset + m.length;
      return m;
    });
    if (last < line.length) parts.push({ t: line.slice(last), k: false });
    return parts;
  };
  const lines = typed.split("\n");
  return (
    <Background bg={scene.background}>
      <Content>
        <FadeUp><Display size={84 * u} color={c.fg} style={{ marginBottom: 40 * u }}>{str(scene, "title")}</Display></FadeUp>
        <div style={{ width: isLandscape ? "72%" : "100%", background: "#0d1117", borderRadius: 18 * u, overflow: "hidden", transform: `translateY(${(1 - win) * 60}px)`, opacity: win, border: `${2 * u}px solid rgba(255,255,255,0.08)` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 * u, padding: `${20 * u}px ${26 * u}px`, borderBottom: `${2 * u}px solid rgba(255,255,255,0.06)` }}>
            {["#ff5f57", "#febc2e", "#28c840"].map((col) => <div key={col} style={{ width: 20 * u, height: 20 * u, borderRadius: "50%", background: col }} />)}
            <div style={{ marginLeft: "auto", fontFamily: fontStack("JetBrains Mono"), fontSize: 24 * u, color: theme.primary, fontWeight: 700 }}>{str(scene, "language")}</div>
          </div>
          <div style={{ padding: `${30 * u}px ${34 * u}px`, fontFamily: fontStack("JetBrains Mono"), fontSize: (isLandscape ? 38 : 34) * u, lineHeight: 1.6, color: "#e6edf3", minHeight: 300 * u, whiteSpace: "pre-wrap" }}>
            {lines.map((ln, i) => (
              <div key={i}>
                {highlight(ln).map((p, j) => <span key={j} style={{ color: p.k ? theme.primary : undefined, fontWeight: p.k ? 700 : 400 }}>{p.t}</span>)}
                {i === lines.length - 1 && <span style={{ opacity: blink ? 1 : 0, color: theme.primary }}>▍</span>}
                {ln === "" && " "}
              </div>
            ))}
          </div>
        </div>
        {str(scene, "caption") && <FadeUp delay={20 + code.length * 1.1} style={{ marginTop: 40 * u, maxWidth: isLandscape ? "70%" : "100%" }}><Body size={36 * u} color={c.soft}>{str(scene, "caption")}</Body></FadeUp>}
      </Content>
    </Background>
  );
}

function Certificate({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape } = useLayout();
  const color = useColor();
  const { theme } = useVideoCtx();
  const p = useSpring(4, { damping: 18, stiffness: 90 });
  const shine = interpolate(frame, [30, 70], [-60, 160], clamp);
  const gold = color("$accent");
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", perspective: 1600 }}>
        <div style={{ width: isLandscape ? "64%" : "84%", aspectRatio: isLandscape ? "1.414" : "0.78", background: "#fffdf8", borderRadius: 10 * u, position: "relative", overflow: "hidden", transform: `rotateX(${(1 - p) * 40}deg) scale(${interpolate(p, [0, 1], [0.8, 1])})`, opacity: Math.min(1, p * 1.5), boxShadow: "0 40px 80px rgba(0,0,0,0.35)" }}>
          <div style={{ position: "absolute", inset: 26 * u, border: `${3 * u}px solid ${gold}` }} />
          <div style={{ position: "absolute", inset: 40 * u, border: `${1.5 * u}px solid ${gold}` }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, width: "30%", left: `${shine}%`, background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 100%)" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 90 * u }}>
            <LogoChip size={110 * u} onDark={false} style={{ marginBottom: 30 * u }} />
            <FadeUp delay={14}><div style={{ fontFamily: fontStack(theme.bodyFont), fontSize: 28 * u, letterSpacing: 6 * u, textTransform: "uppercase", color: theme.primary, fontWeight: 700 }}>{str(scene, "eyebrow")}</div></FadeUp>
            <FadeUp delay={22}><div style={{ fontFamily: fontStack("Nunito"), fontSize: (isLandscape ? 120 : 112) * u, color: "#1b1b1b", marginTop: 20 * u, lineHeight: 1.1 }}>{str(scene, "name")}</div></FadeUp>
            <DrawLine delay={30} width={420 * u} thickness={2 * u} color={gold} style={{ margin: `${14 * u}px 0 ${24 * u}px` }} />
            <FadeUp delay={34}><div style={{ fontFamily: fontStack("Nunito"), fontSize: 40 * u, color: "#2a2a2a", fontWeight: 600 }}>{str(scene, "achievement")}</div></FadeUp>
            <FadeUp delay={40}><div style={{ fontFamily: fontStack(theme.bodyFont), fontSize: 26 * u, color: "#666", marginTop: 16 * u }}>{str(scene, "detail")}</div></FadeUp>
          </div>
        </div>
      </AbsoluteFill>
    </Background>
  );
}

function LogoOutro({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const c = useOnBg(scene);
  const { doc, theme } = useVideoCtx();
  const pop = useSpring(0, { damping: 12, stiffness: 120 });
  const ring = interpolate(frame, [4, 40], [0.6, 1.8], clamp);
  const ringO = interpolate(frame, [4, 40], [0.6, 0], clamp);
  return (
    <Background bg={scene.background}>
      <Content align="center" style={{ paddingTop: 0 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 320 * u, height: 320 * u }}>
          <div style={{ position: "absolute", width: 300 * u, height: 300 * u, borderRadius: "50%", border: `${4 * u}px solid ${c.accent}`, transform: `scale(${ring})`, opacity: ringO }} />
          <div style={{ transform: `scale(${pop}) rotate(${(1 - pop) * -12}deg)` }}>
            {doc.logo !== "none" ? <LogoChip size={280 * u} onDark={c.dark} /> : <Display size={120 * u} color={c.fg}>DAWB</Display>}
          </div>
        </div>
        <FadeUp delay={16} style={{ marginTop: 50 * u }}><Display size={80 * u} color={c.fg}>{str(scene, "cta")}</Display></FadeUp>
        <FadeUp delay={24} style={{ marginTop: 22 * u }}><div style={{ fontFamily: fontStack(theme.bodyFont), fontSize: 38 * u, fontWeight: 700, color: c.accent, letterSpacing: 2 * u }}>{str(scene, "url")}</div></FadeUp>
        {bool(scene, "showHandle", true) && doc.handle && <FadeUp delay={30} style={{ marginTop: 14 * u }}><Body size={30 * u} color={c.soft}>{doc.handle}</Body></FadeUp>}
      </Content>
    </Background>
  );
}

export const SCENE_COMPONENTS: Record<SceneType, React.FC<Props>> = {
  ...NEW_SCENES,
  ...SCENES3,
  ...SCENES4,
  "kinetic-title": KineticTitle,
  "photo-hero": PhotoHero,
  "lower-third": LowerThird,
  "speaker-card": SpeakerCard,
  countdown: Countdown,
  "stat-counter": StatCounter,
  "bar-chart": BarChart,
  quote: Quote,
  celebration: Celebration,
  "list-reveal": ListReveal,
  "event-details": EventDetails,
  "split-media": SplitMedia,
  "code-typing": CodeTyping,
  certificate: Certificate,
  "logo-outro": LogoOutro,
};

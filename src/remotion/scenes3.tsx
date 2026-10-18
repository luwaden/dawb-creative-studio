import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "@/lib/video/types";
import { fontStack } from "@/lib/fonts";
import { useLayout } from "./context";
import { DottedOrbit } from "./fx";
import { Background, Icon, Photo } from "./primitives";
import { AnimatedChart, QrCode, type ChartDatum, type VideoChartKind } from "./charts";
import { KineticLine, Pill, useTone } from "./scenes2";
import { TRAINING_TOOLS, type TrainingTool } from "@/lib/training";
import { rampColor } from "@/lib/charts";

type Props = { scene: Scene };
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const str = (s: Scene, k: string, d = "") => (typeof s.props[k] === "string" ? (s.props[k] as string) : d);
const list = (s: Scene, k: string) => (Array.isArray(s.props[k]) ? (s.props[k] as Array<Record<string, unknown>>) : []);

function useIn(delay: number, damping = 200) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
}

function Rise({ delay = 0, children, style }: { delay?: number; children: ReactNode; style?: CSSProperties }) {
  const p = useIn(delay);
  const { u } = useLayout();
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 34 * u}px)`, ...style }}>{children}</div>;
}

// ─────────────── Data chart ───────────────
function DataChart({ scene }: Props) {
  const { u, isLandscape, isPortrait, width, height } = useLayout();
  const t = useTone(scene);
  const kind = str(scene, "kind", "column") as VideoChartKind;
  const data: ChartDatum[] = list(scene, "items").slice(0, 40).map((it) => ({ label: String(it.label ?? ""), value: Number(it.value) || 0, x: it.x === undefined || it.x === "" ? undefined : Number(it.x) }));
  const pad = (isLandscape ? 110 : 84) * u;
  const title = str(scene, "title");
  const insight = str(scene, "insight");
  const source = str(scene, "source");
  // Tall maps (Africa) sit beside the title on square/feed frames so they can use the full height.
  const side = isLandscape || (kind === "map" && str(scene, "map") === "africa" && !isPortrait);
  const chartW = side ? width * (isLandscape ? 0.56 : 0.6) - pad : width - pad * 2;
  const reserved = (isPortrait ? 760 : 470) * u + (insight ? (isPortrait ? 170 : 120) * u : 0);
  const chartH = side ? height - (isLandscape ? 360 : 300) * u : Math.max(360 * u, height - reserved);
  const muted = t.light ? "rgba(7,28,36,0.6)" : "rgba(255,255,255,0.7)";
  const accent = t.isCyan ? "#FFFFFF" : "#0097B2";
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: pad, paddingTop: (isPortrait ? 230 : 190) * u, display: "flex", flexDirection: side ? "row" : "column", gap: (side ? 50 : 40) * u }}>
        <div style={{ flex: side ? 1 : undefined, display: "flex", flexDirection: "column", justifyContent: side ? "center" : "flex-start", gap: 22 * u }}>
          <div><Pill text={str(scene, "eyebrow")} bg={t.isCyan ? "#071C24" : "#0097B2"} color="#FFFFFF" u={u} /></div>
          <KineticLine text={title} size={(side && !isLandscape ? 60 : title.length > 40 ? 64 : 80) * u} color={t.fg} delay={4} stagger={0.7} font="Nunito" />
          {side && insight && <Insight text={insight} u={u} fg={t.fg} accent={accent} light={t.light} />}
          {side && source && <Rise delay={50}><div style={{ fontFamily: fontStack("IBM Plex Sans"), fontSize: 22 * u, color: muted }}>{source}</div></Rise>}
        </div>
        <div style={{ width: chartW, height: chartH, alignSelf: side ? "center" : "stretch", marginTop: side ? 0 : 10 * u }}>
          <AnimatedChart kind={kind} data={data} width={chartW} height={chartH} u={u} unit={str(scene, "unit")} map={str(scene, "map", "nigeria") as "nigeria" | "africa"} light={t.light} accent={accent} ink={t.fg} muted={muted} delay={14} font="IBM Plex Sans" xTitle={str(scene, "xTitle")} yTitle={str(scene, "yTitle")} />
        </div>
        {!side && insight && <Insight text={insight} u={u} fg={t.fg} accent={accent} light={t.light} />}
        {!side && source && <Rise delay={56}><div style={{ fontFamily: fontStack("IBM Plex Sans"), fontSize: 22 * u, color: muted }}>{source}</div></Rise>}
      </AbsoluteFill>
    </Background>
  );
}

function Insight({ text, u, fg, accent, light }: { text: string; u: number; fg: string; accent: string; light: boolean }) {
  const frame = useCurrentFrame();
  const bar = interpolate(frame, [44, 64], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  return (
    <Rise delay={44}>
      <div style={{ display: "flex", gap: 24 * u, alignItems: "stretch", background: light ? "rgba(0,151,178,0.07)" : "rgba(255,255,255,0.07)", borderRadius: 20 * u, padding: `${24 * u}px ${28 * u}px` }}>
        <div style={{ width: 6 * u, borderRadius: 3 * u, background: accent, transform: `scaleY(${bar})`, transformOrigin: "top" }} />
        <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 800, fontSize: 36 * u, lineHeight: 1.25, color: fg }}>{text}</div>
      </div>
    </Rise>
  );
}

// ─────────────── QR call to action (questionnaire) ───────────────
function QrCall({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape, isPortrait } = useLayout();
  const t = useTone(scene);
  const title = str(scene, "title");
  const qrSize = (isLandscape ? 480 : isPortrait ? 560 : 420) * u;
  const cardP = useIn(16, 14);
  const bracket = 1 + 0.03 * Math.sin(frame / 7);
  const accent = t.isCyan ? "#FFFFFF" : "#0097B2";
  const details = [
    { icon: "clock" as const, text: str(scene, "duration") },
    { icon: "calendar" as const, text: str(scene, "deadline") },
    { icon: "check" as const, text: str(scene, "privacy") },
  ].filter((d) => d.text);
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: 90 * u, paddingTop: (isPortrait ? 240 : 190) * u, display: "flex", flexDirection: isLandscape ? "row" : "column", alignItems: isLandscape ? "center" : "flex-start", gap: (isLandscape ? 90 : 50) * u }}>
        <div style={{ flex: isLandscape ? 1 : undefined, display: "flex", flexDirection: "column", gap: 26 * u }}>
          <div><Pill text={str(scene, "eyebrow")} bg={t.isCyan ? "#071C24" : "#0097B2"} color="#FFFFFF" u={u} /></div>
          <KineticLine text={title} size={(title.length > 36 ? 70 : 88) * u} color={t.fg} delay={4} stagger={0.8} font="Nunito" />
          {str(scene, "message") && <Rise delay={28}><div style={{ fontFamily: fontStack("Nunito Sans"), fontSize: 34 * u, lineHeight: 1.4, color: t.soft, maxWidth: 820 * u }}>{str(scene, "message")}</div></Rise>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 * u }}>
            {details.map((d, i) => (
              <Rise key={i} delay={40 + i * 5}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 * u, border: `${2 * u}px dotted ${t.light ? "rgba(7,28,36,0.3)" : "rgba(255,255,255,0.4)"}`, borderRadius: 999, padding: `${12 * u}px ${22 * u}px`, fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 26 * u, color: t.fg }}>
                  <Icon name={d.icon} size={28 * u} color={accent} /> {d.text}
                </div>
              </Rise>
            ))}
          </div>
        </div>
        <div style={{ alignSelf: "center", marginTop: isLandscape ? 0 : 30 * u, display: "flex", flexDirection: "column", alignItems: "center", gap: 24 * u, transform: `scale(${0.85 + 0.15 * cardP})`, opacity: cardP }}>
          <div style={{ position: "relative", padding: 30 * u, background: "#FFFFFF", borderRadius: 40 * u, boxShadow: t.light ? `0 ${30 * u}px ${70 * u}px rgba(7,28,36,0.12)` : "none" }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ position: "absolute", width: 70 * u, height: 70 * u, borderColor: accent === "#FFFFFF" ? "#071C24" : accent, borderStyle: "solid", borderWidth: 0, ...(i < 2 ? { top: -14 * u, borderTopWidth: 8 * u } : { bottom: -14 * u, borderBottomWidth: 8 * u }), ...(i % 2 === 0 ? { left: -14 * u, borderLeftWidth: 8 * u, borderTopLeftRadius: i === 0 ? 30 * u : 0, borderBottomLeftRadius: i === 2 ? 30 * u : 0 } : { right: -14 * u, borderRightWidth: 8 * u, borderTopRightRadius: i === 1 ? 30 * u : 0, borderBottomRightRadius: i === 3 ? 30 * u : 0 }), transform: `scale(${bracket})` }} />
            ))}
            <QrCode value={str(scene, "link")} size={qrSize} u={u} delay={20} />
          </div>
          <Rise delay={50}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: 36 * u, color: t.fg }}>{str(scene, "cta")}</div>
              <div style={{ fontFamily: fontStack("IBM Plex Mono"), fontWeight: 500, fontSize: 26 * u, color: t.soft, marginTop: 8 * u }}>{str(scene, "linkText")}</div>
            </div>
          </Rise>
        </div>
      </AbsoluteFill>
    </Background>
  );
}

// ─────────────── Team (research team / facilitators) ───────────────
function Team({ scene }: Props) {
  const { u, isLandscape, isPortrait, width } = useLayout();
  const t = useTone(scene);
  const members = list(scene, "members").slice(0, 6);
  const photos = [1, 2, 3, 4, 5, 6].map((i) => str(scene, `photo${i}`));
  const spotlight = str(scene, "layout", "grid") === "spotlight" || members.length === 1;
  const accent = t.isCyan ? "#FFFFFF" : "#0097B2";
  const cardBg = t.light ? "#FFFFFF" : t.isCyan ? "rgba(7,28,36,0.2)" : "rgba(255,255,255,0.06)";
  const border = t.light ? "rgba(7,28,36,0.1)" : "rgba(255,255,255,0.16)";
  if (spotlight) {
    const m = members[0] ?? {};
    const size = (isLandscape ? 560 : 620) * u;
    return (
      <Background bg={scene.background}>
        <AbsoluteFill style={{ padding: 90 * u, paddingTop: (isPortrait ? 250 : 190) * u, display: "flex", flexDirection: isLandscape ? "row" : "column", alignItems: isLandscape ? "center" : "flex-start", gap: 70 * u }}>
          <SpotPhoto src={photos[0]} size={size} accent={accent} u={u} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 * u, flex: 1 }}>
            <div><Pill text={str(scene, "title")} bg={t.isCyan ? "#071C24" : "#0097B2"} color="#FFFFFF" u={u} delay={10} /></div>
            <KineticLine text={String(m.name ?? "")} size={(String(m.name ?? "").length > 18 ? 84 : 104) * u} color={t.fg} delay={14} stagger={1.2} font="Nunito" />
            <Rise delay={34}><div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 700, fontSize: 40 * u, color: t.fg }}>{String(m.role ?? "")}</div></Rise>
            <Rise delay={42}><div style={{ display: "inline-flex", alignItems: "center", gap: 12 * u, fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 30 * u, color: t.soft }}><Icon name="pin" size={34 * u} color={accent} />{String(m.location ?? "")}</div></Rise>
            {str(scene, "subtitle") && <Rise delay={52}><div style={{ fontFamily: fontStack("Nunito Sans"), fontSize: 30 * u, lineHeight: 1.45, color: t.soft, maxWidth: 820 * u }}>{str(scene, "subtitle")}</div></Rise>}
          </div>
        </AbsoluteFill>
      </Background>
    );
  }
  const cols = isLandscape ? Math.min(4, Math.max(3, members.length)) : members.length > 4 ? (isPortrait ? 2 : 3) : 2;
  const gap = 22 * u;
  const cardW = (width - 180 * u - gap * (cols - 1)) / cols;
  const photo = isPortrait && members.length <= 4 ? cardW * 0.66 : Math.min(cardW * 0.5, (isPortrait ? 230 : 170) * u);
  const big = isPortrait && members.length <= 4 ? 1.25 : 1;
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: 90 * u, paddingTop: (isPortrait ? 230 : 180) * u, display: "flex", flexDirection: "column", gap: 34 * u }}>
        <div>
          <KineticLine text={str(scene, "title")} size={(isLandscape ? 74 : 84) * u} color={t.fg} delay={2} stagger={0.9} font="Nunito" />
          {str(scene, "subtitle") && <Rise delay={16}><div style={{ fontFamily: fontStack("Nunito Sans"), fontSize: 30 * u, color: t.soft, marginTop: 12 * u }}>{str(scene, "subtitle")}</div></Rise>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${cardW}px)`, gap }}>
          {members.map((m, i) => (
            <Rise key={i} delay={20 + i * 7}>
              <div style={{ background: cardBg, border: `${1.5 * u}px solid ${border}`, borderRadius: 28 * u, padding: 26 * u, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 * u }}>
                <div style={{ position: "relative", width: photo, height: photo, marginBottom: 10 * u }}>
                  <DottedOrbit cx={photo / 2} cy={photo / 2} r={photo / 2 + 12 * u} color={accent} opacity={0.8} dot={3.5 * u} gap={11 * u} rotate={0.3} />
                  <Photo src={photos[i]} circle style={{ width: photo, height: photo }} />
                </div>
                <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: 36 * u * big, color: t.fg, lineHeight: 1.1 }}>{String(m.name ?? "")}</div>
                <div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 700, fontSize: 25 * u * big, color: t.fg, opacity: 0.85 }}>{String(m.role ?? "")}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 * u, fontFamily: fontStack("Nunito Sans"), fontWeight: 700, fontSize: 23 * u * big, color: t.soft }}><Icon name="pin" size={24 * u * big} color={accent} />{String(m.location ?? "")}</div>
              </div>
            </Rise>
          ))}
        </div>
      </AbsoluteFill>
    </Background>
  );
}

function SpotPhoto({ src, size, accent, u }: { src: string; size: number; accent: string; u: number }) {
  const p = useIn(4, 16);
  const frame = useCurrentFrame();
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, transform: `scale(${0.8 + 0.2 * p})`, opacity: p }}>
      <DottedOrbit cx={size / 2} cy={size / 2} r={size / 2 + 34 * u} color={accent} opacity={0.9} dot={6 * u} gap={18 * u} rotate={0.5} />
      <div style={{ position: "absolute", inset: -60 * u, borderRadius: "50%", border: `${2 * u}px solid ${accent}`, opacity: 0.25, transform: `rotate(${frame * 0.4}deg)` }} />
      <Photo src={src} circle style={{ width: size, height: size }} />
    </div>
  );
}

// ─────────────── Training announcement (tool courses) ───────────────

function Training({ scene }: Props) {
  const { u, isLandscape, isPortrait, width } = useLayout();
  const t = useTone(scene);
  const toolKey = (str(scene, "tool", "excel") as TrainingTool) in TRAINING_TOOLS ? (str(scene, "tool", "excel") as TrainingTool) : "excel";
  const tool = TRAINING_TOOLS[toolKey];
  const title = str(scene, "title") || tool.name;
  const modules = list(scene, "modules").map((m) => String(m.text ?? "")).filter(Boolean).slice(0, 6);
  // Deep track colours are lifted toward white on dark backgrounds for contrast.
  const accent = t.isCyan ? "#FFFFFF" : t.light ? tool.accent : rampColor(tool.accent, "#FFFFFF", 0.62);
  const longest = Math.max(4, ...title.split("\n").map((l) => l.length));
  const titleSize = Math.min((isPortrait ? 150 : 120) * u, (isLandscape ? width * 0.45 : width - 180 * u) / (longest * 0.62));
  const panelW = isLandscape ? width * 0.42 : width - 180 * u;
  const panelH = (isLandscape ? 560 : isPortrait ? 700 : 360) * u;
  const tiles = [
    { icon: "calendar" as const, label: "Starts", value: str(scene, "date") },
    { icon: "clock" as const, label: "Duration", value: str(scene, "duration") },
    { icon: "pin" as const, label: "Mode", value: str(scene, "mode") },
  ].filter((x) => x.value);
  const tileBg = t.light ? "#FFFFFF" : t.isCyan ? "rgba(7,28,36,0.22)" : "rgba(255,255,255,0.06)";
  const tileBorder = t.light ? "rgba(7,28,36,0.1)" : "rgba(255,255,255,0.16)";
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: 90 * u, paddingTop: (isPortrait ? 230 : 180) * u, display: "flex", flexDirection: isLandscape ? "row" : "column", gap: (isLandscape ? 70 : 34) * u }}>
        <div style={{ flex: isLandscape ? 1 : undefined, display: "flex", flexDirection: "column", gap: 20 * u, justifyContent: isLandscape ? "center" : "flex-start" }}>
          <div><Pill text={str(scene, "eyebrow")} bg={t.isCyan ? "#071C24" : accent} color="#FFFFFF" u={u} /></div>
          <KineticLine text={title} size={titleSize} color={t.fg} delay={4} stagger={1.4} font="Nunito" />
          {str(scene, "subtitle") && <Rise delay={22}><div style={{ fontFamily: fontStack("Nunito Sans"), fontSize: 34 * u, lineHeight: 1.35, color: t.soft, maxWidth: 860 * u }}>{str(scene, "subtitle")}</div></Rise>}
          {modules.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 * u, marginTop: 6 * u }}>
              {modules.map((m, i) => (
                <Rise key={i} delay={30 + i * 4}><div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 24 * u, color: t.fg, border: `${2 * u}px solid ${t.light ? "rgba(7,28,36,0.14)" : "rgba(255,255,255,0.22)"}`, borderRadius: 999, padding: `${10 * u}px ${20 * u}px` }}>{m}</div></Rise>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 * u, width: isLandscape ? panelW : undefined, alignSelf: isLandscape ? "center" : "stretch" }}>
          <Rise delay={12}><ToolMotif motif={tool.motif} w={panelW} h={panelH} u={u} accent={accent} light={t.light} cyan={t.isCyan} /></Rise>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${tiles.length || 1}, 1fr)`, gap: 14 * u }}>
            {tiles.map((x, i) => (
              <Rise key={i} delay={44 + i * 5}>
                <div style={{ background: tileBg, border: `${1.5 * u}px solid ${tileBorder}`, borderRadius: 20 * u, padding: 20 * u }}>
                  <Icon name={x.icon} size={32 * u} color={accent} />
                  <div style={{ fontFamily: fontStack("Nunito Sans"), fontSize: 18 * u, fontWeight: 800, letterSpacing: 2 * u, textTransform: "uppercase", color: t.soft, marginTop: 10 * u }}>{x.label}</div>
                  <div style={{ fontFamily: fontStack("Nunito"), fontSize: 28 * u, fontWeight: 900, color: t.fg, lineHeight: 1.1, marginTop: 4 * u }}>{x.value}</div>
                </div>
              </Rise>
            ))}
          </div>
          {str(scene, "cta") && (
            <Rise delay={60}><div style={{ display: "inline-flex", alignItems: "center", gap: 14 * u, background: t.isCyan ? "#071C24" : "#0097B2", color: "#FFFFFF", borderRadius: 999, padding: `${20 * u}px ${36 * u}px`, fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: 32 * u }}>{str(scene, "cta")} <Icon name="arrow" size={32 * u} color="#FFFFFF" /></div></Rise>
          )}
        </div>
      </AbsoluteFill>
    </Background>
  );
}

/** Original, generic illustrations of each discipline — no third-party logos. */
function ToolMotif({ motif, w, h, u, accent, light, cyan }: { motif: string; w: number; h: number; u: number; accent: string; light: boolean; cyan: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ink = light ? "#071C24" : "#FFFFFF";
  const panel = light ? "#F4F8F9" : cyan ? "rgba(7,28,36,0.28)" : "#0B242D";
  const line = light ? "rgba(7,28,36,0.1)" : "rgba(255,255,255,0.12)";
  const mono = fontStack("JetBrains Mono");
  const sp = (d: number) => spring({ frame: frame - d, fps, config: { damping: 200 } });
  const type = (code: string, start: number, cps = 1.6) => code.slice(0, Math.max(0, Math.floor((frame - start) * cps)));
  const box: CSSProperties = { width: w, height: h, borderRadius: 28 * u, background: panel, border: `${1.5 * u}px solid ${line}`, overflow: "hidden", position: "relative" };
  const codeStyle: CSSProperties = { fontFamily: mono, fontSize: Math.min(34 * u, w / 26), lineHeight: 1.7, color: ink, whiteSpace: "pre", padding: 34 * u };
  const dots = <div style={{ display: "flex", gap: 10 * u, padding: `${22 * u}px ${28 * u}px 0` }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 14 * u, height: 14 * u, borderRadius: "50%", background: line }} />)}</div>;
  const caret = <span style={{ display: "inline-block", width: 14 * u, height: 32 * u, background: accent, verticalAlign: "middle", opacity: Math.floor(frame / 8) % 2 }} />;

  if (motif === "sql" || motif === "python" || motif === "r") {
    const code =
      motif === "sql"
        ? "SELECT state,\n       COUNT(*) AS applicants\nFROM applications\nGROUP BY state\nORDER BY applicants DESC;"
        : motif === "python"
          ? "import pandas as pd\n\ndf = pd.read_csv(\"survey.csv\")\ndf.groupby(\"gender\").size()"
          : "library(ggplot2)\n\nggplot(df, aes(age, score)) +\n  geom_point() +\n  geom_smooth()";
    const kw = motif === "sql" ? /\b(?:SELECT|FROM|GROUP BY|ORDER BY|AS|DESC|COUNT)\b/g : motif === "python" ? /\b(?:import|as)\b/g : /\b(?:library|ggplot|aes|geom_point|geom_smooth)\b/g;
    const shown = type(code, 14, 1.4);
    const parts = shown.split(kw);
    const kws = shown.match(kw) ?? [];
    return (
      <div style={box}>
        {dots}
        <div style={codeStyle}>
          {parts.map((p, i) => (
            <span key={i}>{p}{kws[i] && <span style={{ color: accent, fontWeight: 700 }}>{kws[i]}</span>}</span>
          ))}
          {caret}
        </div>
      </div>
    );
  }
  if (motif === "sheet") {
    const cols = ["A", "B", "C", "D"];
    const rows = 6;
    const cw = (w - 70 * u) / cols.length;
    const rh = (h - 120 * u) / (rows + 1);
    const formula = type("=SUM(B2:B6)", 10, 0.8);
    return (
      <div style={box}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 * u, padding: `${18 * u}px ${24 * u}px`, borderBottom: `${1.5 * u}px solid ${line}`, fontFamily: mono, fontSize: 26 * u, color: ink }}>
          <span style={{ fontWeight: 700, color: accent, fontStyle: "italic" }}>fx</span>{formula}{caret}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `${50 * u}px repeat(${cols.length}, ${cw}px)`, padding: `0 ${10 * u}px` }}>
          {["", ...cols].map((c, i) => <div key={`h${i}`} style={{ height: rh, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 20 * u, color: ink, opacity: 0.5 }}>{c}</div>)}
          {Array.from({ length: rows }).flatMap((_, r) => [
            <div key={`r${r}`} style={{ height: rh, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 20 * u, color: ink, opacity: 0.5 }}>{r + 1}</div>,
            ...cols.map((_, c) => {
              const p = sp(16 + (r * cols.length + c) * 1.2);
              const sel = c === 1 && r >= 1 && frame > 40;
              return <div key={`c${r}-${c}`} style={{ height: rh, border: `${1 * u}px solid ${line}`, background: sel ? `${accent}26` : "transparent", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: `0 ${10 * u}px`, fontFamily: mono, fontSize: 20 * u, color: ink, opacity: p }}>{r === 0 ? ["Region", "Count", "Share", "Trend"][c] : [["North", "214", "18%", "▲"], ["South", "388", "33%", "▲"], ["East", "197", "17%", "▼"], ["West", "251", "21%", "▲"], ["FCT", "121", "11%", "▲"]][r - 1][c]}</div>;
            }),
          ])}
        </div>
      </div>
    );
  }
  if (motif === "dashboard" || motif === "mosaic") {
    const pad = 26 * u;
    if (motif === "mosaic") {
      const tiles = [
        [0, 0, 0.58, 0.6], [0.6, 0, 0.4, 0.34], [0.6, 0.36, 0.4, 0.24], [0, 0.62, 0.32, 0.38], [0.34, 0.62, 0.3, 0.38], [0.66, 0.62, 0.34, 0.38],
      ];
      const ops = [1, 0.7, 0.45, 0.55, 0.3, 0.8];
      return (
        <div style={{ ...box, padding: pad }}>
          <div style={{ position: "relative", width: w - pad * 2, height: h - pad * 2 }}>
            {tiles.map(([x, y, tw, th], i) => {
              const p = sp(12 + i * 5);
              return <div key={i} style={{ position: "absolute", left: `${x * 100}%`, top: `${y * 100}%`, width: `${tw * 100}%`, height: `${th * 100}%`, background: i % 3 === 2 ? ink : accent, opacity: ops[i] * p, borderRadius: 14 * u, transform: `scale(${0.7 + 0.3 * p})` }} />;
            })}
          </div>
        </div>
      );
    }
    const bars = [0.45, 0.7, 0.55, 0.85, 0.65, 1];
    return (
      <div style={{ ...box, padding: pad, display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto 1fr", gap: 18 * u }}>
        {["Applicants", "Completion"].map((k, i) => (
          <div key={k} style={{ background: light ? "#FFFFFF" : "rgba(255,255,255,0.06)", borderRadius: 18 * u, padding: 18 * u, opacity: sp(10 + i * 6) }}>
            <div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 18 * u, letterSpacing: 2 * u, textTransform: "uppercase", color: ink, opacity: 0.55 }}>{k}</div>
            <div style={{ height: 14 * u, borderRadius: 7 * u, background: line, marginTop: 14 * u, overflow: "hidden" }}><div style={{ height: "100%", width: `${(i ? 72 : 88) * sp(16 + i * 6)}%`, background: i ? ink : accent, borderRadius: 7 * u }} /></div>
          </div>
        ))}
        <div style={{ gridColumn: "1 / span 2", display: "flex", alignItems: "flex-end", gap: 16 * u, padding: `0 ${10 * u}px` }}>
          {bars.map((b, i) => <div key={i} style={{ flex: 1, height: `${b * 100 * sp(20 + i * 4)}%`, background: i === bars.length - 1 ? accent : light ? "rgba(7,28,36,0.18)" : "rgba(255,255,255,0.25)", borderRadius: `${8 * u}px ${8 * u}px 0 0` }} />)}
        </div>
      </div>
    );
  }
  if (motif === "bell") {
    const n = 13;
    const bw = (w - 80 * u) / n;
    const draw = interpolate(frame, [30, 70], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) });
    const curve = Array.from({ length: 60 }, (_, i) => {
      const x = i / 59;
      const y = Math.exp(-((x - 0.5) ** 2) / (2 * 0.16 ** 2));
      return `${i ? "L" : "M"}${40 * u + x * (w - 80 * u)},${h - 60 * u - y * (h - 150 * u)}`;
    }).join("");
    return (
      <div style={box}>
        <svg width={w} height={h} style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: n }).map((_, i) => {
            const x = (i + 0.5) / n;
            const y = Math.exp(-((x - 0.5) ** 2) / (2 * 0.16 ** 2)) * (0.85 + 0.15 * Math.sin(i * 2.1));
            const bh = y * (h - 160 * u) * sp(10 + i * 2);
            return <rect key={i} x={40 * u + i * bw + 2 * u} y={h - 60 * u - bh} width={bw - 4 * u} height={bh} rx={4 * u} fill={accent} opacity={0.35} />;
          })}
          <path d={curve} fill="none" stroke={ink} strokeWidth={5 * u} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
          <line x1={40 * u} x2={w - 40 * u} y1={h - 60 * u} y2={h - 60 * u} stroke={line} strokeWidth={2 * u} />
        </svg>
        <div style={{ position: "absolute", left: 30 * u, top: 26 * u, display: "flex", gap: 10 * u }}>
          {["Descriptives", "Crosstabs", "Regression"].map((c, i) => <span key={c} style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 20 * u, color: ink, background: light ? "#FFFFFF" : "rgba(255,255,255,0.08)", borderRadius: 999, padding: `${6 * u}px ${14 * u}px`, opacity: sp(40 + i * 6) }}>{c}</span>)}
        </div>
      </div>
    );
  }
  if (motif === "doc") {
    const widths = [0.9, 0.96, 0.84, 0.92, 0.6, 0, 0.94, 0.88, 0.7];
    return (
      <div style={{ ...box, padding: 40 * u }}>
        <div style={{ fontFamily: fontStack("Fraunces"), fontWeight: 600, fontSize: 44 * u, color: ink, lineHeight: 1.1 }}>{type("Writing that gets read.", 10, 1)}{frame < 40 && caret}</div>
        <div style={{ marginTop: 26 * u, display: "flex", flexDirection: "column", gap: 16 * u }}>
          {widths.map((wd, i) => <div key={i} style={{ height: wd ? 12 * u : 8 * u, width: `${wd * 100 * interpolate(frame - 36 - i * 4, [0, 14], [0, 1], cl)}%`, borderRadius: 6 * u, background: i === 0 ? accent : line }} />)}
        </div>
      </div>
    );
  }
  // survey / research
  const items = ["Define the question", "Design the questionnaire", "Collect & clean data", "Analyse & report"];
  return (
    <div style={{ ...box, padding: 36 * u, display: "flex", flexDirection: "column", justifyContent: "center", gap: 22 * u }}>
      {items.map((it, i) => {
        const p = sp(14 + i * 9);
        const done = frame > 30 + i * 9;
        return (
          <div key={it} style={{ display: "flex", alignItems: "center", gap: 20 * u, opacity: p, transform: `translateX(${(1 - p) * 30 * u}px)` }}>
            <div style={{ width: 46 * u, height: 46 * u, borderRadius: 12 * u, border: `${3 * u}px solid ${done ? accent : line}`, background: done ? accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{done && <Icon name="check" size={28 * u} color={light ? "#FFFFFF" : "#071C24"} />}</div>
            <span style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 30 * u, color: ink }}>{it}</span>
          </div>
        );
      })}
    </div>
  );
}

export const SCENES3 = { "data-chart": DataChart, "qr-call": QrCall, team: Team, training: Training };

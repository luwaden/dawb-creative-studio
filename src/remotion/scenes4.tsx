import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "@/lib/video/types";
import { fontStack } from "@/lib/fonts";
import { colName, fmtCell, isSpreadsheetTool, lessonGrid, parseTable, progressFraction } from "@/lib/lessons";
import { useLayout } from "./context";
import { DottedOrbit } from "./fx";
import { Background, Icon, Photo } from "./primitives";
import { KineticLine, Pill, useTone } from "./scenes2";

type Props = { scene: Scene };
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const str = (s: Scene, k: string, d = "") => (typeof s.props[k] === "string" ? (s.props[k] as string) : d);

function useIn(delay: number, damping = 200) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
}

function Rise({ delay = 0, children, style }: { delay?: number; children: ReactNode; style?: CSSProperties }) {
  const p = useIn(delay);
  const { u } = useLayout();
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 30 * u}px)`, ...style }}>{children}</div>;
}

/** Text that appears word by word. */
function WordReveal({ text, start, perWord, style }: { text: string; start: number; perWord: number; style: CSSProperties }) {
  const frame = useCurrentFrame();
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <div style={style}>
      {words.map((w, i) => {
        const o = interpolate(frame, [start + i * perWord, start + i * perWord + 8], [0.18, 1], cl);
        return (
          <span key={i} style={{ opacity: o }}>
            {w}{" "}
          </span>
        );
      })}
    </div>
  );
}

/** Portrait revealed by an expanding circle, inside a rotating dotted orbit. */
function RevealPhoto({ src, size, accent, delay = 0, shape = "circle" }: { src: string; size: number; accent: string; delay?: number; shape?: "circle" | "arch" }) {
  const frame = useCurrentFrame();
  const { u } = useLayout();
  const p = interpolate(frame - delay, [0, 26], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) });
  const h = shape === "arch" ? size * 1.25 : size;
  const clip = shape === "arch" ? `inset(${(1 - p) * 100}% 0 0 0 round ${size / 2}px ${size / 2}px ${24 * u}px ${24 * u}px)` : `circle(${p * 50}% at 50% 50%)`;
  return (
    <div style={{ position: "relative", width: size, height: h, flexShrink: 0 }}>
      {shape === "circle" && <DottedOrbit cx={size / 2} cy={size / 2} r={size / 2 + 30 * u} color={accent} opacity={0.9 * p} dot={5 * u} gap={16 * u} rotate={0.45} />}
      <div style={{ width: size, height: h, clipPath: clip }}>
        <Photo src={src} circle={shape === "circle"} radius={shape === "arch" ? size / 2 : 0} style={{ width: size, height: h, borderRadius: shape === "arch" ? `${size / 2}px ${size / 2}px ${24 * u}px ${24 * u}px` : undefined }} />
      </div>
    </div>
  );
}

// ─────────────── Speaker profile ───────────────
function SpeakerProfile({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape, isPortrait, width } = useLayout();
  const t = useTone(scene);
  const accent = t.isCyan ? "#FFFFFF" : t.light ? "#0097B2" : "#2FD3EE";
  const name = str(scene, "name");
  const role = [str(scene, "role"), str(scene, "organisation")].filter(Boolean).join(" · ");
  const expertise = str(scene, "expertise").split(/[,\n·]/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
  const bio = str(scene, "bio");
  const photoSize = (isLandscape ? 520 : isPortrait ? 600 : 420) * u;
  const cardBg = t.light ? "#071C24" : t.isCyan ? "#071C24" : "rgba(255,255,255,0.07)";
  const nameSize = Math.min((isPortrait ? 112 : 96) * u, ((isLandscape ? width * 0.5 : width - 180 * u) / Math.max(6, name.length)) * 1.7);
  const live = 0.5 + 0.5 * Math.sin(frame / 6);
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: 90 * u, paddingTop: (isPortrait ? 230 : 170) * u, display: "flex", flexDirection: isLandscape ? "row" : "column", alignItems: isLandscape ? "center" : "flex-start", justifyContent: isPortrait ? "center" : "flex-start", gap: (isLandscape ? 80 : 50) * u }}>
        <div style={{ alignSelf: isLandscape ? "center" : isPortrait ? "center" : "flex-start", display: isLandscape || isPortrait ? "block" : "none" }}>
          <RevealPhoto src={str(scene, "image")} size={photoSize} accent={accent} delay={4} shape={isPortrait ? "circle" : "arch"} />
        </div>
        <div style={{ flex: isPortrait ? undefined : 1, display: "flex", flexDirection: "column", gap: (isPortrait ? 22 : 18) * u, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 * u }}>
            {!isLandscape && !isPortrait && <div style={{ width: 160 * u, height: 160 * u }}><RevealPhoto src={str(scene, "image")} size={160 * u} accent={accent} delay={4} /></div>}
            <Pill text={str(scene, "series") || "Webinar speaker"} bg={t.isCyan ? "#071C24" : "#0097B2"} color="#FFFFFF" u={u} delay={8} />
          </div>
          <KineticLine text={name} size={nameSize} color={t.fg} delay={12} stagger={1.1} font="Nunito" />
          <Rise delay={28}><div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 34 * u, color: accent }}>{role}</div></Rise>
          {bio && <WordReveal text={bio} start={36} perWord={1.4} style={{ fontFamily: fontStack("Nunito Sans"), fontSize: (bio.length > 260 ? 26 : 30) * u * (isPortrait ? 1.1 : 1), lineHeight: 1.45, color: t.soft, maxWidth: 900 * u }} />}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 * u }}>
            {expertise.map((e, i) => (
              <Rise key={i} delay={60 + i * 5}>
                <div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 24 * u, color: t.fg, border: `${2 * u}px solid ${t.light ? "rgba(7,28,36,0.2)" : "rgba(255,255,255,0.3)"}`, borderRadius: 999, padding: `${10 * u}px ${20 * u}px` }}>{e}</div>
              </Rise>
            ))}
          </div>
          <Rise delay={78} style={{ marginTop: 10 * u }}>
            <div style={{ background: cardBg, borderRadius: 28 * u, padding: `${28 * u}px ${32 * u}px`, display: "flex", flexDirection: "column", gap: 10 * u }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 * u, fontFamily: fontStack("IBM Plex Mono"), fontSize: 20 * u, letterSpacing: 3 * u, textTransform: "uppercase", color: "#2FD3EE" }}>
                <span style={{ width: 12 * u, height: 12 * u, borderRadius: "50%", background: "#E5484D", opacity: 0.4 + 0.6 * live }} /> Live webinar
              </div>
              <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: 40 * u, color: "#FFFFFF", lineHeight: 1.1 }}>{str(scene, "webinarTitle")}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 26 * u, fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 26 * u, color: "rgba(255,255,255,0.85)" }}>
                {[["calendar", str(scene, "date")], ["clock", str(scene, "time")], ["pin", str(scene, "platform")]].filter(([, v]) => v).map(([icon, v]) => (
                  <span key={icon} style={{ display: "inline-flex", alignItems: "center", gap: 8 * u }}><Icon name={icon as "calendar" | "clock" | "pin"} size={26 * u} color="#2FD3EE" />{v}</span>
                ))}
              </div>
            </div>
          </Rise>
        </div>
      </AbsoluteFill>
    </Background>
  );
}

// ─────────────── Trainee testimonial ───────────────
function Testimonial({ scene }: Props) {
  const frame = useCurrentFrame();
  const { u, isLandscape, isPortrait } = useLayout();
  const t = useTone(scene);
  const accent = t.isCyan ? "#FFFFFF" : t.light ? "#0097B2" : "#2FD3EE";
  const quote = str(scene, "quote").replace(/^[“"]|[”"]$/g, "");
  const words = quote.split(/\s+/).length;
  const perWord = Math.max(0.8, Math.min(2.2, 70 / Math.max(1, words)));
  const qSize = (quote.length > 220 ? 42 : quote.length > 140 ? 50 : 60) * u * (isPortrait ? 1.22 : isLandscape ? 0.95 : 0.9);
  const prog = progressFraction(str(scene, "progress"));
  const markP = useIn(0, 14);
  const fill = interpolate(frame, [90, 130], [0, prog?.value ?? 0], { ...cl, easing: Easing.out(Easing.cubic) });
  const photo = (isLandscape ? 440 : isPortrait ? 340 : 220) * u;
  const meta = [str(scene, "occupation"), str(scene, "location")].filter(Boolean);
  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: 90 * u, paddingTop: (isPortrait ? 220 : 160) * u, display: "flex", flexDirection: isLandscape ? "row-reverse" : "column", gap: (isLandscape ? 80 : 30) * u, alignItems: isLandscape ? "center" : "stretch" }}>
        {isLandscape && <RevealPhoto src={str(scene, "image")} size={photo} accent={accent} delay={10} />}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 * u, justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: fontStack("Fraunces"), fontWeight: 600, fontSize: 220 * u, lineHeight: 0.7, height: 120 * u, color: accent, transform: `scale(${0.6 + 0.4 * markP})`, transformOrigin: "left top", opacity: markP }}>“</div>
            {str(scene, "track") && <Pill text={`${str(scene, "track")} trainee`} bg={t.isCyan ? "#071C24" : "#0097B2"} color="#FFFFFF" u={u} delay={6} />}
          </div>
          <WordReveal text={`${quote}”`} start={10} perWord={perWord} style={{ fontFamily: fontStack("Nunito"), fontWeight: 800, fontSize: qSize, lineHeight: 1.25, color: t.fg }} />
          <div style={{ display: "flex", alignItems: "center", gap: 56 * u, marginTop: 24 * u }}>
            {!isLandscape && <RevealPhoto src={str(scene, "image")} size={photo * 0.6} accent={accent} delay={70} />}
            <Rise delay={80} style={{ flex: 1 }}>
              <div style={{ fontFamily: fontStack("Nunito"), fontWeight: 900, fontSize: 46 * u, color: t.fg }}>{str(scene, "name")}</div>
              <div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 700, fontSize: 28 * u, color: t.soft, marginTop: 4 * u }}>{meta[0]}</div>
              {meta[1] && <div style={{ display: "flex", alignItems: "center", gap: 8 * u, fontFamily: fontStack("Nunito Sans"), fontWeight: 700, fontSize: 26 * u, color: t.soft, marginTop: 4 * u }}><Icon name="pin" size={26 * u} color={accent} />{meta[1]}</div>}
            </Rise>
          </div>
          {str(scene, "progress") && (
            <Rise delay={88}>
              <div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 24 * u, color: t.fg, opacity: 0.85 }}>{str(scene, "progress")}</div>
              {prog && (
                <div style={{ height: 12 * u, borderRadius: 6 * u, background: t.light ? "rgba(7,28,36,0.1)" : "rgba(255,255,255,0.15)", marginTop: 12 * u, overflow: "hidden" }}>
                  <div style={{ width: `${fill * 100}%`, height: "100%", background: accent, borderRadius: 6 * u }} />
                </div>
              )}
            </Rise>
          )}
        </div>
      </AbsoluteFill>
    </Background>
  );
}

// ─────────────── Formula lesson (Excel grid or Power BI DAX) ───────────────
function FormulaLesson({ scene }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { u, isLandscape, isPortrait, width } = useLayout();
  const t = useTone(scene);
  const tool = str(scene, "tool", "Excel");
  const accent = /excel/i.test(tool) ? (t.light ? "#1F8A57" : "#45C486") : /power bi/i.test(tool) ? (t.light ? "#B7860B" : "#E8B53A") : t.light ? "#0097B2" : "#2FD3EE";
  const formula = str(scene, "formula");
  const typeStart = 18;
  const typed = formula.slice(0, Math.max(0, Math.floor((frame - typeStart) * 1.3)));
  const doneTyping = typeStart + formula.length / 1.3;
  const rec = { example_table: str(scene, "table"), example_formula: typed, result_cell: str(scene, "resultCell"), example_result: str(scene, "result") };
  const fg = t.fg;
  const panel = t.light ? "#F2F6F7" : "rgba(255,255,255,0.06)";
  const line = t.light ? "rgba(7,28,36,0.14)" : "rgba(255,255,255,0.16)";
  const resultP = spring({ frame: frame - doneTyping - 8, fps, config: { damping: 12, stiffness: 140 } });
  const W = width - 180 * u;
  const caption = str(scene, "caption");
  const isSheet = isSpreadsheetTool(tool);
  const caret = <span style={{ display: "inline-block", width: 12 * u, height: 34 * u, background: accent, verticalAlign: "middle", marginLeft: 4 * u, opacity: frame < doneTyping + 10 ? Math.floor(frame / 8) % 2 : 0 }} />;

  let body: ReactNode;
  if (isSheet) {
    const g = lessonGrid({ ...rec, example_formula: typed });
    const rowHead = 60 * u;
    const colW = Math.min(300 * u, (W - rowHead) / Math.max(2, g.cols));
    const rh = (isPortrait ? 100 : isLandscape ? 64 : 84) * u;
    body = (
      <div style={{ display: "grid", gridTemplateColumns: `${rowHead}px repeat(${g.cols}, ${colW}px)` }}>
        <div />
        {Array.from({ length: g.cols }).map((_, c) => <div key={`h${c}`} style={{ height: 44 * u, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 22 * u, color: fg, opacity: 0.45 }}>{colName(c)}</div>)}
        {Array.from({ length: g.rows }).flatMap((_, ri) => {
          const r = ri + 1;
          const rowP = spring({ frame: frame - 4 - ri * 3, fps, config: { damping: 200 } });
          return [
            <div key={`r${r}`} style={{ height: rh, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 22 * u, color: fg, opacity: 0.45 * rowP }}>{r}</div>,
            ...Array.from({ length: g.cols }).map((__, c) => {
              const isResult = g.result && g.result.col === c && g.result.row === r;
              const isRef = g.isRef(c, r);
              const raw = isResult ? (frame > doneTyping ? str(scene, "result") : "") : g.cell(c, r);
              const v = fmtCell(raw);
              const numeric = /^-?[\d,.]+%?$/.test(v);
              return (
                <div key={`c${r}-${c}`} style={{ height: rh, border: `${1 * u}px solid ${line}`, background: isResult ? accent : isRef ? `${accent}33` : r === 1 ? panel : "transparent", display: "flex", alignItems: "center", justifyContent: numeric && r > 1 ? "flex-end" : "flex-start", padding: `0 ${16 * u}px`, fontFamily: fontStack(r === 1 ? "Nunito Sans" : "IBM Plex Sans"), fontWeight: r === 1 || isResult ? 800 : 500, fontSize: Math.min(32 * u, rh * 0.38), color: isResult ? (t.light ? "#FFFFFF" : "#071C24") : fg, opacity: rowP, transform: isResult ? `scale(${0.85 + 0.15 * resultP})` : undefined, outline: isResult ? `${3 * u}px solid ${fg}` : undefined, transition: "none", overflow: "hidden", whiteSpace: "nowrap" }}>
                  {v}
                </div>
              );
            }),
          ];
        })}
      </div>
    );
  } else {
    const tb = parseTable(str(scene, "table"));
    const measure = (formula.split("=")[0] || "Measure").trim();
    body = (
      <div style={{ display: "flex", flexDirection: isPortrait ? "column" : "row", gap: 40 * u, alignItems: isPortrait ? "stretch" : "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", borderBottom: `${2 * u}px solid ${line}` }}>
            {tb.header.map((h, i) => <div key={i} style={{ flex: 1, padding: `${(isPortrait ? 20 : 14) * u}px ${12 * u}px`, fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: (isPortrait ? 28 : 24) * u, color: fg, opacity: 0.7 }}>{h}</div>)}
          </div>
          {tb.rows.slice(0, 6).map((row, ri) => {
            const p = spring({ frame: frame - 6 - ri * 4, fps, config: { damping: 200 } });
            return (
              <div key={ri} style={{ display: "flex", borderBottom: `${1 * u}px solid ${line}`, opacity: p, transform: `translateX(${(1 - p) * 20 * u}px)` }}>
                {row.map((v, i) => <div key={i} style={{ flex: 1, padding: `${(isPortrait ? 22 : 14) * u}px ${12 * u}px`, fontFamily: fontStack("IBM Plex Sans"), fontSize: (isPortrait ? 32 : 26) * u, color: fg, textAlign: /^-?[\d,.]+%?$/.test(v) ? "right" : "left" }}>{fmtCell(v)}</div>)}
              </div>
            );
          })}
        </div>
        <div style={{ width: isPortrait ? "100%" : 380 * u, background: accent, borderRadius: 28 * u, padding: 32 * u, transform: `scale(${0.8 + 0.2 * resultP})`, opacity: resultP, color: t.light ? "#FFFFFF" : "#071C24" }}>
          <div style={{ fontFamily: fontStack("IBM Plex Mono"), fontSize: 18 * u, letterSpacing: 2 * u, textTransform: "uppercase", opacity: 0.75 }}>Card visual</div>
          <div style={{ fontFamily: fontStack("Manrope"), fontWeight: 800, fontSize: 96 * u, lineHeight: 1.1, marginTop: 10 * u }}>{fmtCell(str(scene, "result"))}</div>
          <div style={{ fontFamily: fontStack("Nunito Sans"), fontWeight: 800, fontSize: 26 * u, marginTop: 8 * u }}>{measure}</div>
        </div>
      </div>
    );
  }

  return (
    <Background bg={scene.background}>
      <AbsoluteFill style={{ padding: 90 * u, paddingTop: (isPortrait ? 230 : 170) * u, display: "flex", flexDirection: "column", gap: 28 * u }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 * u }}>
          <Pill text={`${tool} · ${str(scene, "functionName")}`} bg={accent} color={t.light ? "#FFFFFF" : "#071C24"} u={u} />
        </div>
        <Rise delay={4}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 * u, background: t.light ? "#071C24" : "rgba(255,255,255,0.09)", borderRadius: 22 * u, padding: `${22 * u}px ${28 * u}px`, minHeight: 88 * u }}>
            <span style={{ fontFamily: fontStack("Fraunces"), fontStyle: "italic", fontWeight: 600, fontSize: 38 * u, color: accent }}>fx</span>
            <span style={{ fontFamily: fontStack("JetBrains Mono"), fontWeight: 700, fontSize: (formula.length > 46 ? 26 : 34) * u, color: "#FFFFFF", whiteSpace: "pre-wrap" }}>{typed}{caret}</span>
          </div>
        </Rise>
        <div style={{ marginTop: 10 * u }}>{body}</div>
        {caption && <Rise delay={Math.round(doneTyping) + 20}><div style={{ display: "flex", gap: 20 * u, alignItems: "stretch", background: panel, borderRadius: 20 * u, padding: `${22 * u}px ${26 * u}px` }}><div style={{ width: 6 * u, borderRadius: 3 * u, background: accent }} /><div style={{ fontFamily: fontStack("Nunito"), fontWeight: 800, fontSize: 32 * u, lineHeight: 1.3, color: fg }}>{caption}</div></div></Rise>}
      </AbsoluteFill>
    </Background>
  );
}

export const SCENES4 = { "speaker-profile": SpeakerProfile, testimonial: Testimonial, "formula-lesson": FormulaLesson };

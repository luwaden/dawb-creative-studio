import type { CSSProperties } from "react";

/**
 * The official DAWB logo, drawn from the exact geometry of the three supplied SVG
 * files (dark, light, cyan) — split into named pieces so each can be animated.
 * With every piece at rest it is identical to the supplied artwork.
 */
export type LogoVariant = "dark" | "light" | "cyan";
export type LogoPiece = "emblem" | "cut1" | "cut2" | "cut3" | "dot1" | "dot2" | "dot3" | "D" | "A" | "W" | "B" | "spark";

export interface PieceState {
  opacity?: number;
  transform?: string;
  /** 0–1: draw the emblem outline before it fills (emblem only). */
  draw?: number;
  /** 0–1 fill opacity for the emblem while drawing. */
  fill?: number;
}

type Pieces = Partial<Record<LogoPiece, PieceState>>;

const EMBLEM = "M152.5 105.5 230 149.5 230 328 114 394.5 37 350 37 216 114 172 114 127.5Z";
const EMBLEM_CYAN = "M152.5 105.5 230 149.5 230 327.5 114 394.5 37 350 37 216 114 172 114 127.5Z";
const EMBLEM_LEN = 1160;

// Piece centres (for transform-origin)
const ORIGIN: Record<LogoPiece, string> = {
  emblem: "133px 250px",
  cut1: "172px 205px",
  cut2: "95px 250px",
  cut3: "133px 316px",
  dot1: "211px 184px",
  dot2: "211px 216px",
  dot3: "211px 253px",
  D: "292px 190px",
  A: "384px 190px",
  W: "300px 300px",
  B: "405px 300px",
  spark: "354px 237px",
};

const COLORS = {
  dark: { bg: "#000000", emblem: "#FFFFFF", cut: "#000000", dot: "#0097B2", D: "#0097B2", Dcounter: "#000000", A: "#FFFFFF", W: "#FFFFFF", B: "#0097B2" },
  light: { bg: "#FFFFFF", emblem: "#0097B2", cut: "#FFFFFF", dot: "#FFFFFF", D: "#0097B2", Dcounter: "#FFFFFF", A: "#0097B2", W: "#0097B2", B: "#000000" },
  cyan: { bg: "#0097B2", emblem: "#FFFFFF", cut: "#0097B2", dot: "#0097B2", D: "#000000", Dcounter: "", A: "#FFFFFF", W: "#FFFFFF", B: "#000000" },
} as const;

function st(p: PieceState | undefined, piece: LogoPiece): CSSProperties {
  return { opacity: p?.opacity ?? 1, transform: p?.transform, transformOrigin: ORIGIN[piece], transformBox: "view-box" } as CSSProperties;
}

export function LogoMark({ variant, size, pieces = {}, showBackground = false, style }: { variant: LogoVariant; size: number; pieces?: Pieces; showBackground?: boolean; style?: CSSProperties }) {
  const c = COLORS[variant];
  const em = pieces.emblem;
  const draw = em?.draw ?? 1;
  const fillO = em?.fill ?? 1;
  const strokeVisible = draw < 1 || fillO < 1;
  const path = variant === "cyan" ? EMBLEM_CYAN : EMBLEM;
  return (
    <svg width={size} height={size} viewBox="0 0 500 500" style={{ overflow: "visible", ...style }}>
      {showBackground && <rect width="500" height="500" fill={c.bg} />}
      <g style={st(em, "emblem")}>
        <path d={path} fill={c.emblem} fillOpacity={fillO} />
        {strokeVisible && <path d={path} fill="none" stroke={c.emblem} strokeWidth={4} strokeDasharray={EMBLEM_LEN} strokeDashoffset={EMBLEM_LEN * (1 - draw)} strokeLinejoin="round" />}
      </g>
      {variant === "cyan" ? (
        <>
          <path style={st(pieces.cut1, "cut1")} d="M152.8 149.8 191.3 172 191.3 260.7 152.8 238.4Z" fill={c.cut} />
          <path style={st(pieces.cut2, "cut2")} d="M75.5 238.7 114 216.4 114 260.7 75.5 283Z" fill={c.cut} />
          <path style={st(pieces.cut3, "cut3")} d="M75.5 327.6 152.5 283.2 191.1 305.5 114 350Z" fill={c.cut} />
          <circle style={st(pieces.dot1, "dot1")} cx="210.9" cy="184.2" r="9.8" fill={c.dot} />
          <circle style={st(pieces.dot2, "dot2")} cx="210.9" cy="216.5" r="9.8" fill={c.dot} />
          <circle style={st(pieces.dot3, "dot3")} cx="210.9" cy="252.9" r="9.8" fill={c.dot} />
          <g fontFamily="Arial, Helvetica, sans-serif" fontWeight="700">
            <text style={st(pieces.D, "D")} x="239" y="232" fontSize="119" fill={c.D} textLength="101" lengthAdjust="spacingAndGlyphs">D</text>
            <text style={st(pieces.A, "A")} x="372" y="224" fontSize="106" fill={c.A} textLength="74" lengthAdjust="spacingAndGlyphs">A</text>
            <text style={st(pieces.W, "W")} x="239" y="326" fontSize="108" fill={c.W} textLength="119" lengthAdjust="spacingAndGlyphs">W</text>
            <text style={st(pieces.B, "B")} x="370" y="327" fontSize="101" fill={c.B} textLength="76" lengthAdjust="spacingAndGlyphs">B</text>
            <circle style={st(pieces.spark, "spark")} cx="354.5" cy="237" r="10" fill="#FFFFFF" />
          </g>
        </>
      ) : (
        <>
          <path style={st(pieces.cut1, "cut1")} d="M152.5 149.5 191.5 172 191.5 261 152.5 239Z" fill={c.cut} />
          <path style={st(pieces.cut2, "cut2")} d="M75.5 239 114 216.5 114 261 75.5 283.5Z" fill={c.cut} />
          <path style={st(pieces.cut3, "cut3")} d="M75.5 328 152.5 283.5 191.5 306 114 350Z" fill={c.cut} />
          <circle style={st(pieces.dot1, "dot1")} cx="211" cy="184" r="10" fill={c.dot} />
          <circle style={st(pieces.dot2, "dot2")} cx="211" cy="216.5" r="10" fill={c.dot} />
          <circle style={st(pieces.dot3, "dot3")} cx="211" cy="253" r="10" fill={c.dot} />
          <g style={st(pieces.D, "D")}>
            <path d="M246 149H282Q339 149 339 190Q339 232 282 232H246Z" fill={c.D} />
            <path d="M263 163H281Q321 163 321 190Q321 218 281 218H263Z" fill={c.Dcounter} />
          </g>
          <g fontFamily="Arial, Helvetica, sans-serif" fontSize="105" fontWeight="400">
            <text style={st(pieces.A, "A")} x="346" y="224" fill={c.A}>A</text>
            <text style={st(pieces.W, "W")} x="243" y="340" fill={c.W}>W</text>
            <text style={st(pieces.B, "B")} x="370" y="340" fill={c.B} fontWeight="700">B</text>
          </g>
        </>
      )}
    </svg>
  );
}

export const LOGO_BG: Record<LogoVariant, string> = { dark: "#000000", light: "#FFFFFF", cyan: "#0097B2" };

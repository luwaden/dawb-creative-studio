import { Audio } from "@remotion/media";
import { linearTiming, TransitionSeries, type TransitionPresentation, type TransitionPresentationComponentProps } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { flip } from "@remotion/transitions/flip";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { fontStack } from "@/lib/fonts";
import type { Scene, SceneTransition, VideoDoc } from "@/lib/video/types";
import { effectiveTransitionFrames, getSceneStarts, resolveThemeColor } from "@/lib/video/types";
import { useAsset, useLayout, VideoCtx } from "./context";
import { LogoChip } from "./primitives";
import { isDark, SCENE_COMPONENTS } from "./scenes";

export interface DawbVideoProps extends Record<string, unknown> {
  doc: VideoDoc;
  assetBase?: string;
  assetQuery?: string;
}

/** Simple CSS zoom presentation (no WebGL, so it renders identically in every export path). */
function ZoomPresentation({ children, presentationDirection, presentationProgress }: TransitionPresentationComponentProps<Record<string, unknown>>) {
  const entering = presentationDirection === "entering";
  const scale = entering ? interpolate(presentationProgress, [0, 1], [1.15, 1]) : interpolate(presentationProgress, [0, 1], [1, 0.92]);
  const opacity = entering ? presentationProgress : 1 - presentationProgress * 0.4;
  return <AbsoluteFill style={{ transform: `scale(${scale})`, opacity }}>{children}</AbsoluteFill>;
}
const zoom = (): TransitionPresentation<Record<string, unknown>> => ({ component: ZoomPresentation, props: {} });

function presentationFor(t: SceneTransition): TransitionPresentation<Record<string, unknown>> {
  const dir = t.direction ?? "from-right";
  switch (t.type) {
    case "slide":
      return slide({ direction: dir }) as TransitionPresentation<Record<string, unknown>>;
    case "wipe":
      return wipe({ direction: dir }) as TransitionPresentation<Record<string, unknown>>;
    case "flip":
      return flip({ direction: dir }) as TransitionPresentation<Record<string, unknown>>;
    case "zoom":
      return zoom();
    default:
      return fade() as TransitionPresentation<Record<string, unknown>>;
  }
}

function BrandBar({ doc, sceneAt }: { doc: VideoDoc; sceneAt: (f: number) => Scene | undefined }) {
  const frame = useCurrentFrame();
  const { u, pad } = useLayout();
  const scene = sceneAt(frame);
  if (!scene || scene.type === "logo-outro" || scene.type === "certificate") return null;
  const bg = resolveThemeColor(scene.background.color, doc.theme);
  const dark = Boolean(scene.background.imageSrc) || Boolean(scene.props.image && scene.type !== "quote" && scene.type !== "speaker-card" && scene.type !== "celebration" && scene.type !== "split-media") || isDark(bg);
  const color = dark ? "rgba(255,255,255,0.9)" : `${doc.theme.ink}cc`;
  const o = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <div style={{ position: "absolute", top: pad * 0.55, left: pad * 0.6, right: pad * 0.6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <LogoChip size={92 * u} onDark={dark} />
        {doc.handle && <div style={{ fontFamily: fontStack(doc.theme.bodyFont), fontSize: 24 * u, fontWeight: 700, color, letterSpacing: 1.5 * u, textAlign: "right" }}>{doc.handle}</div>}
      </div>
    </AbsoluteFill>
  );
}

function Soundtrack({ doc }: { doc: VideoDoc }) {
  const asset = useAsset();
  const { durationInFrames } = useVideoConfig();
  if (!doc.audio?.src) return null;
  const src = asset(doc.audio.src)!;
  const vol = doc.audio.volume;
  const fadeOut = doc.audio.fadeOutFrames;
  return (
    <Audio
      src={src}
      volume={(f: number) =>
        interpolate(f, [0, 15, Math.max(16, durationInFrames - fadeOut), durationInFrames], [0, vol, vol, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.linear,
        })
      }
    />
  );
}

export const DawbVideo: React.FC<DawbVideoProps> = ({ doc, assetBase = "", assetQuery = "" }) => {
  const ctx = useMemo(() => ({ theme: doc.theme, doc, assetBase, assetQuery }), [doc, assetBase, assetQuery]);
  const starts = useMemo(() => getSceneStarts(doc), [doc]);
  const sceneAt = (f: number) => {
    let found: Scene | undefined;
    doc.scenes.forEach((s, i) => {
      if (f >= starts[i]) found = s;
    });
    return found;
  };

  return (
    <VideoCtx.Provider value={ctx}>
      <AbsoluteFill style={{ backgroundColor: doc.theme.paper }}>
        <TransitionSeries>
          {doc.scenes.flatMap((scene, i) => {
            const Comp = SCENE_COMPONENTS[scene.type];
            const items = [
              <TransitionSeries.Sequence key={scene.id} durationInFrames={scene.durationInFrames}>
                <Comp scene={scene} />
              </TransitionSeries.Sequence>,
            ];
            const tf = effectiveTransitionFrames(doc.scenes, i);
            if (tf > 0) {
              items.push(
                <TransitionSeries.Transition key={`${scene.id}-t`} presentation={presentationFor(scene.transition)} timing={linearTiming({ durationInFrames: tf, easing: Easing.inOut(Easing.cubic) })} />,
              );
            }
            return items;
          })}
        </TransitionSeries>
        {doc.logo !== "none" && <BrandBar doc={doc} sceneAt={sceneAt} />}
        <Soundtrack doc={doc} />
      </AbsoluteFill>
    </VideoCtx.Provider>
  );
};

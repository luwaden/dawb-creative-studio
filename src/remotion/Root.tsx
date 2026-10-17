import "./fonts";
import { Composition, continueRender, delayRender } from "remotion";
import { ASPECTS, getVideoDuration } from "@/lib/video/types";
import { DawbVideo, type DawbVideoProps } from "./DawbVideo";
import { SAMPLE_VIDEO_DOC } from "./sample";

// Hold rendering until self-hosted fonts are decoded so the first frames never use fallbacks.
if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  document.fonts.ready.then(() => continueRender(handle));
}

export const RemotionRoot: React.FC = () => (
  <Composition
    id="DawbVideo"
    component={DawbVideo}
    defaultProps={{ doc: SAMPLE_VIDEO_DOC, assetBase: "", assetQuery: "" } satisfies DawbVideoProps}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={300}
    calculateMetadata={({ props }) => {
      const a = ASPECTS[props.doc.aspect];
      return { width: a.width, height: a.height, fps: props.doc.fps, durationInFrames: getVideoDuration(props.doc) };
    }}
  />
);

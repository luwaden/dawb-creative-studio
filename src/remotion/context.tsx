import { createContext, useContext } from "react";
import { staticFile, useVideoConfig } from "remotion";
import type { VideoDoc, VideoTheme } from "@/lib/video/types";
import { resolveThemeColor } from "@/lib/video/types";

export interface VideoContextValue {
  theme: VideoTheme;
  doc: VideoDoc;
  /** Prefix for relative asset URLs (empty in the browser, app origin for server renders). */
  assetBase: string;
  /** Signed query string appended to /api/assets URLs for server renders. */
  assetQuery: string;
}

export const VideoCtx = createContext<VideoContextValue | null>(null);

export function useVideoCtx(): VideoContextValue {
  const v = useContext(VideoCtx);
  if (!v) throw new Error("VideoCtx missing");
  return v;
}

export function useColor() {
  const { theme } = useVideoCtx();
  return (value: string | undefined) => resolveThemeColor(value, theme);
}

export function useAsset() {
  const { assetBase, assetQuery } = useVideoCtx();
  return (src: string | undefined): string | undefined => {
    if (!src) return undefined;
    if (src.startsWith("data:") || /^https?:\/\//.test(src) || src.startsWith("blob:")) return src;
    // Brand files ship in /public: staticFile resolves them in the Next app and in the render bundle.
    if (src.startsWith("/brand/")) return staticFile(src.slice(1));
    const abs = `${assetBase}${src}`;
    if (assetQuery && src.startsWith("/api/assets/")) return `${abs}${abs.includes("?") ? "&" : "?"}${assetQuery}`;
    return abs;
  };
}

/** Layout metrics so scenes adapt to 9:16, 4:5, 1:1 and 16:9 rather than just scaling. */
export function useLayout() {
  const { width, height } = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  const ratio = width / height;
  const isLandscape = ratio > 1.2;
  const isPortrait = ratio < 0.7;
  const pad = (isLandscape ? 110 : 90) * u;
  return { width, height, u, ratio, isLandscape, isPortrait, pad };
}

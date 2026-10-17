import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import type { VideoDoc } from "@/lib/video/types";

/**
 * Server-side video rendering with @remotion/renderer. Used in local mode (a team
 * member's PC, or any long-running Node host). NOT used on Vercel serverless,
 * where functions are short-lived — the browser renderer handles exports there.
 */

let bundlePromise: Promise<string> | null = null;

function root() {
  return process.cwd();
}

export function getBrowserExecutable(): string | undefined {
  const fromEnv = process.env.REMOTION_BROWSER_EXECUTABLE;
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  return undefined; // Remotion downloads its own headless shell on first use.
}

export async function getServeUrl(): Promise<string> {
  if (!bundlePromise) {
    bundlePromise = (async () => {
      const { bundle } = await import("@remotion/bundler");
      return bundle({
        entryPoint: path.join(/*turbopackIgnore: true*/ root(), "src/remotion/index.ts"),
        publicDir: path.join(/*turbopackIgnore: true*/ root(), "public"),
        outDir: path.join(/*turbopackIgnore: true*/ root(), ".remotion-bundle"),
        webpackOverride: (config) => ({
          ...config,
          resolve: {
            ...config.resolve,
            alias: { ...(config.resolve?.alias as Record<string, string> | undefined), "@": path.join(/*turbopackIgnore: true*/ root(), "src") },
          },
        }),
      });
    })().catch((err) => {
      bundlePromise = null;
      throw err;
    });
  }
  return bundlePromise;
}

export interface ServerRenderInput {
  doc: VideoDoc;
  assetBase: string;
  assetQuery: string;
  codec: "h264" | "vp8";
  outputPath: string;
  onProgress?: (progress: number, stage: string) => void;
  signal?: AbortSignal;
}

export async function renderVideoOnServer(input: ServerRenderInput): Promise<void> {
  const { renderMedia, selectComposition, makeCancelSignal } = await import("@remotion/renderer");
  input.onProgress?.(0.01, "Bundling composition");
  const serveUrl = await getServeUrl();
  const inputProps = { doc: input.doc, assetBase: input.assetBase, assetQuery: input.assetQuery };
  const browserExecutable = getBrowserExecutable();
  input.onProgress?.(0.04, "Preparing browser");
  const composition = await selectComposition({ serveUrl, id: "DawbVideo", inputProps, browserExecutable, logLevel: "error" });
  const { cancelSignal, cancel } = makeCancelSignal();
  input.signal?.addEventListener("abort", () => cancel());
  await renderMedia({
    composition,
    serveUrl,
    codec: input.codec,
    outputLocation: input.outputPath,
    inputProps,
    browserExecutable,
    cancelSignal,
    imageFormat: "jpeg",
    jpegQuality: 90,
    logLevel: "error",
    concurrency: Math.max(1, Math.min(os.cpus().length || 1, 8, Number(process.env.RENDER_CONCURRENCY) || Math.min(4, os.cpus().length || 1))),
    onProgress: ({ progress, stitchStage }) => input.onProgress?.(0.05 + progress * 0.95, stitchStage === "muxing" ? "Finishing file" : "Rendering frames"),
  });
}

"use client";

import { api } from "@/lib/client/api";
import { ASPECTS, getVideoDuration, type VideoDoc } from "./types";

/**
 * Video export service. Two interchangeable implementations behind one interface:
 *  - "browser": @remotion/web-renderer renders the same composition in this tab and
 *    encodes with WebCodecs. Works on Vercel (no server work). Needs Chrome/Edge.
 *  - "server":  @remotion/renderer on the Node server (local mode / long-running host).
 */
export type RenderMode = "browser" | "server";

export interface RenderResult {
  blob: Blob;
  format: "mp4" | "webm";
  mode: RenderMode;
}

export interface RenderCallbacks {
  onProgress: (p: number, stage: string) => void;
  signal: AbortSignal;
}

export async function checkBrowserSupport(doc: VideoDoc): Promise<{ ok: boolean; container: "mp4" | "webm"; reason?: string }> {
  if (typeof window === "undefined" || !("VideoEncoder" in window)) {
    return { ok: false, container: "mp4", reason: "This browser can't encode video. Use Chrome or Edge, or the server export." };
  }
  const { canRenderMediaOnWeb } = await import("@remotion/web-renderer");
  const a = ASPECTS[doc.aspect];
  for (const [container, videoCodec] of [["mp4", "h264"], ["webm", "vp9"]] as const) {
    try {
      const r = await canRenderMediaOnWeb({ container, videoCodec, width: a.width, height: a.height } as Parameters<typeof canRenderMediaOnWeb>[0]);
      if (r.canRender) return { ok: true, container };
    } catch {
      /* try next */
    }
  }
  return { ok: false, container: "mp4", reason: "This browser can't encode H.264 or VP9 at this size. Use the server export or another browser." };
}

export async function renderInBrowser(doc: VideoDoc, cb: RenderCallbacks): Promise<RenderResult> {
  const support = await checkBrowserSupport(doc);
  if (!support.ok) throw new Error(support.reason);
  cb.onProgress(0.01, "Loading renderer");
  const [{ renderMediaOnWeb }, { DawbVideo }] = await Promise.all([import("@remotion/web-renderer"), import("@/remotion/DawbVideo")]);
  await document.fonts.ready;
  const a = ASPECTS[doc.aspect];
  const result = await renderMediaOnWeb({
    composition: { id: "DawbVideo", component: DawbVideo, durationInFrames: getVideoDuration(doc), fps: doc.fps, width: a.width, height: a.height },
    inputProps: { doc, assetBase: window.location.origin, assetQuery: "" },
    container: support.container,
    videoCodec: support.container === "mp4" ? "h264" : "vp9",
    videoBitrate: "high",
    signal: cb.signal,
    onProgress: (p: { progress: number }) => cb.onProgress(Math.max(0.02, p.progress), "Rendering & encoding"),
  } as unknown as Parameters<typeof renderMediaOnWeb>[0]);
  const blob = await result.getBlob();
  if (!blob || blob.size < 1024) throw new Error("The browser renderer produced an empty file.");
  return { blob, format: support.container, mode: "browser" };
}

interface Job { id: string; status: "queued" | "rendering" | "done" | "error" | "cancelled"; progress: number; stage: string; error?: string }

export async function renderOnServer(doc: VideoDoc, cb: RenderCallbacks): Promise<RenderResult> {
  cb.onProgress(0.01, "Sending to render server");
  const { job } = await api<{ job: Job }>("/api/render", { method: "POST", json: { doc, codec: "h264" } });
  const onAbort = () => void api(`/api/render/${job.id}`, { method: "DELETE" }).catch(() => undefined);
  cb.signal.addEventListener("abort", onAbort);
  try {
    for (;;) {
      if (cb.signal.aborted) throw new DOMException("Cancelled", "AbortError");
      await new Promise((r) => setTimeout(r, 1000));
      const { job: j } = await api<{ job: Job }>(`/api/render/${job.id}`);
      cb.onProgress(Math.max(0.01, j.progress), j.status === "queued" ? "Waiting for the render queue" : j.stage);
      if (j.status === "done") break;
      if (j.status === "error") throw new Error(j.error ?? "Server render failed");
      if (j.status === "cancelled") throw new DOMException("Cancelled", "AbortError");
    }
    cb.onProgress(0.99, "Downloading file");
    const res = await fetch(`/api/render/${job.id}/file`, { signal: cb.signal });
    if (!res.ok) throw new Error(`Could not download the rendered file (${res.status})`);
    const blob = await res.blob();
    if (blob.size < 1024) throw new Error("The server produced an empty file.");
    return { blob, format: "mp4", mode: "server" };
  } finally {
    cb.signal.removeEventListener("abort", onAbort);
  }
}

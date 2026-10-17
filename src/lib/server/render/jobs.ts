import "server-only";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { nanoid } from "nanoid";
import type { VideoDoc } from "@/lib/video/types";
import { renderVideoOnServer } from "./serverRenderer";

export interface RenderJob {
  id: string;
  status: "queued" | "rendering" | "done" | "error" | "cancelled";
  progress: number;
  stage: string;
  error?: string;
  filePath?: string;
  sizeBytes?: number;
  codec: "h264" | "vp8";
  createdAt: number;
  owner: string;
  controller: AbortController;
}

// Survive dev hot reloads.
const g = globalThis as unknown as { __dawbJobs?: Map<string, RenderJob>; __dawbQueue?: Promise<unknown> };
const jobs = (g.__dawbJobs ??= new Map());

function outDir() {
  const dir = path.join(os.tmpdir(), "dawb-renders");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sweep() {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [id, job] of jobs) {
    if (job.createdAt < cutoff) {
      if (job.filePath) fs.rm(job.filePath, { force: true }, () => undefined);
      jobs.delete(id);
    }
  }
}

export function startRenderJob(input: { doc: VideoDoc; assetBase: string; assetQuery: string; codec: "h264" | "vp8"; owner: string }): RenderJob {
  sweep();
  const id = nanoid(12);
  const job: RenderJob = { id, status: "queued", progress: 0, stage: "Waiting in queue", codec: input.codec, createdAt: Date.now(), owner: input.owner, controller: new AbortController() };
  jobs.set(id, job);
  const filePath = path.join(outDir(), `${id}.${input.codec === "h264" ? "mp4" : "webm"}`);
  // One render at a time per server: renders are CPU heavy and already parallelise internally.
  const run = async () => {
    if (job.status === "cancelled") return;
    job.status = "rendering";
    try {
      await renderVideoOnServer({
        doc: input.doc,
        assetBase: input.assetBase,
        assetQuery: input.assetQuery,
        codec: input.codec,
        outputPath: filePath,
        signal: job.controller.signal,
        onProgress: (p, stage) => {
          job.progress = p;
          job.stage = stage;
        },
      });
      const size = fs.statSync(filePath).size;
      if (size < 1024) throw new Error("Renderer produced an empty file");
      job.filePath = filePath;
      job.sizeBytes = size;
      job.progress = 1;
      job.stage = "Done";
      job.status = "done";
    } catch (e) {
      fs.rm(filePath, { force: true }, () => undefined);
      if (job.controller.signal.aborted) {
        job.status = "cancelled";
        job.stage = "Cancelled";
      } else {
        job.status = "error";
        job.error = e instanceof Error ? e.message.split("\n")[0].slice(0, 400) : "Render failed";
        job.stage = "Failed";
        console.error("[render]", e);
      }
    }
  };
  g.__dawbQueue = (g.__dawbQueue ?? Promise.resolve()).then(run, run);
  return job;
}

export function getJob(id: string): RenderJob | undefined {
  return jobs.get(id);
}

export function publicJob(job: RenderJob) {
  const { controller: _c, filePath: _f, ...rest } = job;
  return rest;
}

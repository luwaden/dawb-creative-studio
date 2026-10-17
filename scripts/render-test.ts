/**
 * Smoke test for the server renderer: renders the sample composition to MP4.
 * Usage: npm run render:test  (output: out/render-test.mp4)
 */
import path from "node:path";
import fs from "node:fs";
import { renderVideoOnServer } from "../src/lib/server/render/serverRenderer";
import { SAMPLE_VIDEO_DOC } from "../src/remotion/sample";

const out = path.join(process.cwd(), "out", "render-test.mp4");
fs.mkdirSync(path.dirname(out), { recursive: true });
const started = Date.now();
let last = -1;
renderVideoOnServer({
  doc: SAMPLE_VIDEO_DOC,
  assetBase: process.env.ASSET_BASE ?? "http://localhost:3000",
  assetQuery: "",
  codec: "h264",
  outputPath: out,
  onProgress: (p, stage) => {
    const pct = Math.floor(p * 100);
    if (pct >= last + 10) { last = pct; console.log(`${pct}% ${stage}`); }
  },
})
  .then(() => {
    console.log(`Rendered ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB) in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  })
  .catch((e) => {
    console.error("Render failed:", e);
    process.exit(1);
  });

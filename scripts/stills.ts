/**
 * Render still frames of a video template (fast visual check):
 *   npx tsx scripts/stills.ts <templateId> <frame,frame,...>   → out/stills/<id>-<frame>.png
 */
import path from "node:path";
import fs from "node:fs";
import { getServeUrl, getBrowserExecutable } from "../src/lib/server/render/serverRenderer";
import { getTemplate } from "../src/lib/templates";

(async () => {
  const [id, framesArg] = process.argv.slice(2);
  const t = getTemplate(id);
  if (!t || t.kind !== "video") throw new Error(`No video template ${id}`);
  const { renderStill, selectComposition } = await import("@remotion/renderer");
  const serveUrl = await getServeUrl();
  const inputProps = { doc: t.build(), assetBase: "http://localhost:3000", assetQuery: "" };
  const browserExecutable = getBrowserExecutable();
  const composition = await selectComposition({ serveUrl, id: "DawbVideo", inputProps, browserExecutable });
  const dir = path.join(process.cwd(), "out", "stills");
  fs.mkdirSync(dir, { recursive: true });
  for (const f of framesArg.split(",").map(Number)) {
    const output = path.join(dir, `${id}-${f}.png`);
    await renderStill({ composition, serveUrl, inputProps, frame: Math.min(f, composition.durationInFrames - 1), output, browserExecutable, scale: 0.4 });
    console.log(output);
  }
})().catch((e) => { console.error(e); process.exit(1); });

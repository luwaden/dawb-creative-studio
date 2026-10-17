/**
 * Render any video template on the server: npx tsx scripts/render-template.ts <templateId> [more ids]
 * Output: out/<id>.mp4
 */
import path from "node:path";
import fs from "node:fs";
import { renderVideoOnServer } from "../src/lib/server/render/serverRenderer";
import { getTemplate } from "../src/lib/templates";

(async () => {
  for (const id of process.argv.slice(2)) {
    const t = getTemplate(id);
    if (!t || t.kind !== "video") throw new Error(`No video template ${id}`);
    const out = path.join(process.cwd(), "out", `${id}.mp4`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const t0 = Date.now();
    await renderVideoOnServer({ doc: t.build(), assetBase: process.env.ASSET_BASE ?? "http://localhost:3000", assetQuery: "", codec: "h264", outputPath: out });
    console.log(`${id}: ${((Date.now() - t0) / 1000).toFixed(1)}s → ${out}`);
  }
})().catch((e) => { console.error(e); process.exit(1); });

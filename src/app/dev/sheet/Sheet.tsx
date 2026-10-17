"use client";

import { useEffect, useState } from "react";
import { ALL_TEMPLATES, getTemplate } from "@/lib/templates";
import { pageView } from "@/lib/design/types";
import { renderDesign } from "@/lib/design/render";

export function Sheet({ id, width }: { id: string; width: number }) {
  const [imgs, setImgs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => {
    const ids = id === "all" ? ALL_TEMPLATES.filter((t) => t.kind === "design").map((t) => t.id) : id.split(",");
    (async () => {
      const out: string[] = [];
      for (const tid of ids) {
        const t = getTemplate(tid);
        if (!t || t.kind !== "design") continue;
        const doc = t.build();
        for (let i = 0; i < (id === "all" ? 1 : doc.pages.length); i++) {
          out.push(await renderDesign(pageView(doc, i), { pixelRatio: width / doc.width, mimeType: "image/jpeg", quality: 0.9, preview: true }));
          setImgs([...out]);
        }
      }
      setDone(true);
    })();
  }, [id, width]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 12, padding: 12, background: "#888" }} data-done={done ? "1" : "0"} id="sheet">
      {imgs.map((s, i) => <img key={i} src={s} width={width} alt="" />)}
    </div>
  );
}

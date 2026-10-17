"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Thumbnail } from "@remotion/player";
import type { Template } from "@/lib/templates/types";
import { pageView } from "@/lib/design/types";
import { renderDesign } from "@/lib/design/render";
import { DawbVideo } from "@/remotion/DawbVideo";
import { ASPECTS, getSceneStarts } from "@/lib/video/types";

const cache = new Map<string, string>();

function useVisible<T extends Element>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setVisible(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);
  return { ref, visible };
}

function DesignThumb({ template, width }: { template: Extract<Template, { kind: "design" }>; width: number }) {
  const { ref, visible } = useVisible<HTMLDivElement>();
  const [src, setSrc] = useState<string | null>(cache.get(template.id) ?? null);
  const [failed, setFailed] = useState(false);
  const doc = useMemo(() => template.build(), [template]);
  useEffect(() => {
    if (!visible || src) return;
    let alive = true;
    renderDesign(pageView(doc, 0), { pixelRatio: width / doc.width, mimeType: "image/jpeg", quality: 0.86, preview: true })
      .then((url) => {
        cache.set(template.id, url);
        if (alive) setSrc(url);
      })
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [visible, src, doc, template.id, width]);
  return (
    <div ref={ref} className="relative w-full overflow-hidden bg-canvas" style={{ aspectRatio: `${doc.width} / ${doc.height}` }}>
      {src ? <img src={src} alt={template.name} className="absolute inset-0 h-full w-full object-cover" draggable={false} /> : <div className="absolute inset-0 animate-pulse bg-line/50" />}
      {failed && <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">Preview unavailable</div>}
    </div>
  );
}

function VideoThumb({ template }: { template: Extract<Template, { kind: "video" }> }) {
  const { ref, visible } = useVisible<HTMLDivElement>();
  const doc = useMemo(() => template.build(), [template]);
  const a = ASPECTS[doc.aspect];
  // Show the first scene once its intro animation has settled.
  const settle = doc.scenes[0].type === "logo-reveal" ? 125 : doc.scenes[0].type === "greeting" || doc.scenes[0].type === "month" ? 75 : 55;
  const frame = Math.min(getSceneStarts(doc)[0] + settle, doc.scenes[0].durationInFrames - 5);
  return (
    <div ref={ref} className="relative w-full overflow-hidden bg-ink" style={{ aspectRatio: `${a.width} / ${a.height}` }}>
      {visible && (
        <Thumbnail component={DawbVideo} inputProps={{ doc }} compositionWidth={a.width} compositionHeight={a.height} durationInFrames={doc.scenes.reduce((n, s) => n + s.durationInFrames, 0)} fps={doc.fps} frameToDisplay={frame} style={{ width: "100%", height: "100%" }} />
      )}
    </div>
  );
}

export function TemplateThumb({ template, width = 420 }: { template: Template; width?: number }) {
  return template.kind === "design" ? <DesignThumb template={template} width={width} /> : <VideoThumb template={template} />;
}

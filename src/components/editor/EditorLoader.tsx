"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { DesignDoc } from "@/lib/design/types";
import type { VideoDoc } from "@/lib/video/types";
import type { Project, ProjectMeta } from "@/lib/projects";
import { getTemplate } from "@/lib/templates";
import { api } from "@/lib/client/api";
import { Spinner } from "@/components/ui";

const DesignEditor = dynamic(() => import("@/components/design/DesignEditor").then((m) => m.DesignEditor), { ssr: false, loading: () => <Loading /> });
const VideoEditor = dynamic(() => import("@/components/video/VideoEditor").then((m) => m.VideoEditor), { ssr: false, loading: () => <Loading /> });

function Loading() {
  return <div className="flex h-dvh items-center justify-center gap-3 text-sm text-muted"><Spinner /> Opening editor…</div>;
}

type Loaded = { doc: DesignDoc | VideoDoc; meta: ProjectMeta | null; templateId: string | null; name: string };

/** Opens a saved project, or a fresh copy of a template (?template=…) for /new. */
export function EditorLoader({ kind, id }: { kind: "design" | "video"; id: string }) {
  const params = useSearchParams();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    // Load once: the editor rewrites the URL after the first save, which must not reload it.
    if (started.current) return;
    started.current = true;
    if (id === "new") {
      const t = getTemplate(params.get("template"));
      if (!t || t.kind !== kind) {
        setError("That template could not be found.");
        return;
      }
      setLoaded({ doc: t.build(), meta: null, templateId: t.id, name: t.name });
      return;
    }
    api<Project>(`/api/projects/${id}`)
      .then((p) => {
        if (p.meta.kind !== kind) throw new Error("This project is a different type.");
        setLoaded({ doc: p.doc, meta: p.meta, templateId: p.meta.templateId, name: p.meta.name });
      })
      .catch((e) => setError(e.message));
  }, [id, kind, params]);

  if (error) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center gap-3 text-sm">
        <p className="font-semibold">{error}</p>
        <Link href="/templates" className="text-brand-600 underline">Back to templates</Link>
      </div>
    );
  }
  if (!loaded) return <Loading />;
  return kind === "design" ? (
    <DesignEditor initialDoc={loaded.doc as DesignDoc} initialMeta={loaded.meta} templateId={loaded.templateId} initialName={loaded.name} />
  ) : (
    <VideoEditor initialDoc={loaded.doc as VideoDoc} initialMeta={loaded.meta} templateId={loaded.templateId} initialName={loaded.name} />
  );
}

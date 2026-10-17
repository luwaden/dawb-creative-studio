"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectDoc, ProjectKind, ProjectMeta } from "@/lib/projects";
import { api, ApiError } from "./api";

export type SaveStatus = "unsaved" | "saving" | "saved" | "error" | "conflict";

/**
 * Save / autosave for an editor. The first save creates the project and swaps the
 * URL to /design/<id> (or /video/<id>); later saves send the revision so two
 * teammates can't silently overwrite each other.
 */
export function useProjectSaver(opts: {
  kind: ProjectKind;
  initialMeta: ProjectMeta | null;
  templateId: string | null;
  getDoc: () => ProjectDoc;
  getName: () => string;
  makeThumbnail: () => Promise<string | undefined>;
  dirty: boolean;
  onSaved: () => void;
}) {
  const [meta, setMeta] = useState<ProjectMeta | null>(opts.initialMeta);
  const [status, setStatus] = useState<SaveStatus>(opts.initialMeta ? "saved" : "unsaved");
  const [error, setError] = useState<string | null>(null);
  const saving = useRef(false);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const metaRef = useRef(meta);
  metaRef.current = meta;

  const save = useCallback(async (mode: "normal" | "force" | "copy" = "normal"): Promise<ProjectMeta | null> => {
    if (saving.current) return metaRef.current;
    saving.current = true;
    setStatus("saving");
    setError(null);
    const o = optsRef.current;
    try {
      const thumbnail = await o.makeThumbnail().catch(() => undefined);
      const current = metaRef.current;
      let next: ProjectMeta;
      if (!current || mode === "copy") {
        const name = mode === "copy" ? `${o.getName()} (my version)` : o.getName();
        next = (await api<{ project: ProjectMeta }>("/api/projects", { method: "POST", json: { kind: o.kind, name, templateId: o.templateId, doc: o.getDoc(), thumbnail } })).project;
        window.history.replaceState(null, "", `/${o.kind}/${next.id}`);
      } else {
        next = (await api<{ project: ProjectMeta }>(`/api/projects/${current.id}`, { method: "PUT", json: { name: o.getName(), doc: o.getDoc(), thumbnail, baseRevision: current.revision, force: mode === "force" } })).project;
      }
      setMeta(next);
      setStatus("saved");
      o.onSaved();
      return next;
    } catch (e) {
      const err = e as ApiError;
      setStatus(err.status === 409 ? "conflict" : "error");
      setError(err.message);
      return null;
    } finally {
      saving.current = false;
    }
  }, []);

  // Autosave once the project exists.
  useEffect(() => {
    if (!opts.dirty || !meta || status === "conflict") return;
    const t = setTimeout(() => void save(), 4000);
    return () => clearTimeout(t);
  }, [opts.dirty, meta, status, save, opts.getDoc]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => {
      if (optsRef.current.dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, []);

  useEffect(() => {
    if (opts.dirty && status === "saved") setStatus("unsaved");
  }, [opts.dirty, status]);

  const recordExport = useCallback(async (rec: { format: "png" | "jpeg" | "mp4" | "webm"; mode: "browser" | "server"; width: number; height: number; sizeBytes: number | null }) => {
    const m = metaRef.current;
    if (!m) return;
    try {
      const r = await api<{ project: ProjectMeta }>(`/api/projects/${m.id}/exports`, { method: "POST", json: rec });
      setMeta((cur) => (cur ? { ...cur, exports: r.project.exports, revision: r.project.revision } : cur));
    } catch {
      /* history is best-effort; the file was already delivered */
    }
  }, []);

  return { meta, status, error, save, recordExport };
}

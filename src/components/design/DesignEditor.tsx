"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Download, LayoutGrid, Loader2, Plus, Redo2, Save, Shapes, SlidersHorizontal, Trash2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import type { DesignDoc, DesignElement } from "@/lib/design/types";
import { pageView } from "@/lib/design/types";
import { addBlankPage, duplicateElements, duplicatePage, initState, movePage, newId, reducer, removeElements, removePage, reorder, updateElement, updatePage } from "@/lib/design/history";
import { dataUrlToBlob, downloadBlob, renderDesign, safeFilename } from "@/lib/design/render";
import { createZip } from "@/lib/client/zip";
import { useProjectSaver } from "@/lib/client/useProjectSaver";
import type { ProjectMeta } from "@/lib/projects";
import { AssetPicker } from "@/components/assets/AssetPicker";
import { Button, cx, Field, IconButton, Input, Modal, Select, Spinner, toast, Toaster } from "@/components/ui";
import { EditorCanvas } from "./EditorCanvas";
import { AddPanel, ColorField, ElementProperties, makeElement, QuickEdit, type AddKind } from "./panels";

type LeftTab = "quick" | "add";

export function DesignEditor({ initialDoc, initialMeta, templateId, initialName }: { initialDoc: DesignDoc; initialMeta: ProjectMeta | null; templateId: string | null; initialName: string }) {
  const [state, dispatch] = useReducer(reducer, initialDoc, initState);
  const [name, setName] = useState(initialName);
  const [leftTab, setLeftTab] = useState<LeftTab>("quick");
  const [mobilePanel, setMobilePanel] = useState<null | "left" | "right">(null);
  const [zoom, setZoom] = useState<number | null>(null); // null = fit
  const [fitScale, setFitScale] = useState(0.5);
  const [picker, setPicker] = useState<null | { target: "element" | "background"; id?: string; logo?: boolean }>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [pageThumbs, setPageThumbs] = useState<string[]>([]);
  const stageWrap = useRef<HTMLDivElement>(null);

  const { doc, pageIndex, selected } = state;
  const view = useMemo(() => pageView(doc, pageIndex), [doc, pageIndex]);
  const scale = zoom ?? fitScale;
  const selectedEls = view.elements.filter((e) => selected.includes(e.id));
  const single = selectedEls.length === 1 ? selectedEls[0] : null;

  const docRef = useRef(doc);
  docRef.current = doc;
  const nameRef = useRef(name);
  nameRef.current = name;

  const saver = useProjectSaver({
    kind: "design",
    initialMeta,
    templateId,
    getDoc: useCallback(() => docRef.current, []),
    getName: useCallback(() => nameRef.current, []),
    makeThumbnail: useCallback(() => renderDesign(pageView(docRef.current, 0), { pixelRatio: 480 / docRef.current.width, mimeType: "image/jpeg", quality: 0.82, preview: true }), []),
    dirty: state.dirty || name !== (initialMeta?.name ?? initialName),
    onSaved: useCallback(() => dispatch({ type: "saved" }), []),
  });

  // Fit canvas to the available area.
  useEffect(() => {
    const el = stageWrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const pad = 48;
      setFitScale(Math.max(0.05, Math.min((el.clientWidth - pad) / doc.width, (el.clientHeight - pad) / doc.height)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [doc.width, doc.height]);

  // Page strip thumbnails (debounced).
  useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      const out: string[] = [];
      for (let i = 0; i < doc.pages.length; i++) {
        try {
          out.push(await renderDesign(pageView(doc, i), { pixelRatio: 120 / doc.width, mimeType: "image/jpeg", quality: 0.7, preview: true }));
        } catch {
          out.push("");
        }
      }
      if (alive) setPageThumbs(out);
    }, 700);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [doc]);

  const mutate = useCallback((fn: (d: DesignDoc) => DesignDoc, coalesce?: string) => dispatch({ type: "mutate", fn, coalesce }), []);
  const patchEl = useCallback((id: string, patch: Partial<DesignElement>, coalesce?: string) => mutate((d) => updateElement(d, pageIndex, id, patch), coalesce), [mutate, pageIndex]);

  const actions = {
    duplicate: () => {
      const { doc: next, newIds } = duplicateElements(doc, pageIndex, selected);
      mutate(() => next);
      dispatch({ type: "select", ids: newIds });
    },
    remove: () => mutate((d) => removeElements(d, pageIndex, selected)),
    order: (w: "forward" | "backward" | "front" | "back") => single && mutate((d) => reorder(d, pageIndex, single.id, w)),
    replaceImage: () => single && setPicker({ target: "element", id: single.id, logo: single.type === "image" && single.role === "logo" }),
  };

  const add = (k: AddKind) => {
    const el = makeElement(k, view, newId());
    mutate((d) => updatePage(d, pageIndex, (p) => ({ ...p, elements: [...p.elements, el] })));
    dispatch({ type: "select", ids: [el.id] });
    if (k === "photo") setPicker({ target: "element", id: el.id });
    setMobilePanel(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        dispatch({ type: e.shiftKey ? "redo" : "undo" });
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        dispatch({ type: "redo" });
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saver.save();
      } else if (mod && e.key.toLowerCase() === "d" && selected.length) {
        e.preventDefault();
        actions.duplicate();
      } else if ((e.key === "Delete" || e.key === "Backspace") && selected.length) {
        e.preventDefault();
        actions.remove();
      } else if (e.key === "Escape") {
        dispatch({ type: "select", ids: [] });
      } else if (e.key.startsWith("Arrow") && selected.length) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
        const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
        mutate((d) => selected.reduce((acc, id) => {
          const el = acc.pages[pageIndex].elements.find((x) => x.id === id);
          return el && !el.locked ? updateElement(acc, pageIndex, id, { x: el.x + dx, y: el.y + dy }) : acc;
        }, d), "nudge");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onPick = (url: string) => {
    if (!picker) return;
    if (picker.target === "background") mutate((d) => updatePage(d, pageIndex, (p) => ({ ...p, background: { ...p.background, imageSrc: url, imageOpacity: p.background.imageOpacity ?? 1 } })));
    else if (picker.id) patchEl(picker.id, { src: url, cropZoom: 1, cropX: 0, cropY: 0 });
  };

  const statusLabel = { unsaved: saver.meta ? "Unsaved changes" : "Not saved yet", saving: "Saving…", saved: "Saved", error: "Save failed", conflict: "Newer version exists" }[saver.status];

  const leftPanel = (
    <>
      <div className="flex border-b border-line">
        {(["quick", "add"] as LeftTab[]).map((t) => (
          <button key={t} onClick={() => setLeftTab(t)} className={cx("flex-1 py-2.5 text-[13px] font-medium", leftTab === t ? "border-b-2 border-brand text-ink" : "text-muted hover:text-ink")}>
            {t === "quick" ? "Quick edit" : "Add elements"}
          </button>
        ))}
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto">
        {leftTab === "quick" ? (
          <QuickEdit
            doc={doc}
            pageIndex={pageIndex}
            onText={(id, text) => patchEl(id, { text }, `${id}:text`)}
            onPalette={(key, value) => mutate((d) => ({ ...d, palette: { ...d.palette, [key]: value } }), `pal:${key}`)}
            onPickImage={(id) => {
              const el = view.elements.find((e) => e.id === id);
              setPicker({ target: "element", id, logo: el?.type === "image" && el.role === "logo" });
            }}
            onSelect={(id) => dispatch({ type: "select", ids: [id] })}
          />
        ) : (
          <AddPanel onAdd={add} />
        )}
      </div>
    </>
  );

  const page = doc.pages[pageIndex];
  const rightPanel = (
    <div className="panel-scroll flex-1 overflow-y-auto">
      {single ? (
        <ElementProperties key={single.id} el={single} view={view} doc={doc} patch={(p, c) => patchEl(single.id, p, c)} actions={actions} />
      ) : selectedEls.length > 1 ? (
        <div className="space-y-3 p-4">
          <p className="text-sm font-semibold">{selectedEls.length} elements selected</p>
          <div className="flex gap-2">
            <Button size="sm" icon={<Copy size={14} />} onClick={actions.duplicate}>Duplicate</Button>
            <Button size="sm" variant="danger" icon={<Trash2 size={14} />} onClick={actions.remove}>Delete</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <p className="text-sm font-semibold">Slide {pageIndex + 1} background</p>
          <Field label="Slide name">
            <Input value={page.name ?? ""} onChange={(e) => mutate((d) => updatePage(d, pageIndex, (p) => ({ ...p, name: e.target.value })), `pn:${pageIndex}`)} />
          </Field>
          <ColorField label="Background colour" value={page.background.color} palette={doc.palette} paletteLabels={doc.paletteLabels} onChange={(v) => mutate((d) => updatePage(d, pageIndex, (p) => ({ ...p, background: { ...p.background, color: v } })), `bg:${pageIndex}`)} />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setPicker({ target: "background" })}>{page.background.imageSrc ? "Replace background image" : "Add background image"}</Button>
            {page.background.imageSrc && <Button size="sm" variant="ghost" onClick={() => mutate((d) => updatePage(d, pageIndex, (p) => ({ ...p, background: { color: p.background.color } })))}>Remove</Button>}
          </div>
          {page.background.imageSrc && (
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink-2">Image opacity</span>
              <input type="range" min={0} max={1} step={0.05} value={page.background.imageOpacity ?? 1} className="w-full" onChange={(e) => mutate((d) => updatePage(d, pageIndex, (p) => ({ ...p, background: { ...p.background, imageOpacity: Number(e.target.value) } })), `bgo:${pageIndex}`)} />
            </label>
          )}
          <p className="text-xs leading-relaxed text-muted">Click an element on the canvas to edit it. Shift-click selects several.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-2 sm:px-3">
        <Link href="/projects" className="rounded-md p-2 text-ink-2 hover:bg-canvas" aria-label="Back to projects"><ArrowLeft size={18} /></Link>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-40 border-transparent font-medium hover:border-line sm:w-64" aria-label="Project name" />
        <span className={cx("hidden text-xs md:inline", saver.status === "error" || saver.status === "conflict" ? "text-danger" : "text-muted")} title={saver.error ?? undefined}>{statusLabel}</span>
        <div className="ml-auto flex items-center gap-1">
          <IconButton label="Undo (Ctrl+Z)" onClick={() => dispatch({ type: "undo" })} disabled={!state.past.length}><Undo2 size={16} /></IconButton>
          <IconButton label="Redo (Ctrl+Shift+Z)" onClick={() => dispatch({ type: "redo" })} disabled={!state.future.length}><Redo2 size={16} /></IconButton>
          <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
          <div className="hidden items-center gap-1 sm:flex">
            <IconButton label="Zoom out" onClick={() => setZoom(Math.max(0.05, scale / 1.25))}><ZoomOut size={16} /></IconButton>
            <button className="w-12 text-center text-xs tabular-nums text-ink-2 hover:text-ink" onClick={() => setZoom(null)} title="Fit to screen">{Math.round(scale * 100)}%</button>
            <IconButton label="Zoom in" onClick={() => setZoom(Math.min(3, scale * 1.25))}><ZoomIn size={16} /></IconButton>
          </div>
          <Button size="sm" icon={saver.status === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} onClick={() => void saver.save()} disabled={saver.status === "saving"}>
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button size="sm" variant="primary" icon={<Download size={14} />} onClick={() => setExportOpen(true)}>
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>
      {saver.status === "conflict" && (
        <div className="flex flex-wrap items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          <span>{saver.error}</span>
          <Button size="sm" onClick={() => void saver.save("copy")}>Save mine as a copy</Button>
          <Button size="sm" variant="ghost" onClick={() => void saver.save("force")}>Overwrite theirs</Button>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[300px] shrink-0 flex-col border-r border-line bg-white lg:flex">{leftPanel}</aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div ref={stageWrap} className="checker relative flex-1 overflow-auto" onMouseDown={(e) => e.target === e.currentTarget && dispatch({ type: "select", ids: [] })}>
            <div className="flex min-h-full min-w-full items-center justify-center p-6" style={{ width: zoom ? doc.width * scale + 48 : undefined }}>
              <EditorCanvas view={view} scale={scale} selected={selected} onSelect={(ids) => dispatch({ type: "select", ids })} onChange={(changes) => mutate((d) => changes.reduce((acc, c) => updateElement(acc, pageIndex, c.id, c.patch), d))} />
            </div>
          </div>
          {/* Slides strip */}
          <div className="flex h-[92px] shrink-0 items-center gap-2 overflow-x-auto border-t border-line bg-white px-3">
            {doc.pages.map((p, i) => (
              <button key={p.id} onClick={() => dispatch({ type: "page", index: i })} className={cx("relative h-[68px] shrink-0 overflow-hidden rounded border-2 bg-canvas", i === pageIndex ? "border-brand" : "border-transparent hover:border-line-2")} style={{ aspectRatio: `${doc.width}/${doc.height}` }} aria-label={`Slide ${i + 1}${p.name ? `: ${p.name}` : ""}`}>
                {pageThumbs[i] && <img src={pageThumbs[i]} alt="" className="h-full w-full object-cover" />}
                <span className="absolute bottom-0.5 left-0.5 rounded bg-black/60 px-1 text-[10px] text-white">{i + 1}</span>
              </button>
            ))}
            <div className="ml-1 flex shrink-0 items-center gap-0.5 border-l border-line pl-2">
              <IconButton label="Add blank slide" onClick={() => { mutate((d) => addBlankPage(d, pageIndex)); dispatch({ type: "page", index: pageIndex + 1 }); }}><Plus size={16} /></IconButton>
              <IconButton label="Duplicate slide" onClick={() => { mutate((d) => duplicatePage(d, pageIndex)); dispatch({ type: "page", index: pageIndex + 1 }); }}><Copy size={15} /></IconButton>
              <IconButton label="Move slide left" disabled={pageIndex === 0} onClick={() => { mutate((d) => movePage(d, pageIndex, -1)); dispatch({ type: "page", index: pageIndex - 1 }); }}><ChevronLeft size={16} /></IconButton>
              <IconButton label="Move slide right" disabled={pageIndex === doc.pages.length - 1} onClick={() => { mutate((d) => movePage(d, pageIndex, 1)); dispatch({ type: "page", index: pageIndex + 1 }); }}><ChevronRight size={16} /></IconButton>
              <IconButton label="Delete slide" disabled={doc.pages.length === 1} onClick={() => mutate((d) => removePage(d, pageIndex))}><Trash2 size={15} /></IconButton>
            </div>
          </div>
          {/* Mobile panel switcher */}
          <div className="flex shrink-0 border-t border-line bg-white lg:hidden">
            <button className="flex flex-1 items-center justify-center gap-2 py-3 text-sm" onClick={() => setMobilePanel("left")}><LayoutGrid size={16} /> Content</button>
            <button className="flex flex-1 items-center justify-center gap-2 py-3 text-sm" onClick={() => { setLeftTab("add"); setMobilePanel("left"); }}><Shapes size={16} /> Add</button>
            <button className="flex flex-1 items-center justify-center gap-2 py-3 text-sm" onClick={() => setMobilePanel("right")}><SlidersHorizontal size={16} /> Properties</button>
          </div>
        </div>

        <aside className="hidden w-[300px] shrink-0 flex-col border-l border-line bg-white lg:flex">{rightPanel}</aside>
      </div>

      {mobilePanel && (
        <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setMobilePanel(null)}>
          <div className="absolute inset-x-0 bottom-0 flex max-h-[70vh] flex-col rounded-t-lg bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto my-2 h-1 w-10 rounded bg-line-2" />
            {mobilePanel === "left" ? leftPanel : rightPanel}
          </div>
        </div>
      )}

      <AssetPicker open={Boolean(picker)} onClose={() => setPicker(null)} preferLogos={picker?.logo} onPick={(a) => onPick(a.url)} />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} doc={doc} pageIndex={pageIndex} name={name} onExported={saver.recordExport} />
      <Toaster />
    </div>
  );
}

function ExportDialog({ open, onClose, doc, pageIndex, name, onExported }: { open: boolean; onClose: () => void; doc: DesignDoc; pageIndex: number; name: string; onExported: (r: { format: "png" | "jpeg"; mode: "browser"; width: number; height: number; sizeBytes: number | null }) => void }) {
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [size, setSize] = useState<1 | 2>(2);
  const [which, setWhich] = useState<"current" | "all">("current");
  const [busy, setBusy] = useState<string | null>(null);

  const run = async () => {
    const mime = format === "png" ? "image/png" : "image/jpeg";
    const ext = format === "png" ? "png" : "jpg";
    try {
      if (which === "current" || doc.pages.length === 1) {
        setBusy("Rendering…");
        const url = await renderDesign(pageView(doc, pageIndex), { pixelRatio: size, mimeType: mime, quality: 0.92 });
        const blob = await dataUrlToBlob(url);
        if (blob.size < 100) throw new Error("The export came out empty.");
        downloadBlob(blob, safeFilename(doc.pages.length > 1 ? `${name}-slide-${pageIndex + 1}` : name, ext));
        onExported({ format, mode: "browser", width: doc.width * size, height: doc.height * size, sizeBytes: blob.size });
      } else {
        const files: Array<{ name: string; data: Uint8Array }> = [];
        for (let i = 0; i < doc.pages.length; i++) {
          setBusy(`Rendering slide ${i + 1} of ${doc.pages.length}…`);
          const url = await renderDesign(pageView(doc, i), { pixelRatio: size, mimeType: mime, quality: 0.92 });
          files.push({ name: `${String(i + 1).padStart(2, "0")}-${safeFilename(doc.pages[i].name ?? "slide", ext)}`, data: new Uint8Array(await (await dataUrlToBlob(url)).arrayBuffer()) });
        }
        const zip = createZip(files);
        downloadBlob(zip, safeFilename(name, "zip"));
        onExported({ format, mode: "browser", width: doc.width * size, height: doc.height * size, sizeBytes: zip.size });
      }
      toast("Export downloaded", "success");
      onClose();
    } catch (e) {
      toast(`Export failed: ${(e as Error).message}`, "error");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export design" width={440}>
      <div className="space-y-4">
        <Field label="File type">
          <Select value={format} onChange={(e) => setFormat(e.target.value as "png" | "jpeg")}>
            <option value="png">PNG — best quality</option>
            <option value="jpeg">JPEG — smaller file</option>
          </Select>
        </Field>
        <Field label="Size">
          <Select value={size} onChange={(e) => setSize(Number(e.target.value) as 1 | 2)}>
            <option value={1}>{doc.width} × {doc.height} px (1×)</option>
            <option value={2}>{doc.width * 2} × {doc.height * 2} px (2×, recommended)</option>
          </Select>
        </Field>
        {doc.pages.length > 1 && (
          <Field label="Slides">
            <Select value={which} onChange={(e) => setWhich(e.target.value as "current" | "all")}>
              <option value="current">Current slide ({pageIndex + 1})</option>
              <option value="all">All {doc.pages.length} slides (ZIP)</option>
            </Select>
          </Field>
        )}
        <Button variant="primary" className="w-full" onClick={run} disabled={Boolean(busy)} icon={busy ? <Spinner size={14} /> : <Download size={15} />}>
          {busy ?? "Download"}
        </Button>
      </div>
    </Modal>
  );
}

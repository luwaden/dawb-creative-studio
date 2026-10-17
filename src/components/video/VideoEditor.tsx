"use client";

import Link from "next/link";
import { Player, type PlayerRef } from "@remotion/player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Copy, Download, Film, Image as ImageIcon, Loader2, Music, Plus, Redo2, Save, Settings2, SlidersHorizontal, Trash2, Undo2, X } from "lucide-react";
import type { ProjectMeta } from "@/lib/projects";
import { useHistory } from "@/lib/client/useHistory";
import { useProjectSaver } from "@/lib/client/useProjectSaver";
import { SCENE_DEFINITIONS, SCENE_TYPES, type FieldDef } from "@/lib/video/scenes";
import { newSceneId, scene as makeScene } from "@/lib/video/build";
import { ASPECTS, getSceneStarts, getVideoDuration, resolveThemeColor, type AspectId, type Scene, type SceneBackground, type SceneTransition, type VideoDoc } from "@/lib/video/types";
import { checkBrowserSupport, renderInBrowser, renderOnServer, type RenderMode } from "@/lib/video/renderClient";
import { FONTS } from "@/lib/fonts";
import { DawbVideo } from "@/remotion/DawbVideo";
import { AssetPicker } from "@/components/assets/AssetPicker";
import { downloadBlob, safeFilename } from "@/lib/design/render";
import { useWorkspace, WorkspaceProvider } from "@/components/shell/WorkspaceProvider";
import { Button, cx, Field, IconButton, Input, Modal, Select, Spinner, TextArea, toast, Toaster } from "@/components/ui";

const THEME_TOKENS: Array<{ key: "primary" | "ink" | "paper" | "accent"; label: string }> = [
  { key: "primary", label: "DAWB teal" },
  { key: "accent", label: "Highlight" },
  { key: "ink", label: "Dark text" },
  { key: "paper", label: "Light / base" },
];

export function VideoEditor(props: { initialDoc: VideoDoc; initialMeta: ProjectMeta | null; templateId: string | null; initialName: string }) {
  return (
    <WorkspaceProvider>
      <VideoEditorInner {...props} />
    </WorkspaceProvider>
  );
}

function VideoEditorInner({ initialDoc, initialMeta, templateId, initialName }: { initialDoc: VideoDoc; initialMeta: ProjectMeta | null; templateId: string | null; initialName: string }) {
  const h = useHistory<VideoDoc>(initialDoc);
  const doc = h.value;
  const [name, setName] = useState(initialName);
  const [sel, setSel] = useState<string | null>(doc.scenes[0]?.id ?? null);
  const [panel, setPanel] = useState<"scene" | "video">("scene");
  const [mobilePanel, setMobilePanel] = useState(false);
  const [picker, setPicker] = useState<null | { mode: "image" | "audio"; apply: (url: string, name: string) => void }>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [frame, setFrame] = useState(0);
  const player = useRef<PlayerRef>(null);

  const a = ASPECTS[doc.aspect];
  const duration = getVideoDuration(doc);
  const starts = useMemo(() => getSceneStarts(doc), [doc]);
  const scene = doc.scenes.find((s) => s.id === sel) ?? null;
  const sceneIndex = scene ? doc.scenes.indexOf(scene) : -1;
  const inputProps = useMemo(() => ({ doc }), [doc]);

  const docRef = useRef(doc);
  docRef.current = doc;
  const nameRef = useRef(name);
  nameRef.current = name;
  const saver = useProjectSaver({
    kind: "video",
    initialMeta,
    templateId,
    getDoc: useCallback(() => docRef.current, []),
    getName: useCallback(() => nameRef.current, []),
    makeThumbnail: useCallback(() => makeVideoThumbnail(), []),
    dirty: h.dirty || name !== (initialMeta?.name ?? initialName),
    onSaved: h.markSaved,
  });

  useEffect(() => {
    const p = player.current;
    if (!p) return;
    const onFrame = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    p.addEventListener("frameupdate", onFrame);
    return () => p.removeEventListener("frameupdate", onFrame);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") { e.preventDefault(); (e.shiftKey ? h.redo : h.undo)(); }
      else if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); void saver.save(); }
      else if (e.key === " ") { e.preventDefault(); player.current?.toggle(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const setScene = (id: string, fn: (s: Scene) => Scene, key?: string) => h.set((d) => ({ ...d, scenes: d.scenes.map((s) => (s.id === id ? fn(s) : s)) }), key);
  const setProp = (k: string, v: unknown) => scene && setScene(scene.id, (s) => ({ ...s, props: { ...s.props, [k]: v } }), `${scene.id}:${k}`);
  const seekToScene = (i: number) => player.current?.seekTo(starts[i] + Math.min(45, doc.scenes[i].durationInFrames - 1));

  // Thumbnail = a still of the first scene, taken from the live player DOM is not possible; render first scene frame via web renderer when available.
  async function makeVideoThumbnail(): Promise<string | undefined> {
    try {
      const { renderStillOnWeb } = await import("@remotion/web-renderer");
      const d = docRef.current;
      const asp = ASPECTS[d.aspect];
      const res = await renderStillOnWeb({
        composition: { id: "DawbVideo", component: DawbVideo, durationInFrames: getVideoDuration(d), fps: d.fps, width: asp.width, height: asp.height },
        inputProps: { doc: d, assetBase: window.location.origin, assetQuery: "" },
        frame: Math.min(50, d.scenes[0].durationInFrames - 1),
        scale: 400 / asp.width,
      } as unknown as Parameters<typeof renderStillOnWeb>[0]);
      const blob = await res.blob({ format: "jpeg", quality: 0.8 } as never);
      return await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    } catch {
      return undefined;
    }
  }

  const statusLabel = { unsaved: saver.meta ? "Unsaved changes" : "Not saved yet", saving: "Saving…", saved: "Saved", error: "Save failed", conflict: "Newer version exists" }[saver.status];

  const scenePanel = scene ? (
    <SceneProperties
      key={scene.id}
      scene={scene}
      doc={doc}
      isLast={sceneIndex === doc.scenes.length - 1}
      setScene={(fn, key) => setScene(scene.id, fn, key)}
      setProp={setProp}
      pickImage={(apply) => setPicker({ mode: "image", apply })}
    />
  ) : (
    <p className="p-4 text-sm text-muted">Select a scene in the timeline.</p>
  );

  const videoPanel = (
    <VideoSettings doc={doc} set={h.set} pickAudio={() => setPicker({ mode: "audio", apply: (url: string, n: string) => h.set((d) => ({ ...d, audio: { src: url, name: n, volume: d.audio?.volume ?? 0.6, fadeOutFrames: d.audio?.fadeOutFrames ?? 45 } })) })} />
  );

  const sidePanel = (
    <>
      <div className="flex border-b border-line">
        {(["scene", "video"] as const).map((t) => (
          <button key={t} onClick={() => setPanel(t)} className={cx("flex-1 py-2.5 text-[13px] font-medium", panel === t ? "border-b-2 border-brand text-ink" : "text-muted hover:text-ink")}>
            {t === "scene" ? "Scene" : "Video settings"}
          </button>
        ))}
      </div>
      <div className="panel-scroll flex-1 overflow-y-auto">{panel === "scene" ? scenePanel : videoPanel}</div>
    </>
  );

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line bg-white px-2 sm:px-3">
        <Link href="/projects" className="rounded-md p-2 text-ink-2 hover:bg-canvas" aria-label="Back to projects"><ArrowLeft size={18} /></Link>
        <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 w-40 border-transparent font-medium hover:border-line sm:w-64" aria-label="Project name" />
        <span className={cx("hidden text-xs md:inline", saver.status === "error" || saver.status === "conflict" ? "text-danger" : "text-muted")} title={saver.error ?? undefined}>{statusLabel}</span>
        <div className="ml-auto flex items-center gap-1">
          <IconButton label="Undo" onClick={h.undo} disabled={!h.canUndo}><Undo2 size={16} /></IconButton>
          <IconButton label="Redo" onClick={h.redo} disabled={!h.canRedo}><Redo2 size={16} /></IconButton>
          <Button size="sm" icon={saver.status === "saving" ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} onClick={() => void saver.save()} disabled={saver.status === "saving"}><span className="hidden sm:inline">Save</span></Button>
          <Button size="sm" variant="primary" icon={<Download size={14} />} onClick={() => { player.current?.pause(); setExportOpen(true); }}><span className="hidden sm:inline">Export video</span></Button>
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
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Preview: the exact composition used for export */}
          <div className="flex min-h-0 flex-1 items-center justify-center bg-[#e9ecee] p-4">
            <div className="h-full max-h-full" style={{ aspectRatio: `${a.width}/${a.height}`, maxWidth: "100%" }}>
              <Player
                ref={player}
                component={DawbVideo}
                inputProps={inputProps}
                durationInFrames={duration}
                fps={doc.fps}
                compositionWidth={a.width}
                compositionHeight={a.height}
                controls
                clickToPlay
                doubleClickToFullscreen
                spaceKeyToPlayOrPause={false}
                acknowledgeRemotionLicense
                style={{ width: "100%", height: "100%", boxShadow: "0 8px 28px rgb(15 20 25 / 0.12)" }}
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="shrink-0 border-t border-line bg-white">
            <div className="flex items-center justify-between px-3 pt-2 text-xs text-muted">
              <span>{doc.scenes.length} scenes · {(duration / doc.fps).toFixed(1)} s · {a.label}</span>
              <span className="tabular-nums">{(frame / doc.fps).toFixed(1)} s</span>
            </div>
            <div className="relative flex gap-1 overflow-x-auto px-3 pb-3 pt-2">
              {doc.scenes.map((s, i) => {
                const active = s.id === sel;
                const playing = frame >= starts[i] && (i === doc.scenes.length - 1 || frame < starts[i + 1]);
                const bg = resolveThemeColor(s.background.color, doc.theme);
                return (
                  <button
                    key={s.id}
                    onClick={() => { setSel(s.id); setPanel("scene"); seekToScene(i); }}
                    className={cx("relative h-16 shrink-0 overflow-hidden rounded-md border-2 px-2 py-1.5 text-left", active ? "border-brand" : "border-line hover:border-line-2")}
                    style={{ width: Math.max(96, (s.durationInFrames / doc.fps) * 28), background: bg }}
                    aria-label={`Scene ${i + 1}: ${SCENE_DEFINITIONS[s.type].label}`}
                  >
                    <span className="block truncate rounded bg-white/90 px-1 text-[11px] font-semibold text-ink">{i + 1}. {SCENE_DEFINITIONS[s.type].label}</span>
                    <span className="mt-1 inline-block rounded bg-white/90 px-1 text-[10px] tabular-nums text-ink-2">{(s.durationInFrames / doc.fps).toFixed(1)}s{s.transition.type !== "none" && i < doc.scenes.length - 1 ? ` · ${s.transition.type}` : ""}</span>
                    {playing && <span className="absolute inset-x-0 bottom-0 h-1 bg-brand" />}
                  </button>
                );
              })}
              <button onClick={() => setAddOpen(true)} className="flex h-16 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-line-2 text-xs text-ink-2 hover:border-brand hover:text-ink">
                <Plus size={16} /> Add scene
              </button>
            </div>
            {scene && (
              <div className="flex items-center gap-1 border-t border-line px-3 py-1.5">
                <span className="mr-2 text-xs text-muted">Scene {sceneIndex + 1}</span>
                <IconButton label="Move left" disabled={sceneIndex === 0} onClick={() => h.set((d) => moveScene(d, sceneIndex, -1))}><ChevronLeft size={16} /></IconButton>
                <IconButton label="Move right" disabled={sceneIndex === doc.scenes.length - 1} onClick={() => h.set((d) => moveScene(d, sceneIndex, 1))}><ChevronRight size={16} /></IconButton>
                <IconButton label="Duplicate scene" onClick={() => { const id = newSceneId(); h.set((d) => { const sc = [...d.scenes]; sc.splice(sceneIndex + 1, 0, { ...scene, id }); return { ...d, scenes: sc }; }); setSel(id); }}><Copy size={15} /></IconButton>
                <IconButton label="Delete scene" disabled={doc.scenes.length === 1} onClick={() => { h.set((d) => ({ ...d, scenes: d.scenes.filter((s) => s.id !== scene.id) })); setSel(doc.scenes[Math.max(0, sceneIndex - 1)]?.id ?? null); }}><Trash2 size={15} /></IconButton>
                <button className="ml-auto flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-ink-2 hover:bg-canvas lg:hidden" onClick={() => setMobilePanel(true)}><SlidersHorizontal size={15} /> Edit</button>
              </div>
            )}
          </div>
        </div>
        <aside className="hidden w-[340px] shrink-0 flex-col border-l border-line bg-white lg:flex">{sidePanel}</aside>
      </div>

      {mobilePanel && (
        <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setMobilePanel(false)}>
          <div className="absolute inset-x-0 bottom-0 flex max-h-[75vh] flex-col rounded-t-lg bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end p-1"><IconButton label="Close" onClick={() => setMobilePanel(false)}><X size={16} /></IconButton></div>
            {sidePanel}
          </div>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add a scene" width={640}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SCENE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => {
                const s = makeScene(t, {}, { background: { color: scene?.background.color ?? "$ink" } });
                h.set((d) => { const sc = [...d.scenes]; sc.splice(sceneIndex + 1, 0, s); return { ...d, scenes: sc }; });
                setSel(s.id);
                setAddOpen(false);
              }}
              className="rounded-md border border-line p-3 text-left hover:border-brand"
            >
              <p className="text-sm font-semibold">{SCENE_DEFINITIONS[t].label}</p>
              <p className="mt-0.5 text-xs text-muted">{SCENE_DEFINITIONS[t].description}</p>
            </button>
          ))}
        </div>
      </Modal>

      <AssetPicker open={Boolean(picker)} mode={picker?.mode ?? "image"} onClose={() => setPicker(null)} onPick={(asset) => picker?.apply(asset.url, asset.name)} />
      <ExportVideoDialog open={exportOpen} onClose={() => setExportOpen(false)} doc={doc} name={name} onExported={saver.recordExport} />
      <Toaster />
    </div>
  );
}

function moveScene(d: VideoDoc, i: number, dir: -1 | 1): VideoDoc {
  const j = i + dir;
  if (j < 0 || j >= d.scenes.length) return d;
  const sc = [...d.scenes];
  [sc[i], sc[j]] = [sc[j], sc[i]];
  return { ...d, scenes: sc };
}

// ─────────────── scene properties ───────────────
function ThemeColor({ label, value, doc, onChange }: { label: string; value: string; doc: VideoDoc; onChange: (v: string) => void }) {
  const resolved = resolveThemeColor(value, doc.theme);
  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium text-ink-2">{label}</span>
      <div className="flex items-center gap-1.5">
        {THEME_TOKENS.map((t) => (
          <button key={t.key} title={t.label} aria-label={`Use ${t.label}`} onClick={() => onChange(`$${t.key}`)} className={cx("h-6 w-6 rounded border", value === `$${t.key}` ? "border-transparent ring-2 ring-brand ring-offset-1" : "border-line-2")} style={{ background: doc.theme[t.key] }} />
        ))}
        {["#000000", "#0D1F26", "#FFFFFF"].map((c) => (
          <button key={c} title={c} aria-label={`Use ${c}`} onClick={() => onChange(c)} className={cx("h-6 w-6 rounded border", value === c ? "border-transparent ring-2 ring-brand ring-offset-1" : "border-line-2")} style={{ background: c }} />
        ))}
        <label className="relative h-6 w-6 cursor-pointer overflow-hidden rounded border border-line-2" style={{ background: resolved }} title="Custom colour">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(resolved) ? resolved : "#000000"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0" aria-label={`${label} custom colour`} />
        </label>
      </div>
    </div>
  );
}

function SceneProperties({ scene, doc, isLast, setScene, setProp, pickImage }: {
  scene: Scene;
  doc: VideoDoc;
  isLast: boolean;
  setScene: (fn: (s: Scene) => Scene, key?: string) => void;
  setProp: (k: string, v: unknown) => void;
  pickImage: (apply: (url: string, name: string) => void) => void;
}) {
  const def = SCENE_DEFINITIONS[scene.type];
  const setBg = (patch: Partial<SceneBackground>, key?: string) => setScene((s) => ({ ...s, background: { ...s.background, ...patch } }), key);
  const setTr = (patch: Partial<SceneTransition>) => setScene((s) => ({ ...s, transition: { ...s.transition, ...patch } }));
  return (
    <div>
      <div className="border-b border-line px-4 py-3">
        <p className="text-sm font-semibold">{def.label}</p>
        <p className="text-xs text-muted">{def.description}</p>
      </div>
      <section className="space-y-3 border-b border-line px-4 py-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Content</h3>
        {def.fields.map((f) => <SceneField key={f.key} f={f} value={scene.props[f.key]} onChange={(v) => setProp(f.key, v)} pickImage={pickImage} />)}
      </section>
      <section className="space-y-3 border-b border-line px-4 py-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Timing</h3>
        <label className="block">
          <span className="mb-1 flex justify-between text-xs font-medium text-ink-2"><span>Duration</span><span className="tabular-nums text-muted">{(scene.durationInFrames / doc.fps).toFixed(1)} s</span></span>
          <input type="range" className="w-full" min={1} max={20} step={0.5} value={scene.durationInFrames / doc.fps} onChange={(e) => setScene((s) => ({ ...s, durationInFrames: Math.round(Number(e.target.value) * doc.fps) }), `${scene.id}:dur`)} />
        </label>
        {!isLast && (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Transition to next">
              <Select value={scene.transition.type} onChange={(e) => setTr({ type: e.target.value as SceneTransition["type"] })}>
                {["none", "fade", "slide", "wipe", "flip", "zoom"].map((t) => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
              </Select>
            </Field>
            {["slide", "wipe", "flip"].includes(scene.transition.type) && (
              <Field label="Direction">
                <Select value={scene.transition.direction ?? "from-right"} onChange={(e) => setTr({ direction: e.target.value as SceneTransition["direction"] })}>
                  <option value="from-right">From right</option>
                  <option value="from-left">From left</option>
                  <option value="from-bottom">From bottom</option>
                  <option value="from-top">From top</option>
                </Select>
              </Field>
            )}
          </div>
        )}
      </section>
      <section className="space-y-3 px-4 py-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted">Background</h3>
        <ThemeColor label="Colour" value={scene.background.color} doc={doc} onChange={(v) => setBg({ color: v })} />
        <div className="flex items-center gap-2">
          <Button size="sm" icon={<ImageIcon size={14} />} onClick={() => pickImage((url) => setBg({ imageSrc: url, overlay: Math.max(scene.background.overlay, 0.25) }))}>{scene.background.imageSrc ? "Replace image" : "Background image"}</Button>
          {scene.background.imageSrc && <Button size="sm" variant="ghost" onClick={() => setBg({ imageSrc: undefined })}>Remove</Button>}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Camera motion">
            <Select value={scene.background.motion} onChange={(e) => setBg({ motion: e.target.value as SceneBackground["motion"] })}>
              <option value="none">None</option>
              <option value="zoom-in">Slow zoom in</option>
              <option value="zoom-out">Slow zoom out</option>
              <option value="pan-left">Pan left</option>
              <option value="pan-right">Pan right</option>
            </Select>
          </Field>
          <Field label="Texture">
            <Select value={scene.background.texture ?? "none"} onChange={(e) => setBg({ texture: e.target.value as SceneBackground["texture"] })}>
              <option value="none">None</option>
              <option value="grid">Grid</option>
              <option value="dots">Dots</option>
              <option value="lines">Lines</option>
            </Select>
          </Field>
        </div>
        <label className="block">
          <span className="mb-1 flex justify-between text-xs font-medium text-ink-2"><span>Darken photo</span><span className="tabular-nums text-muted">{Math.round(scene.background.overlay * 100)}%</span></span>
          <input type="range" className="w-full" min={0} max={0.9} step={0.05} value={scene.background.overlay} onChange={(e) => setBg({ overlay: Number(e.target.value) }, `${scene.id}:ov`)} />
        </label>
      </section>
    </div>
  );
}

function SceneField({ f, value, onChange, pickImage }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void; pickImage: (apply: (url: string, name: string) => void) => void }) {
  switch (f.type) {
    case "text":
      return <Field label={f.label}><Input value={String(value ?? "")} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} /></Field>;
    case "textarea":
      return <Field label={f.label}><TextArea rows={f.rows ?? 3} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} className={f.key === "code" ? "font-mono text-xs" : undefined} /></Field>;
    case "number":
      return <Field label={f.label}><Input type="number" min={f.min} max={f.max} step={f.step ?? 1} value={Number(value ?? 0)} onChange={(e) => onChange(Math.max(f.min, Math.min(f.max, Number(e.target.value))))} /></Field>;
    case "select":
      return <Field label={f.label}><Select value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>{f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</Select></Field>;
    case "toggle":
      return <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {f.label}</label>;
    case "image": {
      const src = String(value ?? "");
      return (
        <div>
          <span className="mb-1.5 block text-xs font-medium text-ink-2">{f.label}</span>
          <div className="flex items-center gap-2">
            <div className="checker h-12 w-12 shrink-0 overflow-hidden rounded border border-line">{src && <img src={src} alt="" className="h-full w-full object-cover" />}</div>
            <Button size="sm" onClick={() => pickImage((url) => onChange(url))}>{src ? "Replace" : "Choose"}</Button>
            {src && <Button size="sm" variant="ghost" onClick={() => onChange("")}>Remove</Button>}
          </div>
        </div>
      );
    }
    case "list": {
      const items = Array.isArray(value) ? (value as Array<Record<string, string | number>>) : [];
      const update = (i: number, k: string, v: string | number) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
      return (
        <div>
          <span className="mb-1.5 block text-xs font-medium text-ink-2">{f.label}</span>
          <div className="space-y-2">
            {items.map((it, i) => (
              <div key={i} className="flex items-start gap-1.5 rounded-md border border-line p-2">
                <div className="grid flex-1 gap-1.5" style={{ gridTemplateColumns: f.item.length > 1 ? `repeat(${f.item.length}, minmax(0,1fr))` : "1fr" }}>
                  {f.item.map((sub) => (
                    <Input key={sub.key} aria-label={sub.label} placeholder={sub.label} type={sub.type === "number" ? "number" : "text"} value={String(it[sub.key] ?? "")} onChange={(e) => update(i, sub.key, sub.type === "number" ? Number(e.target.value) : e.target.value)} className="h-8 text-xs" />
                  ))}
                </div>
                <IconButton label="Remove item" onClick={() => onChange(items.filter((_, j) => j !== i))}><X size={14} /></IconButton>
              </div>
            ))}
            {items.length < f.max && (
              <Button size="sm" variant="ghost" icon={<Plus size={14} />} onClick={() => onChange([...items, Object.fromEntries(f.item.map((s) => [s.key, s.type === "number" ? 0 : ""]))])}>Add</Button>
            )}
          </div>
        </div>
      );
    }
  }
}

// ─────────────── video settings ───────────────
function VideoSettings({ doc, set, pickAudio }: { doc: VideoDoc; set: (fn: (d: VideoDoc) => VideoDoc, key?: string) => void; pickAudio: () => void }) {
  return (
    <div className="space-y-5 p-4">
      <div>
        <span className="mb-1.5 block text-xs font-medium text-ink-2">Format</span>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(ASPECTS) as AspectId[]).map((k) => (
            <button key={k} onClick={() => set((d) => ({ ...d, aspect: k }))} className={cx("rounded-md border px-3 py-2 text-left", doc.aspect === k ? "border-brand bg-brand-50" : "border-line hover:border-line-2")}>
              <p className="text-sm font-semibold">{ASPECTS[k].label}</p>
              <p className="text-[11px] text-muted">{ASPECTS[k].hint}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <span className="block text-xs font-medium text-ink-2">Colours</span>
        {THEME_TOKENS.map((t) => (
          <div key={t.key} className="flex items-center justify-between">
            <span className="text-sm text-ink-2">{t.label}</span>
            <label className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted">{doc.theme[t.key]}</span>
              <span className="relative h-7 w-7 overflow-hidden rounded border border-line-2" style={{ background: doc.theme[t.key] }}>
                <input type="color" value={doc.theme[t.key]} onChange={(e) => set((d) => ({ ...d, theme: { ...d.theme, [t.key]: e.target.value } }), `theme:${t.key}`)} className="absolute inset-0 opacity-0" aria-label={`${t.label} colour`} />
              </span>
            </label>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Headline font">
          <Select value={doc.theme.displayFont} onChange={(e) => set((d) => ({ ...d, theme: { ...d.theme, displayFont: e.target.value } }))}>{FONTS.map((f) => <option key={f.family} value={f.family}>{f.family}</option>)}</Select>
        </Field>
        <Field label="Body font">
          <Select value={doc.theme.bodyFont} onChange={(e) => set((d) => ({ ...d, theme: { ...d.theme, bodyFont: e.target.value } }))}>{FONTS.map((f) => <option key={f.family} value={f.family}>{f.family}</option>)}</Select>
        </Field>
      </div>
      <Field label="Logo" hint="Auto picks the official light or dark logo file to suit each scene.">
        <Select value={doc.logo} onChange={(e) => set((d) => ({ ...d, logo: e.target.value as VideoDoc["logo"] }))}>
          <option value="auto">Auto (recommended)</option>
          <option value="dark">Always dark-background logo</option>
          <option value="light">Always light-background logo</option>
          <option value="none">Hide logo</option>
        </Select>
      </Field>
      <Field label="Handles line">
        <Input value={doc.handle} onChange={(e) => set((d) => ({ ...d, handle: e.target.value }), "handle")} />
      </Field>
      <div>
        <span className="mb-1.5 block text-xs font-medium text-ink-2">Background music</span>
        {doc.audio ? (
          <div className="space-y-2 rounded-md border border-line p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 text-sm"><Music size={14} className="shrink-0" /> <span className="truncate">{doc.audio.name}</span></span>
              <IconButton label="Remove music" onClick={() => set((d) => ({ ...d, audio: null }))}><X size={14} /></IconButton>
            </div>
            <label className="block">
              <span className="mb-1 flex justify-between text-xs text-ink-2"><span>Volume</span><span>{Math.round(doc.audio.volume * 100)}%</span></span>
              <input type="range" className="w-full" min={0} max={1} step={0.05} value={doc.audio.volume} onChange={(e) => set((d) => (d.audio ? { ...d, audio: { ...d.audio, volume: Number(e.target.value) } } : d), "vol")} />
            </label>
            <label className="block">
              <span className="mb-1 flex justify-between text-xs text-ink-2"><span>Fade out</span><span>{(doc.audio.fadeOutFrames / doc.fps).toFixed(1)} s</span></span>
              <input type="range" className="w-full" min={0} max={5} step={0.5} value={doc.audio.fadeOutFrames / doc.fps} onChange={(e) => set((d) => (d.audio ? { ...d, audio: { ...d.audio, fadeOutFrames: Math.round(Number(e.target.value) * d.fps) } } : d), "fade")} />
            </label>
            <Button size="sm" variant="ghost" onClick={pickAudio}>Replace</Button>
          </div>
        ) : (
          <Button size="sm" icon={<Music size={14} />} onClick={pickAudio}>Add music</Button>
        )}
        <p className="mt-1.5 text-[11px] text-muted">Use music you have the rights to. Uploads are shared with the workspace.</p>
      </div>
    </div>
  );
}

// ─────────────── export ───────────────
function ExportVideoDialog({ open, onClose, doc, name, onExported }: { open: boolean; onClose: () => void; doc: VideoDoc; name: string; onExported: (r: { format: "mp4" | "webm"; mode: RenderMode; width: number; height: number; sizeBytes: number | null }) => void }) {
  const { info } = useWorkspace();
  const [mode, setMode] = useState<RenderMode>("browser");
  const [browserOk, setBrowserOk] = useState<{ ok: boolean; reason?: string; container: string } | null>(null);
  const [progress, setProgress] = useState<{ p: number; stage: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ctrl = useRef<AbortController | null>(null);
  const a = ASPECTS[doc.aspect];
  const seconds = getVideoDuration(doc) / doc.fps;

  useEffect(() => {
    if (!open) return;
    setError(null);
    checkBrowserSupport(doc).then((r) => {
      setBrowserOk(r);
      if (!r.ok && info?.serverRender) setMode("server");
    });
  }, [open, doc, info?.serverRender]);

  const start = async () => {
    setError(null);
    ctrl.current = new AbortController();
    setProgress({ p: 0, stage: "Starting" });
    try {
      const cb = { onProgress: (p: number, stage: string) => setProgress({ p, stage }), signal: ctrl.current.signal };
      const res = mode === "browser" ? await renderInBrowser(doc, cb) : await renderOnServer(doc, cb);
      downloadBlob(res.blob, safeFilename(name, res.format));
      onExported({ format: res.format, mode: res.mode, width: a.width, height: a.height, sizeBytes: res.blob.size });
      toast(`Video exported (${(res.blob.size / 1024 / 1024).toFixed(1)} MB ${res.format.toUpperCase()})`, "success");
      setProgress(null);
      onClose();
    } catch (e) {
      setProgress(null);
      if ((e as Error).name === "AbortError") setError("Export cancelled.");
      else setError((e as Error).message || "Export failed");
    }
  };

  return (
    <Modal open={open} onClose={() => { if (!progress) onClose(); }} title="Export video" width={480}>
      <div className="space-y-4">
        <p className="text-sm text-muted">{a.width} × {a.height} · {doc.fps} fps · {seconds.toFixed(1)} s</p>
        <div className="space-y-2">
          <label className={cx("flex cursor-pointer gap-3 rounded-md border p-3", mode === "browser" ? "border-brand bg-brand-50" : "border-line", browserOk && !browserOk.ok && "opacity-60")}>
            <input type="radio" name="mode" checked={mode === "browser"} disabled={Boolean(browserOk && !browserOk.ok)} onChange={() => setMode("browser")} />
            <span>
              <span className="block text-sm font-semibold">In this browser</span>
              <span className="block text-xs text-muted">{browserOk ? (browserOk.ok ? `${browserOk.container.toUpperCase()} · keep this tab open while it renders` : browserOk.reason) : "Checking browser support…"}</span>
            </span>
          </label>
          <label className={cx("flex cursor-pointer gap-3 rounded-md border p-3", mode === "server" ? "border-brand bg-brand-50" : "border-line", !info?.serverRender && "opacity-60")}>
            <input type="radio" name="mode" checked={mode === "server"} disabled={!info?.serverRender} onChange={() => setMode("server")} />
            <span>
              <span className="block text-sm font-semibold">On the render server</span>
              <span className="block text-xs text-muted">{info?.serverRender ? "MP4 (H.264) via Remotion on this computer's server" : "Not available on this deployment"}</span>
            </span>
          </label>
        </div>
        {progress && (
          <div>
            <div className="mb-1 flex justify-between text-xs text-ink-2"><span>{progress.stage}</span><span className="tabular-nums">{Math.round(progress.p * 100)}%</span></div>
            <div className="h-2 overflow-hidden rounded bg-canvas"><div className="h-full bg-brand transition-[width]" style={{ width: `${Math.round(progress.p * 100)}%` }} /></div>
          </div>
        )}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        {progress ? (
          <Button className="w-full" onClick={() => ctrl.current?.abort()}>Cancel</Button>
        ) : (
          <Button variant="primary" className="w-full" icon={<Film size={15} />} onClick={start} disabled={mode === "browser" ? !browserOk?.ok : !info?.serverRender}>Render & download</Button>
        )}
      </div>
    </Modal>
  );
}

void Settings2;
void Spinner;

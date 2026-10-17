"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music, Trash2, Upload } from "lucide-react";
import type { AssetKind, AssetMeta } from "@/lib/projects";
import { BRAND_LOGOS } from "@/lib/projects";
import { api } from "@/lib/client/api";
import { uploadAsset } from "@/lib/client/upload";
import { FONTS } from "@/lib/fonts";
import { useWorkspace } from "@/components/shell/WorkspaceProvider";
import { Button, cx, Empty, Select, Spinner, toast } from "@/components/ui";

const COLORS = [
  ["DAWB Teal", "#0097B2", "Primary — accents, highlights, CTAs"],
  ["Deep Teal", "#006070", "Phase 3 & 4 headers, secondary"],
  ["Near Black", "#0D1F26", "Primary dark backgrounds"],
  ["Midnight", "#1A3A47", "Secondary dark backgrounds"],
  ["Off White", "#F2F9FB", "Light backgrounds"],
  ["Light Teal", "#E0F5F9", "Subtle highlights, infographics"],
];

export function BrandPage() {
  const { info } = useWorkspace();
  const [assets, setAssets] = useState<AssetMeta[] | null>(null);
  const [kind, setKind] = useState<AssetKind>("image");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<"all" | AssetKind>("all");
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api<{ assets: AssetMeta[] }>("/api/assets").then((r) => setAssets(r.assets)).catch((e) => { toast(e.message, "error"); setAssets([]); });
  }, []);
  useEffect(load, [load]);

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    let ok = 0;
    for (const f of Array.from(files)) {
      try { await uploadAsset(f, kind); ok++; } catch (e) { toast(`${f.name}: ${(e as Error).message}`, "error"); }
    }
    setBusy(false);
    if (ok) toast(`Uploaded ${ok} file${ok > 1 ? "s" : ""}`, "success");
    load();
  };

  const remove = async (a: AssetMeta) => {
    if (!confirm(`Delete “${a.name}”? Designs using it will show an empty slot.`)) return;
    try { await api(`/api/assets/${a.id}`, { method: "DELETE" }); setAssets((x) => x?.filter((y) => y.id !== a.id) ?? null); } catch (e) { toast((e as Error).message, "error"); }
  };

  const shown = (assets ?? []).filter((a) => filter === "all" || a.kind === filter);

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Brand assets</h1>
        <p className="mt-1 text-sm text-muted">Official DAWB files, the campaign design system, and your team's uploads.</p>
      </div>

      <section>
        <h2 className="text-sm font-semibold">Official logo files</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">These are the supplied files, unchanged. Each carries its own background square, so use the dark version on black and the light version on white. For transparent use on other colours, upload a transparent logo version below.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {BRAND_LOGOS.map((l) => (
            <a key={l.id} href={l.url} download className="overflow-hidden rounded-md border border-line bg-white hover:shadow-float">
              <img src={l.url} alt={l.name} className="aspect-square w-full" />
              <div className="border-t border-line px-3 py-2 text-xs"><p className="font-medium">{l.background === "#000000" ? "Dark background" : "Light background"}</p><p className="text-muted">SVG · download</p></div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Campaign colours</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {COLORS.map(([n, hex, use]) => (
            <button key={hex} onClick={() => { navigator.clipboard?.writeText(hex); toast(`Copied ${hex}`); }} className="overflow-hidden rounded-md border border-line bg-white text-left">
              <div className="h-16" style={{ background: hex }} />
              <div className="px-3 py-2"><p className="text-xs font-semibold">{n}</p><p className="font-mono text-[11px] text-muted">{hex}</p><p className="mt-1 text-[11px] leading-snug text-muted">{use}</p></div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Typography</h2>
        <div className="mt-4 divide-y divide-line rounded-md border border-line bg-white">
          {FONTS.slice(0, 5).map((f) => (
            <div key={f.family} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:justify-between">
              <span style={{ fontFamily: `"${f.family}"`, fontSize: 26, fontWeight: f.weights.includes(700) ? 700 : 400 }}>Research built civilization.</span>
              <span className="text-xs text-muted">{f.family} · {f.category === "serif" ? "Display / quotes" : f.category === "mono" ? "Data labels / code" : "Headlines & body"}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">Team uploads</h2>
            <p className="mt-1 text-sm text-muted">{info?.workspace === "shared" ? "Shared with everyone in the workspace." : "Stored on this computer."} PNG, JPEG, WebP, MP3, WAV, M4A, OGG.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={kind} onChange={(e) => setKind(e.target.value as AssetKind)} className="w-36" aria-label="Upload as">
              <option value="image">Photo</option>
              <option value="logo">Logo</option>
              <option value="background">Background</option>
            </Select>
            <input ref={input} type="file" multiple hidden accept="image/png,image/jpeg,image/webp,audio/*" onChange={(e) => { void onFiles(e.target.files); e.target.value = ""; }} />
            <Button variant="primary" icon={busy ? <Spinner size={14} /> : <Upload size={15} />} disabled={busy} onClick={() => input.current?.click()}>Upload</Button>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {(["all", "image", "logo", "background", "audio"] as const).map((k) => (
            <button key={k} onClick={() => setFilter(k)} className={cx("h-8 rounded-md border px-3 text-[13px] capitalize", filter === k ? "border-brand bg-brand-50 text-brand-600" : "border-line bg-white text-ink-2")}>{k === "all" ? "All" : k === "image" ? "Photos" : k}</button>
          ))}
        </div>
        <div className="mt-4">
          {!assets ? <div className="py-10 text-center"><Spinner /></div> : shown.length === 0 ? (
            <Empty title="Nothing here yet">Upload photos, transparent logos, backgrounds or music for your team.</Empty>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
              {shown.map((a) => (
                <div key={a.id} className="group relative overflow-hidden rounded-md border border-line bg-white">
                  {a.kind === "audio" ? (
                    <div className="flex aspect-square flex-col items-center justify-center gap-2 bg-canvas p-2"><Music size={22} className="text-muted" /><audio src={a.url} controls preload="none" className="w-full" /></div>
                  ) : (
                    <img src={a.url} alt={a.name} loading="lazy" className="checker aspect-square w-full object-cover" />
                  )}
                  <div className="border-t border-line px-2.5 py-2"><p className="truncate text-xs font-medium">{a.name}</p><p className="truncate text-[11px] capitalize text-muted">{a.kind} · {a.createdBy.name}</p></div>
                  <button onClick={() => remove(a)} aria-label={`Delete ${a.name}`} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white/95 text-danger opacity-0 group-hover:opacity-100 focus-visible:opacity-100"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

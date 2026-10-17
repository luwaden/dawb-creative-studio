"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import type { AssetMeta } from "@/lib/projects";
import { BRAND_LOGOS, BUILTIN_MUSIC } from "@/lib/projects";
import { api } from "@/lib/client/api";
import { markAssetUsed, uploadAsset } from "@/lib/client/upload";
import { Button, cx, Modal, Spinner, toast } from "@/components/ui";

export interface PickedAsset {
  url: string;
  name: string;
  id?: string;
}

/**
 * Pick an image (or audio) for a slot: official brand logos, uploaded team assets,
 * or a new upload. Calls onPick with a same-origin URL.
 */
export function AssetPicker({ open, onClose, onPick, mode = "image", preferLogos }: { open: boolean; onClose: () => void; onPick: (a: PickedAsset) => void; mode?: "image" | "audio"; preferLogos?: boolean }) {
  const [assets, setAssets] = useState<AssetMeta[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    api<{ assets: AssetMeta[] }>(`/api/assets${mode === "audio" ? "?kind=audio" : ""}`)
      .then((r) => setAssets(mode === "audio" ? r.assets : r.assets.filter((a) => a.kind !== "audio")))
      .catch((e) => {
        setAssets([]);
        toast(e.message, "error");
      });
  }, [mode]);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const choose = (a: PickedAsset) => {
    if (a.id) markAssetUsed(a.id);
    onPick(a);
    onClose();
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadAsset(file, preferLogos ? "logo" : "image");
      toast("Uploaded", "success");
      choose({ url: asset.url, name: asset.name, id: asset.id });
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  const logos = mode === "image" ? BRAND_LOGOS : [];
  const sorted = assets ? [...assets].sort((a, b) => (preferLogos ? Number(b.kind === "logo") - Number(a.kind === "logo") : 0)) : null;

  return (
    <Modal open={open} onClose={onClose} title={mode === "audio" ? "Choose music or audio" : preferLogos ? "Choose a logo" : "Choose an image"} width={760}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{mode === "audio" ? "MP3, WAV, M4A or OGG." : "PNG, JPEG or WebP. Large photos are resized to 2560 px."}</p>
        <input ref={input} type="file" hidden accept={mode === "audio" ? "audio/*" : "image/png,image/jpeg,image/webp"} onChange={(e) => onFile(e.target.files?.[0])} />
        <Button variant="primary" size="sm" icon={uploading ? <Spinner size={14} /> : <Upload size={14} />} disabled={uploading} onClick={() => input.current?.click()}>
          Upload
        </Button>
      </div>

      {logos.length > 0 && (
        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Official DAWB logos</h3>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {logos.map((l) => (
              <button key={l.id} onClick={() => choose({ url: l.url, name: l.name })} className="group overflow-hidden rounded-md border border-line text-left hover:border-brand">
                <img src={l.url} alt={l.name} className="aspect-square w-full object-contain" style={{ background: l.background }} />
                <span className="block truncate px-2 py-1.5 text-[11px] text-ink-2">{l.background === "#000000" ? "Dark background" : "Light background"}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">These files include their own background. Place them on a matching background, or upload a transparent logo version below.</p>
        </section>
      )}

      {mode === "audio" && (
        <section className="mt-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">DAWB music library (royalty-free)</h3>
          <ul className="divide-y divide-line rounded-md border border-line">
            {BUILTIN_MUSIC.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="truncate text-sm">{m.name}</span>
                <div className="flex items-center gap-2">
                  <audio src={m.url} controls preload="none" className="h-8 w-48" />
                  <Button size="sm" onClick={() => choose({ url: m.url, name: m.name })}>Use</Button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-5">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Team uploads</h3>
        {!sorted ? (
          <div className="py-8 text-center"><Spinner /></div>
        ) : sorted.length === 0 ? (
          <p className="rounded-md border border-dashed border-line-2 py-8 text-center text-sm text-muted">Nothing uploaded yet.</p>
        ) : mode === "audio" ? (
          <ul className="divide-y divide-line rounded-md border border-line">
            {sorted.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="truncate text-sm">{a.name}</span>
                <div className="flex items-center gap-2">
                  <audio src={a.url} controls preload="none" className="h-8 w-48" />
                  <Button size="sm" onClick={() => choose({ url: a.url, name: a.name, id: a.id })}>Use</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid max-h-[46vh] grid-cols-3 gap-3 overflow-auto sm:grid-cols-5">
            {sorted.map((a) => (
              <button key={a.id} onClick={() => choose({ url: a.url, name: a.name, id: a.id })} className={cx("overflow-hidden rounded-md border border-line text-left hover:border-brand")}>
                <img src={a.url} alt={a.name} loading="lazy" className="checker aspect-square w-full object-cover" />
                <span className="block truncate px-2 py-1.5 text-[11px] text-ink-2">{a.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>
    </Modal>
  );
}

"use client";

import Link from "next/link";
import { Copy, Film, MoreHorizontal, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ProjectMeta } from "@/lib/projects";
import { cx } from "@/components/ui";

export function timeAgo(iso: string) {
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function ProjectCard({ p, me, onFavorite, onDuplicate, onDelete }: { p: ProjectMeta; me?: string; onFavorite?: () => void; onDuplicate?: () => void; onDelete?: () => void }) {
  const [menu, setMenu] = useState(false);
  const fav = me ? p.favoritedBy.includes(me) : false;
  return (
    <div className="group relative">
      <Link href={`/${p.kind}/${p.id}`} className="block overflow-hidden rounded-md border border-line bg-white transition-shadow hover:shadow-float">
        <div className="relative w-full bg-canvas" style={{ aspectRatio: `${p.width}/${p.height}`, maxHeight: 340 }}>
          {p.hasThumbnail ? (
            <img src={`/api/projects/${p.id}/thumbnail?v=${p.thumbnailVersion}`} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted">No preview</div>
          )}
          {p.kind === "video" && <span className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/65 px-1.5 py-0.5 text-[11px] text-white"><Film size={11} /> Video</span>}
        </div>
        <div className="border-t border-line px-3 py-2.5">
          <p className="truncate text-[13px] font-semibold">{p.name}</p>
          <p className="mt-0.5 truncate text-[11.5px] text-muted">Edited {timeAgo(p.updatedAt)} · {p.updatedBy.name}</p>
        </div>
      </Link>
      {(onFavorite || onDuplicate || onDelete) && (
        <div className="absolute right-2 top-2 flex gap-1">
          {onFavorite && (
            <button onClick={onFavorite} aria-label={fav ? "Unfavourite" : "Favourite"} aria-pressed={fav} className={cx("flex h-8 w-8 items-center justify-center rounded-md border bg-white/95", fav ? "border-brand/30 text-brand" : "border-line text-ink-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100")}>
              <Star size={15} fill={fav ? "currentColor" : "none"} />
            </button>
          )}
          <div className="relative">
            <button onClick={() => setMenu((m) => !m)} aria-label="Project actions" className="flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white/95 text-ink-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100">
              <MoreHorizontal size={15} />
            </button>
            {menu && (
              <div className="absolute right-0 z-10 mt-1 w-40 overflow-hidden rounded-md border border-line bg-white py-1 shadow-float" onMouseLeave={() => setMenu(false)}>
                {onDuplicate && <button onClick={() => { setMenu(false); onDuplicate(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-canvas"><Copy size={14} /> Duplicate</button>}
                {onDelete && <button onClick={() => { setMenu(false); onDelete(); }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-red-50"><Trash2 size={14} /> Delete</button>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

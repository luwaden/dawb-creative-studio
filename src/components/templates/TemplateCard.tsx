"use client";

import Link from "next/link";
import { Film, Layers, Star } from "lucide-react";
import type { Template } from "@/lib/templates/types";
import { CATEGORIES } from "@/lib/templates/types";
import { useWorkspace } from "@/components/shell/WorkspaceProvider";
import { cx } from "@/components/ui";
import { TemplateThumb } from "./TemplateThumb";

export function templateHref(t: Template) {
  return t.kind === "design" ? `/design/new?template=${t.id}` : `/video/new?template=${t.id}`;
}

export function TemplateCard({ template, slides }: { template: Template; slides?: number }) {
  const { favorites, toggleFavorite } = useWorkspace();
  const fav = favorites.includes(template.id);
  const cat = CATEGORIES.find((c) => c.id === template.category)?.label;
  return (
    <div className="group relative">
      <Link href={templateHref(template)} className="block overflow-hidden rounded-md border border-line bg-white transition-shadow hover:shadow-float focus-visible:shadow-float">
        <TemplateThumb template={template} />
        <div className="border-t border-line px-3 py-2.5">
          <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">{template.name}</p>
          <p className="mt-1 flex items-center gap-1.5 text-[11.5px] text-muted">
            {template.kind === "video" ? <Film size={12} /> : slides && slides > 1 ? <Layers size={12} /> : null}
            <span>{template.post ? `Post ${template.post}` : "Campaign frame"}</span>
            <span aria-hidden>·</span>
            <span className="truncate">{template.kind === "design" && slides && slides > 1 ? `${slides} slides` : cat}</span>
          </p>
        </div>
      </Link>
      <button
        onClick={() => toggleFavorite(template.id)}
        aria-label={fav ? "Remove from favourites" : "Add to favourites"}
        aria-pressed={fav}
        className={cx(
          "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md border bg-white/95 transition-opacity",
          fav ? "border-brand/30 text-brand opacity-100" : "border-line text-ink-2 opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
        )}
      >
        <Star size={15} fill={fav ? "currentColor" : "none"} />
      </button>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Star } from "lucide-react";
import { ALL_TEMPLATES, CATEGORIES, PHASES, templateSearchText } from "@/lib/templates";
import type { CategoryId, Phase, Template } from "@/lib/templates/types";
import { useWorkspace } from "@/components/shell/WorkspaceProvider";
import { cx, Empty, Input } from "@/components/ui";
import { TemplateCard } from "./TemplateCard";

const slideCounts = new Map<string, number>();
function slidesOf(t: Template) {
  if (t.kind !== "design") return undefined;
  if (!slideCounts.has(t.id)) slideCounts.set(t.id, t.build().pages.length);
  return slideCounts.get(t.id);
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cx("h-8 shrink-0 rounded-md border px-3 text-[13px] transition-colors", active ? "border-brand bg-brand-50 font-medium text-brand-600" : "border-line bg-white text-ink-2 hover:border-line-2")}
    >
      {children}
    </button>
  );
}

export function TemplateLibrary() {
  const params = useSearchParams();
  const router = useRouter();
  const { favorites } = useWorkspace();
  const [q, setQ] = useState(params.get("q") ?? "");
  const kind = (params.get("kind") as "design" | "video" | null) ?? null;
  const phase = params.get("phase") ? (Number(params.get("phase")) as Phase) : null;
  const category = (params.get("category") as CategoryId | null) ?? null;
  const favOnly = params.get("fav") === "1";

  const set = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null) next.delete(key);
    else next.set(key, value);
    router.replace(`/templates?${next.toString()}`, { scroll: false });
  };

  const results = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    return ALL_TEMPLATES.filter((t) => {
      if (kind && t.kind !== kind) return false;
      if (phase && t.phase !== phase) return false;
      if (category && t.category !== category && !t.alsoIn?.includes(category)) return false;
      if (favOnly && !favorites.includes(t.id)) return false;
      const hay = templateSearchText(t);
      return words.every((w) => hay.includes(w));
    }).sort((a, b) => (a.post ?? 99) - (b.post ?? 99));
  }, [q, kind, phase, category, favOnly, favorites]);

  const usedCategories = CATEGORIES.filter((c) => ALL_TEMPLATES.some((t) => t.category === c.id && (!kind || t.kind === kind)));

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
          <p className="mt-1 text-sm text-muted">
            Logo motion, Beyond The Dashboard, occasions and the <span className="text-ink-2">From Curiosity to Civilization</span> campaign. {ALL_TEMPLATES.length} templates.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search posts, topics, formats…" className="pl-9" aria-label="Search templates" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={!kind} onClick={() => set("kind", null)}>All</Chip>
          <Chip active={kind === "design"} onClick={() => set("kind", "design")}>Designs</Chip>
          <Chip active={kind === "video"} onClick={() => set("kind", "video")}>Videos & motion</Chip>
          <span className="mx-1 w-px shrink-0 bg-line" />
          <Chip active={favOnly} onClick={() => set("fav", favOnly ? null : "1")}>
            <span className="inline-flex items-center gap-1.5"><Star size={13} /> Favourites</span>
          </Chip>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={!phase} onClick={() => set("phase", null)}>Every phase</Chip>
          {([1, 2, 3, 4] as Phase[]).map((p) => (
            <Chip key={p} active={phase === p} onClick={() => set("phase", phase === p ? null : String(p))}>
              {PHASES[p].label} · {PHASES[p].theme}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip active={!category} onClick={() => set("category", null)}>All formats</Chip>
          {usedCategories.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => set("category", category === c.id ? null : c.id)}>{c.label}</Chip>
          ))}
        </div>
      </div>

      <div className="mt-7">
        {results.length === 0 ? (
          <Empty title="No templates match">{favOnly ? "Star templates to collect them here." : "Try a different search or clear the filters."}</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {results.map((t) => (
              <TemplateCard key={t.id} template={t} slides={slidesOf(t)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

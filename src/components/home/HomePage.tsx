"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clapperboard, Film, LayoutTemplate, PenTool } from "lucide-react";
import { ALL_TEMPLATES, PHASES } from "@/lib/templates";
import type { Phase } from "@/lib/templates/types";
import type { AssetMeta } from "@/lib/projects";
import { api } from "@/lib/client/api";
import { useProjects } from "@/lib/client/useProjects";
import { useWorkspace } from "@/components/shell/WorkspaceProvider";
import { TemplateCard } from "@/components/templates/TemplateCard";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Spinner } from "@/components/ui";

const ACTIONS = [
  { href: "/templates?kind=design", label: "Create a design", note: "Carousels, statics, stories", icon: PenTool },
  { href: "/templates?kind=video&category=reel", label: "Create a video", note: "Reels from the campaign scripts", icon: Film },
  { href: "/templates?kind=video&category=motion", label: "Create motion graphics", note: "Counters, charts, statements", icon: Clapperboard },
  { href: "/templates", label: "Browse templates", note: `${ALL_TEMPLATES.length} ready-made templates`, icon: LayoutTemplate },
];

export function HomePage() {
  const { projects } = useProjects();
  const { favorites, info } = useWorkspace();
  const [assets, setAssets] = useState<AssetMeta[]>([]);
  useEffect(() => {
    api<{ assets: AssetMeta[] }>("/api/assets").then((r) => setAssets(r.assets.filter((a) => a.kind !== "audio").slice(0, 6))).catch(() => undefined);
  }, []);
  const favTemplates = ALL_TEMPLATES.filter((t) => favorites.includes(t.id));
  const featured = ["p05-ishango-bone", "p02-africa-first-research", "v17-sixty-seconds", "p11-smallpox", "p32-campaign-close"].map((id) => ALL_TEMPLATES.find((t) => t.id === id)!).filter(Boolean);

  return (
    <div className="space-y-12">
      <section>
        <p className="text-sm text-muted">{info?.user && info.workspace === "shared" ? `Welcome back, ${info.user.name.split(" ")[0]}` : "DAWB Creative Studio"}</p>
        <h1 className="mt-1 text-[28px] font-bold tracking-tight">What are we making today?</h1>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map(({ href, label, note, icon: Icon }) => (
            <Link key={href} href={href} className="group flex items-center gap-4 rounded-lg border border-line bg-white p-4 transition-colors hover:border-brand">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-600"><Icon size={20} /></span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold">{label}</span>
                <span className="block truncate text-xs text-muted">{note}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-base font-semibold">Recent projects</h2>
          <Link href="/projects" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">All projects <ArrowRight size={14} /></Link>
        </div>
        <div className="mt-4">
          {!projects ? <Spinner /> : projects.length === 0 ? (
            <p className="rounded-lg border border-dashed border-line-2 bg-white px-5 py-8 text-center text-sm text-muted">Nothing saved yet. Open a template below, edit it, and press Save.</p>
          ) : (
            <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {projects.slice(0, 5).map((p) => <ProjectCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold">Campaign phases</h2>
        <p className="mt-1 text-sm text-muted">From Curiosity to Civilization — The Research Movement</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([1, 2, 3, 4] as Phase[]).map((p) => (
            <Link key={p} href={`/templates?phase=${p}`} className="rounded-lg border border-line bg-white p-4 hover:border-brand">
              <p className="font-mono text-[11px] uppercase tracking-wider text-brand-600">{PHASES[p].label} · {PHASES[p].months}</p>
              <p className="mt-1.5 text-[15px] font-semibold leading-snug">{PHASES[p].theme}</p>
              <p className="mt-2 text-xs text-muted">{ALL_TEMPLATES.filter((t) => t.phase === p).length} templates</p>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-semibold">{favTemplates.length ? "Your favourite templates" : "Start from a template"}</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {(favTemplates.length ? favTemplates.slice(0, 10) : featured).map((t) => <TemplateCard key={t.id} template={t} />)}
        </div>
      </section>

      {assets.length > 0 && (
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-base font-semibold">Recently used brand assets</h2>
            <Link href="/brand" className="flex items-center gap-1 text-sm text-brand-600 hover:underline">Brand assets <ArrowRight size={14} /></Link>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
            {assets.map((a) => <img key={a.id} src={a.url} alt={a.name} title={a.name} className="checker aspect-square w-full rounded-md border border-line object-cover" />)}
          </div>
        </section>
      )}
    </div>
  );
}

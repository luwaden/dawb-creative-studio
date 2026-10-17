"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useProjects } from "@/lib/client/useProjects";
import { api } from "@/lib/client/api";
import type { ProjectMeta } from "@/lib/projects";
import { useWorkspace } from "@/components/shell/WorkspaceProvider";
import { Button, cx, Empty, Input, Spinner, toast } from "@/components/ui";
import { ProjectCard, timeAgo } from "./ProjectCard";

type Filter = "all" | "design" | "video" | "favorites" | "mine";

export function ProjectsPage() {
  const { projects, error, setProjects, reload } = useProjects();
  const { info } = useWorkspace();
  const me = info?.user?.email;
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const list = useMemo(() => (projects ?? []).filter((p) => {
    if (filter === "design" || filter === "video") { if (p.kind !== filter) return false; }
    if (filter === "favorites" && !(me && p.favoritedBy.includes(me))) return false;
    if (filter === "mine" && p.createdBy.email !== me) return false;
    return !q || p.name.toLowerCase().includes(q.toLowerCase());
  }), [projects, filter, q, me]);

  const exports = useMemo(() => (projects ?? []).flatMap((p) => p.exports.map((e) => ({ ...e, project: p }))).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12), [projects]);

  const replace = (p: ProjectMeta) => setProjects((cur) => cur?.map((x) => (x.id === p.id ? p : x)) ?? null);
  const favorite = async (p: ProjectMeta) => { try { replace((await api<{ project: ProjectMeta }>(`/api/projects/${p.id}/favorite`, { method: "POST" })).project); } catch (e) { toast((e as Error).message, "error"); } };
  const duplicate = async (p: ProjectMeta) => { try { await api(`/api/projects/${p.id}/duplicate`, { method: "POST" }); toast("Duplicated", "success"); reload(); } catch (e) { toast((e as Error).message, "error"); } };
  const remove = async (p: ProjectMeta) => {
    if (!confirm(`Delete “${p.name}”? This can't be undone.`)) return;
    try { await api(`/api/projects/${p.id}`, { method: "DELETE" }); setProjects((cur) => cur?.filter((x) => x.id !== p.id) ?? null); toast("Deleted"); } catch (e) { toast((e as Error).message, "error"); }
  };

  const tabs: Array<[Filter, string]> = [["all", "All"], ["design", "Designs"], ["video", "Videos"], ["favorites", "Favourites"], ["mine", "Created by me"]];

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My projects</h1>
          <p className="mt-1 text-sm text-muted">{info?.workspace === "shared" ? "Everything your team has saved in the shared workspace." : "Projects saved on this computer."}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects" className="pl-9" aria-label="Search projects" />
        </div>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setFilter(k)} className={cx("h-8 shrink-0 rounded-md border px-3 text-[13px]", filter === k ? "border-brand bg-brand-50 font-medium text-brand-600" : "border-line bg-white text-ink-2")}>{l}</button>
        ))}
      </div>
      <div className="mt-6">
        {!projects ? <div className="py-16 text-center"><Spinner /></div> : error ? (
          <Empty title="Couldn't load projects">{error}</Empty>
        ) : list.length === 0 ? (
          <Empty title={projects.length ? "No projects match" : "No projects yet"} action={<Link href="/templates"><Button variant="primary">Browse templates</Button></Link>}>
            {projects.length ? "Try a different filter." : "Open a template, make it yours and press Save."}
          </Empty>
        ) : (
          <div className="grid grid-cols-2 items-start gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {list.map((p) => <ProjectCard key={p.id} p={p} me={me} onFavorite={() => favorite(p)} onDuplicate={() => duplicate(p)} onDelete={() => remove(p)} />)}
          </div>
        )}
      </div>
      {exports.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold">Recent exports</h2>
          <div className="mt-3 overflow-x-auto rounded-md border border-line bg-white">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-line text-left text-xs text-muted">
                <tr><th className="px-4 py-2 font-medium">Project</th><th className="px-4 py-2 font-medium">File</th><th className="px-4 py-2 font-medium">Rendered</th><th className="px-4 py-2 font-medium">By</th><th className="px-4 py-2 font-medium">When</th></tr>
              </thead>
              <tbody>
                {exports.map((e) => (
                  <tr key={e.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-2"><Link href={`/${e.project.kind}/${e.project.id}`} className="hover:text-brand-600">{e.project.name}</Link></td>
                    <td className="px-4 py-2 text-ink-2">{e.format.toUpperCase()} · {e.width}×{e.height}{e.sizeBytes ? ` · ${(e.sizeBytes / 1024 / 1024).toFixed(1)} MB` : ""}</td>
                    <td className="px-4 py-2 text-ink-2">{e.mode === "browser" ? "In browser" : "Server"}</td>
                    <td className="px-4 py-2 text-ink-2">{e.by}</td>
                    <td className="px-4 py-2 text-muted">{timeAgo(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

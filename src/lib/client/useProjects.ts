"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProjectMeta } from "@/lib/projects";
import { api } from "./api";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(() => {
    api<{ projects: ProjectMeta[] }>("/api/projects")
      .then((r) => { setProjects(r.projects); setError(null); })
      .catch((e) => { setError(e.message); setProjects([]); });
  }, []);
  useEffect(reload, [reload]);
  return { projects, error, reload, setProjects };
}

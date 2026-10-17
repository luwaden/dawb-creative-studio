"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { WorkspaceInfo } from "@/lib/projects";
import { api } from "@/lib/client/api";

interface Ctx {
  info: WorkspaceInfo | null;
  favorites: string[];
  toggleFavorite: (templateId: string) => Promise<void>;
  refresh: () => void;
}

const WorkspaceCtx = createContext<Ctx>({ info: null, favorites: [], toggleFavorite: async () => undefined, refresh: () => undefined });

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [info, setInfo] = useState<WorkspaceInfo | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    api<WorkspaceInfo>("/api/workspace").then(setInfo).catch(() => setInfo(null));
    api<{ templateIds: string[] }>("/api/favorites").then((r) => setFavorites(r.templateIds)).catch(() => setFavorites([]));
  }, [tick]);

  const toggleFavorite = useCallback(async (templateId: string) => {
    setFavorites((f) => (f.includes(templateId) ? f.filter((x) => x !== templateId) : [templateId, ...f]));
    try {
      const r = await api<{ templateIds: string[] }>("/api/favorites", { method: "POST", json: { templateId } });
      setFavorites(r.templateIds);
    } catch {
      setTick((t) => t + 1);
    }
  }, []);

  return <WorkspaceCtx.Provider value={{ info, favorites, toggleFavorite, refresh: () => setTick((t) => t + 1) }}>{children}</WorkspaceCtx.Provider>;
}

export const useWorkspace = () => useContext(WorkspaceCtx);

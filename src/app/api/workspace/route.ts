import { getCurrentUser } from "@/lib/server/auth";
import { getConfig } from "@/lib/server/config";
import { json, route } from "@/lib/server/http";
import type { WorkspaceInfo } from "@/lib/projects";

export const dynamic = "force-dynamic";

export const GET = route(async () => {
  const cfg = getConfig();
  const user = cfg.authRequired && !cfg.googleConfigured ? null : await getCurrentUser();
  const info: WorkspaceInfo = {
    workspace: cfg.workspace,
    driver: cfg.driver,
    authRequired: cfg.authRequired,
    googleConfigured: cfg.googleConfigured,
    serverRender: cfg.serverRender,
    maxUploadBytes: cfg.maxUploadBytes,
    user,
  };
  return json(info);
});

import type { DesignDoc } from "./design/types";
import type { VideoDoc } from "./video/types";

export type ProjectKind = "design" | "video";

export interface ExportRecord {
  id: string;
  format: "png" | "jpeg" | "mp4" | "webm";
  mode: "browser" | "server";
  width: number;
  height: number;
  sizeBytes: number | null;
  createdAt: string;
  by: string;
}

export interface ProjectMeta {
  id: string;
  kind: ProjectKind;
  name: string;
  templateId: string | null;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  createdBy: { email: string; name: string };
  updatedBy: { email: string; name: string };
  favoritedBy: string[];
  hasThumbnail: boolean;
  thumbnailVersion: number;
  exports: ExportRecord[];
  /** Optimistic-concurrency counter; bumps on every save. */
  revision: number;
}

export type ProjectDoc = DesignDoc | VideoDoc;

export interface Project {
  meta: ProjectMeta;
  doc: ProjectDoc;
}

export type AssetKind = "image" | "logo" | "background" | "audio";

export interface AssetMeta {
  id: string;
  name: string;
  kind: AssetKind;
  contentType: string;
  ext: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  createdAt: string;
  createdBy: { email: string; name: string };
  lastUsedAt: string | null;
  /** Public path for use inside designs/videos (proxied through the app). */
  url: string;
}

export interface WorkspaceInfo {
  workspace: "local" | "shared";
  driver: "fs" | "blob";
  authRequired: boolean;
  googleConfigured: boolean;
  serverRender: boolean;
  maxUploadBytes: number;
  user: { email: string; name: string; image?: string | null; isAdmin: boolean } | null;
}

/** Built-in, read-only official brand files. */
export const BRAND_LOGOS = [
  { id: "brand-logo-dark", name: "DAWB logo — dark background", url: "/brand/dawb-logo-dark.svg", background: "#000000" },
  { id: "brand-logo-light", name: "DAWB logo — light background", url: "/brand/dawb-logo-light.svg", background: "#FFFFFF" },
] as const;

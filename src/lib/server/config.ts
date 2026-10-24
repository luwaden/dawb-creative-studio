import "server-only";
import path from "node:path";

/**
 * Runtime configuration, read from environment variables.
 *
 *  Workspace     Storage driver   Who can use it
 *  -----------   --------------   ------------------------------------------------
 *  local         fs  (./data)     Whoever opens the app on this computer
 *  shared        cloudinary/blob  Signed-in Google accounts on the allowlist only
 *
 * The workspace label is derived from the storage driver so local and shared data
 * are never silently mixed: a PC only joins the shared workspace when it is given
 * the Blob token *and* Google sign-in is configured.
 */

export type StorageDriverName = "fs" | "blob" | "cloudinary";

function list(v: string | undefined): string[] {
  return (v ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function getConfig() {
  const hasCloudinary = Boolean(process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET));
  const explicit = process.env.STORAGE_DRIVER;
  const driver: StorageDriverName =
    explicit === "cloudinary" || explicit === "blob" || explicit === "fs"
      ? explicit
      : hasCloudinary
        ? "cloudinary"
        : process.env.BLOB_READ_WRITE_TOKEN
          ? "blob"
          : "fs";
  // Any cloud store is the shared workspace (sign-in required); local disk is this computer only.
  const workspace = driver === "fs" ? "local" : "shared";
  const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.NEXTAUTH_SECRET);
  const allowedDomains = list(process.env.ALLOWED_EMAIL_DOMAINS);
  const allowedEmails = list(process.env.ALLOWED_EMAILS);
  const adminEmails = list(process.env.ADMIN_EMAILS);
  // Shared data is never served without sign-in. Local mode can opt in to sign-in too.
  const authRequired = workspace === "shared" || (googleConfigured && process.env.REQUIRE_AUTH === "true");
  const onVercel = Boolean(process.env.VERCEL);
  const serverRender = process.env.SERVER_RENDER ? process.env.SERVER_RENDER === "true" : !onVercel;
  return {
    driver,
    workspace,
    dataDir: path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "data")),
    googleConfigured,
    authRequired,
    allowedDomains,
    allowedEmails,
    adminEmails,
    serverRender,
    onVercel,
    /** Signing secret for short-lived asset URLs used by server renders. */
    signingSecret: process.env.NEXTAUTH_SECRET || process.env.ASSET_SIGNING_SECRET || "dawb-local-dev-secret",
    maxUploadBytes: onVercel ? 4 * 1024 * 1024 : 25 * 1024 * 1024,
  } as const;
}

export type AppConfig = ReturnType<typeof getConfig>;

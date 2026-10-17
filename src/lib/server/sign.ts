import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getConfig } from "./config";

/** Short-lived signature letting the headless render browser fetch assets without a session cookie. */
export function signAssetAccess(ttlSeconds = 60 * 30): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = createHmac("sha256", getConfig().signingSecret).update(`assets:${exp}`).digest("hex");
  return `exp=${exp}&sig=${sig}`;
}

export function verifyAssetAccess(url: URL): boolean {
  const exp = Number(url.searchParams.get("exp"));
  const sig = url.searchParams.get("sig") ?? "";
  if (!exp || exp < Date.now() / 1000 || !/^[a-f0-9]{64}$/.test(sig)) return false;
  const expected = createHmac("sha256", getConfig().signingSecret).update(`assets:${exp}`).digest("hex");
  return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}

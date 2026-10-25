"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, CircleMinus, RefreshCw, TriangleAlert, XCircle } from "lucide-react";
import { api } from "@/lib/client/api";
import { ALL_TEMPLATES } from "@/lib/templates";
import { Button, Spinner } from "@/components/ui";

interface Check { id: string; label: string; status: "ok" | "warn" | "fail" | "off"; detail: string }

const ICON = {
  ok: <CheckCircle2 size={18} className="text-success" />,
  warn: <TriangleAlert size={18} className="text-amber-600" />,
  fail: <XCircle size={18} className="text-danger" />,
  off: <CircleMinus size={18} className="text-muted" />,
};

export function StatusPage() {
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [error, setError] = useState("");
  const [browser, setBrowser] = useState<Check[]>([]);

  const run = useCallback(() => {
    setChecks(null);
    setError("");
    api<{ checks: Check[] }>("/api/health").then((r) => setChecks(r.checks)).catch((e) => setError(e.message));
    const webcodecs = typeof window !== "undefined" && "VideoEncoder" in window;
    let idb = true;
    try { idb = typeof indexedDB !== "undefined"; } catch { idb = false; }
    setBrowser([
      { id: "templates", label: "Template library", status: ALL_TEMPLATES.length > 0 ? "ok" : "fail", detail: `${ALL_TEMPLATES.length} templates loaded` },
      { id: "webcodecs", label: "Browser video export", status: webcodecs ? "ok" : "warn", detail: webcodecs ? "This browser can export MP4/WebM" : "Use Chrome or Edge to export videos in the browser" },
      { id: "local", label: "“This device only” photos", status: idb ? "ok" : "warn", detail: idb ? "Browser storage available" : "Browser storage is blocked (private mode?)" },
    ]);
  }, []);
  useEffect(run, [run]);

  const rows = [...(checks ?? []), ...browser];
  return (
    <div className="max-w-3xl space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">System check</h1>
          <p className="mt-1 text-sm text-muted">Live checks of sign-in, storage, Google Sheets and video export on this deployment.</p>
        </div>
        <Button size="sm" icon={<RefreshCw size={14} />} onClick={run}>Run again</Button>
      </header>
      {error && <p className="rounded-md bg-red-50 p-3 text-sm text-danger">{error}</p>}
      {!checks && !error ? (
        <div className="py-16 text-center"><Spinner /></div>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-white">
          {rows.map((c) => (
            <li key={c.id} className="flex items-start gap-3 px-4 py-3">
              <span className="mt-0.5">{ICON[c.status]}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{c.label}</p>
                <p className="text-sm text-muted">{c.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

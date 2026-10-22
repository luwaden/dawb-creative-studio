"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FolderOpen, Home, LayoutTemplate, LogOut, Menu, Palette, Sheet, X } from "lucide-react";
import { cx, Toaster } from "@/components/ui";
import { useWorkspace } from "./WorkspaceProvider";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/projects", label: "My projects", icon: FolderOpen },
  { href: "/brand", label: "Brand assets", icon: Palette },
  { href: "/data", label: "Sheets data", icon: Sheet },
];

function WorkspaceBadge() {
  const { info } = useWorkspace();
  if (!info) return null;
  return (
    <div className="rounded-md border border-line bg-canvas px-3 py-2.5 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-ink">
        <span className={cx("h-1.5 w-1.5 rounded-full", info.workspace === "shared" ? "bg-brand" : "bg-amber-500")} />
        {info.workspace === "shared" ? "DAWB shared workspace" : "Local workspace"}
      </div>
      <p className="mt-1 leading-snug text-muted">{info.workspace === "shared" ? "Projects are shared with signed-in teammates." : "Projects are saved on this computer only."}</p>
      {info.user && info.workspace === "shared" && (
        <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
          <span className="truncate text-ink-2">{info.user.email}</span>
          <a href="/api/auth/signout" className="text-muted hover:text-ink" aria-label="Sign out" title="Sign out">
            <LogOut size={13} />
          </a>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cx("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors", isActive(href) ? "bg-brand-50 font-semibold text-brand-600" : "text-ink-2 hover:bg-canvas hover:text-ink")}
        >
          <Icon size={17} strokeWidth={isActive(href) ? 2.2 : 1.8} />
          {label}
        </Link>
      ))}
    </nav>
  );

  const brand = (
    <Link href="/" className="flex items-center gap-2.5 px-1">
      {/* Official light-background logo file on the white sidebar */}
      <img src="/brand/dawb-logo-light.svg" alt="DAWB" width={36} height={36} className="rounded" />
      <div className="leading-tight">
        <div className="text-[14px] font-bold tracking-tight">Creative Studio</div>
        <div className="text-[11px] text-muted">DAWB Learn</div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-white px-3 py-4 lg:flex">
        {brand}
        <div className="mt-7 flex-1">{nav}</div>
        <WorkspaceBadge />
      </aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        {brand}
        <button className="rounded-md p-2 text-ink-2 hover:bg-canvas" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={20} />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/30 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-y-0 right-0 flex w-72 flex-col bg-white p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              {brand}
              <button className="rounded-md p-2 hover:bg-canvas" onClick={() => setOpen(false)} aria-label="Close menu">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1">{nav}</div>
            <WorkspaceBadge />
          </div>
        </div>
      )}

      <main className="lg:pl-60">
        <div className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 lg:px-10 lg:py-9">{children}</div>
      </main>
      <Toaster />
    </div>
  );
}

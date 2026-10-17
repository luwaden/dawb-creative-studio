"use client";

import { forwardRef, useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function cx(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger";

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md"; icon?: ReactNode }>(
  function Button({ variant = "secondary", size = "md", icon, className, children, ...rest }, ref) {
    return (
      <button
        ref={ref}
        className={cx(
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap",
          size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
          variant === "primary" && "bg-brand text-white hover:bg-brand-600",
          variant === "secondary" && "bg-white text-ink border border-line hover:border-line-2 hover:bg-canvas",
          variant === "ghost" && "text-ink-2 hover:bg-canvas hover:text-ink",
          variant === "danger" && "bg-white text-danger border border-line hover:bg-red-50",
          className,
        )}
        {...rest}
      >
        {icon}
        {children}
      </button>
    );
  },
);

export function IconButton({ label, active, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; active?: boolean }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-canvas hover:text-ink disabled:opacity-40 disabled:pointer-events-none",
        active && "bg-brand-50 text-brand-600",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return (
    <input
      ref={ref}
      className={cx("h-9 w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15", className)}
      {...rest}
    />
  );
});

export function TextArea({ className, ...rest }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx("w-full rounded-md border border-line bg-white px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/15", className)}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx("h-9 w-full rounded-md border border-line bg-white px-2 text-sm text-ink focus:border-brand focus:outline-none", className)} {...rest}>
      {children}
    </select>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-muted">{hint}</span>}
    </label>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "brand" | "success" | "warn" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium",
        tone === "neutral" && "bg-canvas text-ink-2 border border-line",
        tone === "brand" && "bg-brand-50 text-brand-600",
        tone === "success" && "bg-green-50 text-success",
        tone === "warn" && "bg-amber-50 text-amber-700",
      )}
    >
      {children}
    </span>
  );
}

export function Modal({ open, onClose, title, children, width = 520 }: { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: number }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/30 p-0 sm:items-center sm:p-6" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full overflow-auto rounded-t-lg bg-white shadow-float sm:rounded-lg" style={{ maxWidth: width }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[15px] font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

type ToastItem = { id: number; message: string; tone: "info" | "success" | "error" };
let pushToast: ((t: Omit<ToastItem, "id">) => void) | null = null;

export function toast(message: string, tone: ToastItem["tone"] = "info") {
  pushToast?.({ message, tone });
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);
  useEffect(() => {
    pushToast = (t) => {
      const id = Date.now() + Math.random();
      setItems((x) => [...x, { ...t, id }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), t.tone === "error" ? 7000 : 3500);
    };
    return () => {
      pushToast = null;
    };
  }, []);
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-[min(92vw,420px)] -translate-x-1/2 flex-col gap-2" aria-live="polite">
      {items.map((t) => (
        <div
          key={t.id}
          className={cx(
            "pointer-events-auto rounded-md border px-4 py-3 text-sm shadow-float",
            t.tone === "error" ? "border-red-200 bg-white text-danger" : t.tone === "success" ? "border-green-200 bg-white text-ink" : "border-line bg-white text-ink",
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-2 bg-white px-6 py-12 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {children && <p className="mx-auto mt-1.5 max-w-md text-sm text-muted">{children}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return <span className="inline-block animate-spin rounded-full border-2 border-line border-t-brand" style={{ width: size, height: size }} aria-label="Loading" />;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AlertCircle, Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Toast — Forms & Utility reference §05: bottom-right, navy card, royal-blue glyph tile, dismissible.
 *
 * Hand-rolled (no package): a tiny context + a fixed-position region. Mount `<ToastProvider>` once
 * (app providers) and call `useToast().toast({...})` anywhere. Auto-dismisses; each toast is
 * announced politely. Entry animation respects prefers-reduced-motion via `.anim-toast`.
 */
type ToastTone = "default" | "success" | "error";

type ToastInput = { title: string; description?: string; tone?: ToastTone; duration?: number };
type ToastItem = ToastInput & { id: number };

type ToastContextValue = { toast: (input: ToastInput) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

const TONE_ICON = {
  default: Check,
  success: Check,
  error: AlertCircle,
} as const;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback((input: ToastInput) => {
    nextId.current += 1;
    const id = nextId.current;
    setItems((current) => [...current, { ...input, id }]);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-6 bottom-6 z-[120] flex flex-col gap-3"
      >
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onDismiss={() => dismiss(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const Icon = TONE_ICON[item.tone ?? "default"];
  const duration = item.duration ?? 5000;

  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div className="anim-toast pointer-events-auto flex max-w-[340px] items-center gap-3 rounded-lg bg-primary px-4 py-3.5 text-canvas shadow-glass">
      <span
        aria-hidden
        className={cn(
          "flex size-[26px] flex-none items-center justify-center rounded-md",
          item.tone === "error" ? "bg-danger" : "bg-accent",
        )}
      >
        <Icon className="size-[15px] text-canvas" strokeWidth={3} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description ? (
          <div className="text-[12.5px] text-canvas/65">{item.description}</div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex-none text-canvas/60 transition-colors hover:text-canvas"
      >
        <X className="size-4" strokeWidth={2.4} aria-hidden />
      </button>
    </div>
  );
}

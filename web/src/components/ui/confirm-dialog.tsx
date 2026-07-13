"use client";

import type { ReactNode } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Confirmation dialog — Forms & Utility reference §05.
 *
 * A modal overlay (focus-trapped by the underlying Base UI Dialog) with a glyph tile, a question,
 * a consequence line, then Cancel + the confirm action pinned right. `tone="danger"` renders the
 * destructive treatment from the reference; `tone="default"` uses the navy primary action.
 *
 * Controlled: the caller owns `open`, so the confirm handler can close it after its own work.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  icon,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  icon?: ReactNode;
}) {
  const danger = tone === "danger";
  const Glyph = danger ? Trash2 : AlertTriangle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-[440px]" showCloseButton={false}>
        <div className="p-7 pb-0">
          <span
            aria-hidden
            className={cn(
              "flex size-12 items-center justify-center rounded-lg",
              danger ? "bg-danger/10 text-danger" : "bg-tag-bg text-accent",
            )}
          >
            {icon ?? <Glyph className="size-6" strokeWidth={2.2} />}
          </span>

          <DialogTitle className="mt-[18px] text-[1.3rem] font-bold text-primary">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="mt-2 text-[14.5px] leading-[1.55] text-fg-muted">
              {description}
            </DialogDescription>
          ) : null}
        </div>

        <div className="mt-2 flex justify-end gap-3 p-7">
          <DialogClose
            render={
              <Button variant="outline" disabled={loading}>
                {cancelLabel}
              </Button>
            }
          />
          <Button
            variant={danger ? "destructive" : "default"}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

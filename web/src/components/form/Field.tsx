"use client";

import { useId, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { InfoHint } from "./InfoHint";

/**
 * Field anatomy — Forms & Utility reference §03: label (+ optional required asterisk), the control,
 * then EITHER helper text OR an inline error with its alert glyph.
 *
 * `children` is a render prop receiving the wiring the control needs, so the error state is never
 * hand-rolled: it hands back `id`, `aria-invalid` and `aria-describedby`. Every control in this
 * library reads `aria-invalid` for its danger border + ring.
 */
export function Field({
  label,
  required = false,
  helper,
  error,
  tooltip,
  className,
  labelSuffix,
  children,
}: {
  label: string;
  required?: boolean;
  /** Shown under the control when there is no error. Explains what's expected BEFORE they error. */
  helper?: ReactNode;
  /** When set, the control turns danger and this replaces the helper. */
  error?: string | null;
  /** Optional "what does this mean?" explanation, shown as an accessible tooltip by the label. */
  tooltip?: string;
  className?: string;
  /** Optional element pinned to the right of the label row (e.g. a "Forgot?" link). */
  labelSuffix?: ReactNode;
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby": string | undefined;
  }) => ReactNode;
}) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = error ? errorId : helper ? helperId : undefined;

  return (
    <div className={cn("flex flex-col gap-[7px]", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={id}>
          {label}
          {required ? (
            <span className="text-danger" aria-hidden>
              *
            </span>
          ) : null}
          {tooltip ? <InfoHint label={`What is "${label}"?`}>{tooltip}</InfoHint> : null}
        </Label>
        {labelSuffix}
      </div>

      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}

      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-[12.5px] text-danger">
          <AlertCircle className="size-[13px] shrink-0" strokeWidth={2.4} aria-hidden />
          {error}
        </p>
      ) : helper ? (
        <p id={helperId} className="text-[12.5px] leading-[1.45] text-fg-muted">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Numbered section header — Forms & Utility reference §02/§03. Splits a long form into digestible
 * groups: a mono step chip + a title, optionally with a description underneath.
 */
export function FormSection({
  step,
  title,
  description,
  className,
  children,
}: {
  /** Mono chip content — "01", "02", or a glyph such as "§". */
  step: string;
  title: string;
  description?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <section className={cn("flex flex-col", className)}>
      <div className="mb-[22px] flex items-center gap-[11px]">
        <span className="mono flex size-[26px] flex-none items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
          {step}
        </span>
        <h2 className="text-[15px] font-bold text-primary">{title}</h2>
      </div>

      {description ? (
        <p className="-mt-3 mb-5 text-[13px] leading-[1.5] text-fg-muted">{description}</p>
      ) : null}

      {children}
    </section>
  );
}

import type { ReactNode } from "react";
import { AlertCircle, AlertTriangle, Check, Info } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Inline alert — Forms & Utility reference §05.
 *
 * Four semantics, all drawn from the LOCKED identity (navy / royal blue / lavender / danger):
 *   info     lavender wash, royal glyph        — neutral heads-up
 *   success  royal-blue wash, royal tick       — royal blue is the positive colour since amber was
 *                                                retired; the reference's green is NOT in the palette
 *   warning  navy wash, navy triangle          — "action needed" WITHOUT amber (amber is retired)
 *   error    danger wash, danger glyph
 */
const VARIANTS = {
  info: {
    icon: Info,
    box: "bg-tag-bg border-accent/25",
    glyph: "text-accent",
    title: "text-primary",
    body: "text-primary/75",
  },
  success: {
    icon: Check,
    box: "bg-accent/8 border-accent/35",
    glyph: "text-accent",
    title: "text-primary",
    body: "text-primary/75",
  },
  warning: {
    icon: AlertTriangle,
    box: "bg-primary/6 border-primary/25",
    glyph: "text-primary",
    title: "text-primary",
    body: "text-fg-muted",
  },
  error: {
    icon: AlertCircle,
    box: "bg-danger/7 border-danger/30",
    glyph: "text-danger",
    title: "text-danger",
    body: "text-danger/80",
  },
} as const;

export type AlertVariant = keyof typeof VARIANTS;

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: AlertVariant;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const style = VARIANTS[variant];
  const Icon = style.icon;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn("flex gap-[11px] rounded-md border px-[15px] py-3.5", style.box, className)}
    >
      <Icon
        className={cn("mt-px size-[18px] shrink-0", style.glyph)}
        strokeWidth={2.2}
        aria-hidden
      />
      <div className="min-w-0">
        {title ? (
          <div className={cn("text-sm font-semibold", style.title)}>{title}</div>
        ) : null}
        {children ? (
          <div className={cn("text-[13px] leading-[1.45]", style.body)}>{children}</div>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Form-level error summary — Forms & Utility reference §05. Sits at the top of a submitted form and
 * lists every field error, each linking to its control.
 */
export function ErrorSummary({
  errors,
  className,
}: {
  /** Field errors: `message` plus the id of the control it belongs to (for the anchor). */
  errors: Array<{ message: string; fieldId?: string }>;
  className?: string;
}) {
  if (errors.length === 0) return null;

  return (
    <div
      role="alert"
      className={cn("rounded-lg border border-danger bg-danger/5 p-[18px]", className)}
    >
      <div className="flex items-center gap-2.5 text-[14.5px] font-bold text-danger">
        <AlertCircle className="size-[17px] shrink-0" strokeWidth={2.4} aria-hidden />
        Please fix {errors.length} {errors.length === 1 ? "issue" : "issues"} before submitting
      </div>
      <ul className="mt-3 flex list-none flex-col gap-[7px] pl-0.5">
        {errors.map((error) => (
          <li key={error.message} className="text-[13px]">
            {error.fieldId ? (
              <a href={`#${error.fieldId}`} className="text-danger underline">
                {error.message}
              </a>
            ) : (
              <span className="text-danger">{error.message}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

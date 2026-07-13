"use client";

import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";
import { controlShell, controlShellError, controlShellInput } from "./fieldStyles";

/**
 * An input with a fixed affix inside the control — Forms & Utility reference §02/§03.
 *
 * The BORDER lives on the shell (so the affix sits inside the outline and the focus ring wraps
 * both), and the inner <input> is chromeless. Two uses in the reference:
 *   • money  →  a mono "$" prefix with the value itself in mono   (`<MoneyInput/>`)
 *   • url    →  a mono "https://" prefix                          (`<AffixInput prefix="https://"/>`)
 *
 * `invalid` turns the shell danger (the shell can't read `aria-invalid` off its child), and is
 * also forwarded to the input so assistive tech sees it.
 */
export function AffixInput({
  prefix,
  suffix,
  invalid = false,
  mono = false,
  className,
  ...props
}: ComponentProps<"input"> & {
  prefix?: ReactNode;
  suffix?: ReactNode;
  invalid?: boolean;
  /** Render the value itself in IBM Plex Mono (money, metrics, codes). */
  mono?: boolean;
}) {
  return (
    <div className={cn(controlShell, invalid && controlShellError, className)}>
      {prefix ? (
        <span
          aria-hidden
          className={cn(
            "mono flex-none py-2.5 pr-1.5 pl-3.5 text-[15px]",
            invalid ? "text-danger" : "text-fg-muted",
          )}
        >
          {prefix}
        </span>
      ) : null}

      <input
        aria-invalid={invalid || undefined}
        className={cn(controlShellInput, mono && "mono text-primary", !prefix && "pl-3.5")}
        {...props}
      />

      {suffix ? (
        <span aria-hidden className="mono flex-none py-2.5 pr-3.5 pl-1.5 text-[13px] text-fg-muted">
          {suffix}
        </span>
      ) : null}
    </div>
  );
}

/** Money input — a mono "$" prefix and a mono navy value (reference §03 "Money · mono"). */
export function MoneyInput({
  invalid = false,
  currency = "$",
  ...props
}: ComponentProps<"input"> & { invalid?: boolean; currency?: string }) {
  return (
    <AffixInput
      prefix={currency}
      mono
      invalid={invalid}
      inputMode="decimal"
      autoComplete="off"
      {...props}
    />
  );
}

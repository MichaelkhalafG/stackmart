"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * A single labelled auth input (label above the field, 06_UI_System.md §Forms). The
 * red 422 state is driven by `error` — the first message for this field pulled from
 * `ApiError.errors` (12_API_Specification.md 422 shape) — and wired to the shadcn
 * Input's built-in `aria-invalid` destructive ring. shadcn Input/Label used as-is.
 */
export function AuthField({
  id,
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  required,
  error,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
  /** Optional muted helper shown below the field when there is no error. */
  hint?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-fg-muted">{hint}</p>
      ) : null}
    </div>
  );
}

/** Non-field form error (e.g. a network failure or an unexpected non-2xx). */
export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </div>
  );
}

"use client";

import type { ReactNode } from "react";

import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";

/**
 * A single labelled auth input. Presentation is delegated to the shared `Field` primitive
 * (Forms & Utility reference §03) so the label / focus ring / inline-error-with-glyph treatment is
 * identical everywhere; `Field` wires id + aria-invalid + aria-describedby for us.
 *
 * The red 422 state is still driven by `error` — the first message for this field pulled from
 * `ApiError.errors` (12_API_Specification.md 422 shape).
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
  labelSuffix,
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
  /** Optional element pinned to the right of the label row (e.g. the "Forgot?" link). */
  labelSuffix?: ReactNode;
}) {
  return (
    <Field label={label} error={error} helper={hint} labelSuffix={labelSuffix}>
      {(fieldProps) => (
        <Input
          {...fieldProps}
          name={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required={required}
        />
      )}
    </Field>
  );
}

/** Non-field form error (e.g. a network failure or an unexpected non-2xx). */
export function FormError({ message }: { message: string }) {
  return <Alert variant="error">{message}</Alert>;
}

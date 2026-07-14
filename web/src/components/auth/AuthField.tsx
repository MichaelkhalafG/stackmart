"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Validator } from "@/lib/validation";

/**
 * A single labelled auth input. Presentation is delegated to the shared `Field` primitive
 * (Forms & Utility reference §03) so the label / focus ring / inline-error-with-glyph treatment is
 * identical everywhere; `Field` wires id + aria-invalid + aria-describedby for us.
 *
 * The red 422 state is still driven by `error` — the first message for this field pulled from
 * `ApiError.errors` (12_API_Specification.md 422 shape).
 *
 * PASSWORD REVEAL: any field with `type="password"` automatically gets a show/hide eye button inside
 * the control. Because every auth form (login, register, reset — on the pages AND inside the
 * purchase `AuthModal`) renders through this one component, the toggle appears on every password
 * field in the app, including "Confirm password", with no per-form wiring.
 *
 * The button is a real `<button type="button">` (keyboard-focusable, never submits the form) and
 * swaps its `aria-label` between "Show password" and "Hide password". Revealing only flips the
 * input's `type`; nothing about the value or the submitted payload changes.
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
  tooltip,
  validate,
  labelSuffix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  /** A server error (422) or a submit-time client error — always wins over blur-time feedback. */
  error?: string;
  /** Optional muted helper shown below the field when there is no error. */
  hint?: string;
  /** Optional "what does this mean?" tooltip beside the label. */
  tooltip?: string;
  /**
   * Client-side check, shown ON BLUR only — never on every keystroke, so the user isn't nagged
   * while typing. The same validator is re-run by the form at submit time, so a field can't slip
   * through untouched.
   */
  validate?: Validator;
  /** Optional element pinned to the right of the label row (e.g. the "Forgot?" link). */
  labelSuffix?: ReactNode;
}) {
  const isPassword = type === "password";
  const [revealed, setRevealed] = useState(false);
  const [touched, setTouched] = useState(false);

  // A revealed password field renders as a text input; everything else is unchanged.
  const inputType = isPassword && revealed ? "text" : type;

  // Server/submit errors take precedence; blur-time validation fills the gap before submit.
  const blurError = touched && validate ? validate(value) : undefined;
  const shownError = error ?? blurError;

  return (
    <Field
      label={label}
      error={shownError}
      helper={hint}
      tooltip={tooltip}
      labelSuffix={labelSuffix}
    >
      {(fieldProps) => (
        <div className="relative">
          <Input
            {...fieldProps}
            name={id}
            type={inputType}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={() => setTouched(true)}
            autoComplete={autoComplete}
            required={required}
            // Room for the eye button so long values never run underneath it.
            className={cn(isPassword && "pr-11")}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setRevealed((shown) => !shown)}
              aria-label={revealed ? "Hide password" : "Show password"}
              aria-pressed={revealed}
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-canvas-subtle hover:text-primary focus-visible:ring-[3px] focus-visible:ring-accent/25 focus-visible:outline-none"
            >
              {revealed ? (
                <EyeOff className="size-[18px]" strokeWidth={2} aria-hidden />
              ) : (
                <Eye className="size-[18px]" strokeWidth={2} aria-hidden />
              )}
            </button>
          ) : null}
        </div>
      )}
    </Field>
  );
}

/** Non-field form error (e.g. a network failure or an unexpected non-2xx). */
export function FormError({ message }: { message: string }) {
  return <Alert variant="error">{message}</Alert>;
}

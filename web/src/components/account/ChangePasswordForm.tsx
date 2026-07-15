"use client";

import { useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ChevronDown, Eye, EyeOff, Lock } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { firstError, matches, minLength, required } from "@/lib/validation";

type PasswordFieldName = "current_password" | "password" | "password_confirmation";

const EMPTY: Record<PasswordFieldName, string> = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

/**
 * Change password — `PATCH /auth/password` (Sanctum Bearer, current user only).
 *
 * Three fields, and three places an error can come from, all rendered in the SAME slot under the
 * field they belong to:
 *   - blur/submit validators (shape only: present, ≥8 chars, confirmation matches);
 *   - the API's 422 for a wrong current password → `errors.current_password[0]`;
 *   - the API's 422 for a weak/unconfirmed new password → `errors.password[0]`.
 *
 * On success the API revokes every OTHER token but keeps this one, so the user stays signed in here —
 * the success copy says exactly that, because "other devices signed out" is otherwise alarming. The
 * three inputs are cleared so a shoulder-surfer can't read the new password off the screen.
 */
export function ChangePasswordForm() {
  const [values, setValues] = useState(EMPTY);
  const [clientErrors, setClientErrors] = useState<Partial<Record<PasswordFieldName, string>>>({});
  // Mobile-only disclosure — collapsed by default (<md), always-open on desktop via `md:flex`.
  const [open, setOpen] = useState(false);
  const bodyId = useId();
  const { toast } = useToast();

  const validators: Record<PasswordFieldName, (value: string) => string | undefined> = {
    current_password: (value) =>
      firstError(value, required("Enter your current password to confirm it's you.")),
    password: (value) =>
      firstError(
        value,
        required("Enter a new password."),
        minLength(8, "Use at least 8 characters — longer is stronger."),
      ),
    password_confirmation: (value) =>
      firstError(
        value,
        required("Re-enter your new password to confirm it."),
        matches(values.password, "These passwords don't match — retype your new password."),
      ),
  };

  const mutation = useMutation({
    mutationFn: (payload: typeof EMPTY) =>
      api<{ message: string }>("/auth/password", {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      // Never leave a password sitting in a rendered input.
      setValues(EMPTY);
      setClientErrors({});
      toast({ title: "Password updated", tone: "success" });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const fieldErrors = apiError?.errors;
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;

  /** Client error first (it's about what's on screen right now), then the server's 422. */
  const errorFor = (field: PasswordFieldName) =>
    clientErrors[field] ?? fieldErrors?.[field]?.[0];

  function handleChange(field: PasswordFieldName, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (clientErrors[field]) {
      setClientErrors((current) => ({ ...current, [field]: undefined }));
    }
    // Editing invalidates the last attempt's banner (and its stale server errors).
    if (mutation.isSuccess || mutation.isError) mutation.reset();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const errors: Partial<Record<PasswordFieldName, string>> = {};
    (Object.keys(EMPTY) as PasswordFieldName[]).forEach((field) => {
      const message = validators[field](values[field]);
      if (message) errors[field] = message;
    });

    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    mutation.mutate(values);
  }

  return (
    <section className="rounded-xl border border-l-2 border-border border-l-accent bg-canvas p-6 shadow-sm sm:p-7">
      <h2 className="m-0">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-h-[44px] w-full items-center gap-3 text-left md:pointer-events-none md:min-h-0"
        >
          <span
            aria-hidden
            className="flex size-9 flex-none items-center justify-center rounded-lg bg-tag-bg text-accent"
          >
            <Lock className="size-[17px]" strokeWidth={2} />
          </span>
          <span className="flex-1 text-[15px] font-bold text-primary">Password</span>
          <ChevronDown
            aria-hidden
            className={cn(
              "size-5 flex-none text-fg-muted transition-transform duration-200 motion-reduce:transition-none md:hidden",
              open && "rotate-180",
            )}
          />
        </button>
      </h2>
      <p className="mt-1.5 pl-12 text-[13px] leading-[1.5] text-fg-muted">
        Changing your password signs you out on every other device. You stay signed in here.
      </p>

      <form
        id={bodyId}
        noValidate
        onSubmit={handleSubmit}
        className={cn(
          "mt-5 flex-col gap-4 border-t border-border pt-5 md:flex",
          open ? "flex" : "hidden",
        )}
      >
        {generalError ? <Alert variant="error">{generalError}</Alert> : null}

        {mutation.isSuccess ? (
          <Alert variant="success" title="Password updated">
            Other devices have been signed out. This device is still signed in.
          </Alert>
        ) : null}

        <PasswordField
          label="Current password"
          autoComplete="current-password"
          value={values.current_password}
          error={errorFor("current_password")}
          onChange={(value) => handleChange("current_password", value)}
          onBlur={() =>
            setClientErrors((current) => ({
              ...current,
              current_password: validators.current_password(values.current_password),
            }))
          }
        />

        <PasswordField
          label="New password"
          autoComplete="new-password"
          helper="At least 8 characters. Mix letters, numbers and symbols."
          value={values.password}
          error={errorFor("password")}
          onChange={(value) => handleChange("password", value)}
          onBlur={() =>
            setClientErrors((current) => ({
              ...current,
              password: validators.password(values.password),
            }))
          }
        />

        <PasswordField
          label="Confirm new password"
          autoComplete="new-password"
          value={values.password_confirmation}
          error={errorFor("password_confirmation")}
          onChange={(value) => handleChange("password_confirmation", value)}
          onBlur={() =>
            setClientErrors((current) => ({
              ...current,
              password_confirmation: validators.password_confirmation(values.password_confirmation),
            }))
          }
        />

        <div className="pt-1">
          {/* Full-width on phones, the original auto-width button from `sm` up. */}
          <Button type="submit" loading={mutation.isPending} className="w-full sm:w-auto">
            Update password
          </Button>
        </div>
      </form>
    </section>
  );
}

/**
 * A password input with a reveal toggle. Local to this file on purpose: the shared `AuthField` has
 * the same affordance but lives in the auth folder, which this feature does not own.
 *
 * `Field` owns the label/error/helper anatomy and hands back the id + aria wiring, so the toggle is
 * the only thing added here. The button is `tabIndex={-1}` so tabbing runs label → input → next
 * field (the standard for reveal toggles) and it never becomes a keyboard trap between them.
 */
function PasswordField({
  label,
  value,
  error,
  helper,
  autoComplete,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  error?: string;
  helper?: string;
  autoComplete: "current-password" | "new-password";
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const Icon = revealed ? EyeOff : Eye;

  return (
    <Field label={label} required error={error} helper={helper}>
      {(fieldProps) => (
        <div className="relative">
          <Input
            {...fieldProps}
            type={revealed ? "text" : "password"}
            autoComplete={autoComplete}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            className="pr-11"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={revealed ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            onClick={() => setRevealed((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-fg-muted transition-colors hover:text-primary focus-visible:ring-[3px] focus-visible:ring-accent/25 focus-visible:outline-none"
          >
            <Icon className="size-[17px]" strokeWidth={2} aria-hidden />
          </button>
        </div>
      )}
    </Field>
  );
}

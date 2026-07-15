"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { email as emailValidator, firstError, matches, minLength, required } from "@/lib/validation";

import { AuthField, FormError } from "./AuthField";

/**
 * Reset-password form (S3.03). Consumes the `token`+`email` carried in the reset link the
 * S3.02 mail builds (`{FRONTEND_URL}/reset-password?token=…&email=…`) and POSTs them with the
 * new password to `POST /api/auth/reset-password`. A confirm field is validated client-side
 * (not sent — the contract body is token/email/password). An invalid/expired token comes back
 * as a 422 keyed on `email` (see S3.02) and renders under that field.
 */
export function ResetPasswordForm({
  initialToken,
  initialEmail,
}: {
  initialToken: string;
  initialEmail: string;
}) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: initialToken, email, password }),
      }),
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const fieldErrors = apiError?.errors;
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;

  if (mutation.isSuccess) {
    return (
      <div className="anim-fade flex flex-col gap-5">
        <Alert variant="success" title="Password updated">
          {mutation.data.message || "Password has been reset."}
        </Alert>
        <Link
          href="/login"
          className="text-center text-sm font-medium text-accent hover:underline"
        >
          Sign in with your new password
        </Link>
      </div>
    );
  }

  // Submit-time gate — same validators the fields run on blur.
  const passwordValidator = (value: string) =>
    firstError(
      value,
      required("Choose a new password"),
      minLength(8, "Password must be at least 8 characters"),
    );
  const confirmValidator = (value: string) =>
    firstError(value, required("Re-enter your new password"), matches(password));

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const errors: Record<string, string> = {};
    const emailError = emailValidator()(email);
    const passwordError = passwordValidator(password);
    const confirmError = confirmValidator(confirm);
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;
    if (confirmError) errors.confirm = confirmError;

    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    mutation.mutate();
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {generalError ? <FormError message={generalError} /> : null}
      {!initialToken ? (
        <FormError message="This reset link is missing its token — request a new one from “Forgot your password?”." />
      ) : null}
      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={setEmail}
        validate={emailValidator()}
        hint="The address this reset link was sent to."
        error={clientErrors.email ?? fieldErrors?.email?.[0]}
      />
      <AuthField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={setPassword}
        validate={passwordValidator}
        hint="At least 8 characters."
        error={clientErrors.password ?? fieldErrors?.password?.[0]}
      />
      <AuthField
        id="password_confirmation"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={setConfirm}
        validate={confirmValidator}
        error={clientErrors.confirm}
      />
      <Button type="submit" size="lg" block loading={mutation.isPending} className="mt-2">
        Reset password
      </Button>
    </form>
  );
}

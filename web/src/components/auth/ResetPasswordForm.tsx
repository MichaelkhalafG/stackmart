"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

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
  const [mismatch, setMismatch] = useState<string | undefined>();

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
      <div className="flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="size-8 text-accent" aria-hidden />
        <p className="text-sm text-fg-muted">{mutation.data.message || "Password has been reset."}</p>
        <Link href="/login" className="text-sm font-medium text-accent hover:underline">
          Sign in with your new password
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (password !== confirm) {
          setMismatch("Passwords do not match.");
          return;
        }
        setMismatch(undefined);
        mutation.mutate();
      }}
    >
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
        error={fieldErrors?.email?.[0]}
      />
      <AuthField
        id="password"
        label="New password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={setPassword}
        error={fieldErrors?.password?.[0]}
      />
      <AuthField
        id="password_confirmation"
        label="Confirm new password"
        type="password"
        autoComplete="new-password"
        required
        value={confirm}
        onChange={setConfirm}
        error={mismatch}
      />
      <Button type="submit" size="lg" disabled={mutation.isPending} className="mt-1 w-full">
        {mutation.isPending ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { MailCheck } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

import { AuthField, FormError } from "./AuthField";

const GENERIC_MESSAGE = "If the email exists, a reset link was sent. Check your inbox.";

/**
 * Forgot-password form (S3.03). POSTs to `POST /api/auth/forgot-password` (S3.02), which
 * ALWAYS returns the same generic response whether or not the address exists — so on
 * success we show a fixed confirmation and never reveal which emails are registered.
 * A 422 (malformed email) surfaces under the field.
 */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const fieldErrors = apiError?.errors;
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;

  if (mutation.isSuccess) {
    return (
      <div className="flex flex-col items-center gap-3 text-center">
        <MailCheck className="size-8 text-accent" aria-hidden />
        <p className="text-sm text-fg-muted">{GENERIC_MESSAGE}</p>
        <Link href="/login" className="text-sm font-medium text-accent hover:underline">
          Back to sign in
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
        mutation.mutate();
      }}
    >
      {generalError ? <FormError message={generalError} /> : null}
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
      <Button type="submit" size="lg" disabled={mutation.isPending} className="mt-1 w-full">
        {mutation.isPending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api";
import { useAuthStore, type User } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { email as emailValidator, required } from "@/lib/validation";

import { AuthField, FormError } from "./AuthField";

type AuthResponse = { data: { token: string; user: User } };

/**
 * Login form (S3.03). POSTs to the real S3.01 `POST /api/auth/login` via the lib/api.ts
 * wrapper; on success stores the Sanctum token + user through `setAuth` and redirects to
 * /account. 422 field errors are read from `ApiError.errors` and rendered under each input.
 *
 * `onSuccess` lets a CALLER take over what happens after authentication, without duplicating any
 * auth logic. The /login page passes nothing and keeps the existing redirect to /account; the
 * purchase-interception `AuthModal` passes a handler that closes the dialog and resumes checkout,
 * so the buyer is never bounced out of the page they were buying from.
 */
export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    onSuccess: ({ data }) => {
      // Token + user are stored identically in BOTH paths — only the "what next" differs.
      setAuth(data.token, data.user);
      if (onSuccess) {
        onSuccess();
        return;
      }
      router.replace("/account");
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const fieldErrors = apiError?.errors;
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;

  // Submit-time gate: the same validators the fields use on blur, re-run so nothing slips through
  // untouched. Client errors take priority over stale server errors from a previous attempt.
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const validators = {
    email: emailValidator(),
    password: required("Enter your password"),
  };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const errors: Record<string, string> = {};
    const emailError = validators.email(email);
    const passwordError = validators.password(password);
    if (emailError) errors.email = emailError;
    if (passwordError) errors.password = passwordError;

    setClientErrors(errors);
    if (Object.keys(errors).length > 0) return;

    mutation.mutate();
  }

  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {generalError ? <FormError message={generalError} /> : null}
      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={setEmail}
        validate={validators.email}
        error={clientErrors.email ?? fieldErrors?.email?.[0]}
      />
      <AuthField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        required
        value={password}
        onChange={setPassword}
        validate={validators.password}
        error={clientErrors.password ?? fieldErrors?.password?.[0]}
        labelSuffix={
          <Link
            href="/forgot-password"
            className="text-[12.5px] font-medium text-accent hover:underline"
          >
            Forgot?
          </Link>
        }
      />
      <Button type="submit" size="lg" block loading={mutation.isPending} className="mt-2">
        Sign in
      </Button>
    </form>
  );
}

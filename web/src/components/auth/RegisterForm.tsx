"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api";
import { useAuthStore, type User } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { email as emailValidator, firstError, minLength, required } from "@/lib/validation";

import { AuthField, FormError } from "./AuthField";

type AuthResponse = { data: { token: string; user: User } };

/**
 * Register form (S3.03). POSTs to the real S3.01 `POST /api/auth/register` via the
 * lib/api.ts wrapper; on success stores the token + user through `setAuth` and redirects
 * to /account. 422 field errors (e.g. taken email, short password) come from
 * `ApiError.errors` and render under the matching input.
 *
 * `onSuccess` lets a CALLER take over what happens after authentication, without duplicating any
 * auth logic. The /register page passes nothing and keeps the existing redirect to /account; the
 * purchase-interception `AuthModal` passes a handler that closes the dialog and resumes checkout.
 */
export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
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

  // Submit-time gate — the same validators the fields run on blur.
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  const validators = {
    name: required("Enter your full name"),
    email: emailValidator(),
    password: (value: string) =>
      firstError(
        value,
        required("Choose a password"),
        minLength(8, "Password must be at least 8 characters"),
      ),
  };

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const errors: Record<string, string> = {};
    const nameError = validators.name(name);
    const emailError = validators.email(email);
    const passwordError = validators.password(password);
    if (nameError) errors.name = nameError;
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
        id="name"
        label="Full name"
        autoComplete="name"
        required
        value={name}
        onChange={setName}
        validate={validators.name}
        error={clientErrors.name ?? fieldErrors?.name?.[0]}
      />
      <AuthField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={setEmail}
        validate={validators.email}
        hint="We'll send your license key and receipts here."
        error={clientErrors.email ?? fieldErrors?.email?.[0]}
      />
      <AuthField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={setPassword}
        validate={validators.password}
        hint="At least 8 characters."
        error={clientErrors.password ?? fieldErrors?.password?.[0]}
      />
      <Button type="submit" size="lg" block loading={mutation.isPending} className="mt-2">
        Create account
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api";
import { useAuthStore, type User } from "@/store/auth";
import { Button } from "@/components/ui/button";

import { AuthField, FormError } from "./AuthField";

type AuthResponse = { data: { token: string; user: User } };

/**
 * Register form (S3.03). POSTs to the real S3.01 `POST /api/auth/register` via the
 * lib/api.ts wrapper; on success stores the token + user through `setAuth` and redirects
 * to /account. 422 field errors (e.g. taken email, short password) come from
 * `ApiError.errors` and render under the matching input.
 */
export function RegisterForm() {
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
      setAuth(data.token, data.user);
      router.replace("/account");
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const fieldErrors = apiError?.errors;
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;

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
        id="name"
        label="Full name"
        autoComplete="name"
        required
        value={name}
        onChange={setName}
        error={fieldErrors?.name?.[0]}
      />
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
        label="Password"
        type="password"
        autoComplete="new-password"
        required
        value={password}
        onChange={setPassword}
        error={fieldErrors?.password?.[0]}
      />
      <Button type="submit" size="lg" block loading={mutation.isPending} className="mt-2">
        Create account
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

import { api, ApiError } from "@/lib/api";
import { useAuthStore, type User } from "@/store/auth";
import { Button } from "@/components/ui/button";

import { AuthField, FormError } from "./AuthField";

type AuthResponse = { data: { token: string; user: User } };

/**
 * Login form (S3.03). POSTs to the real S3.01 `POST /api/auth/login` via the lib/api.ts
 * wrapper; on success stores the Sanctum token + user through `setAuth` and redirects to
 * /account. 422 field errors are read from `ApiError.errors` and rendered under each input.
 */
export function LoginForm() {
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
        autoComplete="current-password"
        required
        value={password}
        onChange={setPassword}
        error={fieldErrors?.password?.[0]}
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

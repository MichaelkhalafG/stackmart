"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { useAuthStore, type User } from "@/store/auth";
import { Field } from "@/components/form/Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { useToast } from "@/components/ui/toast";
import { firstError, maxLength, minLength, required } from "@/lib/validation";

type ProfileResponse = { data: User; message: string };

/**
 * Edit the display name — `PATCH /auth/profile` (Sanctum Bearer, current user only).
 *
 * The API is the authority: the same rules it enforces (required, 2–255 chars) are re-run here on
 * blur and on submit so the user is told BEFORE a round-trip, and a 422 still wins — its messages are
 * mapped back onto the field via `ApiError.errors.name[0]` (the LoginForm pattern).
 *
 * On success the updated user is written back to the auth store with `setAuth(token, user)`, which is
 * what makes the header/user-menu show the new name immediately — no reload, no refetch.
 */
export function EditNameForm({ user }: { user: User }) {
  const [name, setName] = useState(user.name);
  const [clientError, setClientError] = useState<string | undefined>();
  const { toast } = useToast();

  const validate = (value: string) =>
    firstError(
      value.trim(),
      required("Enter your display name — it's what we show on your account."),
      minLength(2, "Your display name needs at least 2 characters."),
      maxLength(255, "Your display name can't be longer than 255 characters."),
    );

  const mutation = useMutation({
    mutationFn: (nextName: string) =>
      api<ProfileResponse>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify({ name: nextName }),
      }),
    onSuccess: ({ data }) => {
      // Keep the SAME token — only the user record changed. This is the one write that makes the
      // rename visible everywhere the store is read (header, user menu, profile card).
      const { token } = useAuthStore.getState();
      if (token) useAuthStore.getState().setAuth(token, data);

      setName(data.name);
      toast({ title: "Display name updated", tone: "success" });
    },
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const serverError = apiError?.errors?.name?.[0];
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;
  const error = clientError ?? serverError;

  const trimmed = name.trim();
  const isDirty = trimmed !== user.name;

  function handleChange(value: string) {
    setName(value);
    if (clientError) setClientError(undefined);
    // Any edit invalidates the previous outcome — don't leave a stale success/error banner up.
    if (mutation.isSuccess || mutation.isError) mutation.reset();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const message = validate(name);
    setClientError(message);
    if (message) return;

    if (!isDirty) return;
    mutation.mutate(trimmed);
  }

  return (
    <section className="rounded-xl border border-border bg-canvas p-6 sm:p-7">
      <h2 className="text-[15px] font-bold text-primary">Display name</h2>
      <p className="mt-1 text-[13px] leading-[1.5] text-fg-muted">
        The name shown on your account and on your purchase receipts.
      </p>

      <form noValidate onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
        {generalError ? <Alert variant="error">{generalError}</Alert> : null}

        {mutation.isSuccess ? (
          <Alert variant="success" title="Display name updated">
            Everywhere you appear on MDN STACKMART now says &ldquo;{user.name}&rdquo;.
          </Alert>
        ) : null}

        <Field
          label="Name"
          required
          error={error}
          helper="Between 2 and 255 characters. Your email address stays private."
        >
          {(fieldProps) => (
            <Input
              {...fieldProps}
              name="name"
              value={name}
              autoComplete="name"
              onChange={(event) => handleChange(event.target.value)}
              onBlur={() => setClientError(validate(name))}
              placeholder="Your name"
            />
          )}
        </Field>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={mutation.isPending} disabled={!isDirty}>
            {!mutation.isPending && mutation.isSuccess ? <Check className="size-4" aria-hidden /> : null}
            Save changes
          </Button>

          {isDirty && !mutation.isPending ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setName(user.name);
                setClientError(undefined);
                if (mutation.isError) mutation.reset();
              }}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

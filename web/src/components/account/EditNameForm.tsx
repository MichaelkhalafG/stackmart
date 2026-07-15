"use client";

import { useId, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, ChevronDown, UserRound } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
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
  // Mobile-only disclosure: the card is a tappable header, collapsed by default (<md), so the
  // account page isn't a long stack of open forms. `md:block` below keeps it always-open on desktop.
  const [open, setOpen] = useState(false);
  const bodyId = useId();
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
            <UserRound className="size-[18px]" strokeWidth={2} />
          </span>
          <span className="flex-1 text-[15px] font-bold text-primary">Display name</span>
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
        The name shown on your account and on your purchase receipts.
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

        {/* Phones: the two actions stack full-width (44px targets). From `sm` up: the original row. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            loading={mutation.isPending}
            disabled={!isDirty}
            className="w-full sm:w-auto"
          >
            {!mutation.isPending && mutation.isSuccess ? <Check className="size-4" aria-hidden /> : null}
            Save changes
          </Button>

          {isDirty && !mutation.isPending ? (
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
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

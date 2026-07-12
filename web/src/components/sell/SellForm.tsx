"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { PackageCheck } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// Generic labelled-field + error-banner primitives (defined with the auth forms).
import { AuthField, FormError } from "@/components/auth/AuthField";

/** 201 response shape of the frozen POST /api/submissions (12_API_Specification.md). */
type SubmissionResponse = { data: { id: number; status: string }; message: string };

/** Dollars string → integer cents (contract sends *_cents). Empty/invalid/≤0 → 0. */
function toCents(dollars: string): number {
  const value = Number.parseFloat(dollars);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0;
}

/** Money input: the user types dollars, but the form SUBMITS integer cents (shown live). */
function MoneyField({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const errorId = `${id}-error`;
  const cents = toCents(value);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-fg-muted"
        >
          $
        </span>
        <Input
          id={id}
          name={id}
          type="number"
          min="0"
          step="0.01"
          inputMode="decimal"
          placeholder="0.00"
          className="pl-6"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
      </div>
      <p className="text-xs text-fg-muted">
        {value ? `Submitted as ${cents.toLocaleString()} cents (USD)` : "USD — submitted in cents"}
      </p>
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Sell submission form (S3.04). Public, no auth. Controlled fields POST to the FROZEN
 * `POST /api/submissions` contract (12_API_Specification.md) via lib/api.ts — built
 * against the contract, never live endpoint. Money fields collect dollars but
 * submit integer `*_cents`. 422 field errors come from `ApiError.errors`; a 201 shows the
 * success state. shadcn Input/Label/Textarea/Button used as-is with 06_UI_System tokens.
 */
export function SellForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [url, setUrl] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [mrr, setMrr] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      api<SubmissionResponse>("/submissions", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          project_name: projectName,
          url: url.trim() ? url.trim() : null,
          asking_price_cents: toCents(askingPrice),
          mrr_cents: toCents(mrr),
          description,
        }),
      }),
  });

  const apiError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const fieldErrors = apiError?.errors;
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;

  function resetForm() {
    setName("");
    setEmail("");
    setProjectName("");
    setUrl("");
    setAskingPrice("");
    setMrr("");
    setDescription("");
    mutation.reset();
  }

  if (mutation.isSuccess) {
    return (
      <Card className="items-center gap-3 p-8 text-center">
        <PackageCheck className="size-9 text-accent" aria-hidden />
        <h2 className="text-lg font-semibold text-fg">
          {mutation.data.message || "Submission received."}
        </h2>
        <p className="max-w-sm text-sm text-fg-muted">
          Thanks — our team reviews every submission and will be in touch by email. You don&apos;t
          need an account; we&apos;ll follow up at the address you provided.
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Button type="button" variant="outline" onClick={resetForm}>
            Submit another
          </Button>
          <Link href="/marketplace" className="text-sm font-medium text-accent hover:underline">
            Browse the marketplace
          </Link>
        </div>
      </Card>
    );
  }

  const descriptionError = fieldErrors?.description?.[0];

  return (
    <Card className="gap-0 p-0">
      <form
        noValidate
        className="flex flex-col gap-5 p-6"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
      {generalError ? <FormError message={generalError} /> : null}

      <AuthField
        id="name"
        label="Your name"
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
        hint="We'll only use this to follow up about your submission."
      />
      <AuthField
        id="project_name"
        label="Project name"
        required
        value={projectName}
        onChange={setProjectName}
        error={fieldErrors?.project_name?.[0]}
      />
      <AuthField
        id="url"
        label="Demo or repository URL"
        type="url"
        value={url}
        onChange={setUrl}
        error={fieldErrors?.url?.[0]}
        hint="Optional. Must start with https://"
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <MoneyField
          id="asking_price_cents"
          label="Asking price"
          value={askingPrice}
          onChange={setAskingPrice}
          error={fieldErrors?.asking_price_cents?.[0]}
        />
        <MoneyField
          id="mrr_cents"
          label="Monthly recurring revenue"
          value={mrr}
          onChange={setMrr}
          error={fieldErrors?.mrr_cents?.[0]}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={6}
          placeholder="What does it do, who is it for, what's included in the sale?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          aria-invalid={descriptionError ? true : undefined}
          aria-describedby={descriptionError ? "description-error" : undefined}
        />
        {descriptionError ? (
          <p id="description-error" className="text-xs text-destructive">
            {descriptionError}
          </p>
        ) : null}
      </div>

        <Button type="submit" size="lg" disabled={mutation.isPending} className="mt-1 w-full sm:w-auto sm:self-start">
          {mutation.isPending ? "Submitting…" : "Submit project"}
        </Button>
      </form>
    </Card>
  );
}

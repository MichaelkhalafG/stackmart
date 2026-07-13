"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Check, Info } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Alert, ErrorSummary } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormSection } from "@/components/form/Field";
import { AffixInput, MoneyInput } from "@/components/form/AffixInput";

/** 201 response shape of the frozen POST /api/submissions (12_API_Specification.md). */
type SubmissionResponse = { data: { id: number; status: string }; message: string };

/** The three groups of the form — also the rows of the sticky progress rail (reference §02). */
const STEPS = [
  { id: "sell-basics", step: "01", title: "The basics" },
  { id: "sell-financials", step: "02", title: "Financials" },
  { id: "sell-pitch", step: "03", title: "The pitch" },
] as const;

/** Soft guideline for the pitch — the API sets no max, so this counter never truncates input. */
const DESCRIPTION_TARGET = 600;

/** Dollars string → integer cents (contract sends *_cents). Empty/invalid/≤0 → 0. */
function toCents(dollars: string): number {
  const value = Number.parseFloat(dollars);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0;
}

/**
 * The URL control carries a fixed `https://` affix (reference §02), so the user types only the host.
 * The contract still receives a full HTTPS URL (`nullable|url:https`) — or `null` when blank.
 */
function toUrl(raw: string): string | null {
  const host = raw.trim().replace(/^https?:\/\//i, "");
  return host ? `https://${host}` : null;
}

/**
 * The live cents readout that sits under every money control. The user types DOLLARS, the form
 * SUBMITS integer cents — this line makes that conversion visible at all times (mono = money).
 */
function CentsHint({ value }: { value: string }) {
  return (
    <p className="text-[12.5px] leading-[1.45] text-fg-muted">
      {value ? (
        <>
          Submitted as <span className="mono text-primary">{toCents(value).toLocaleString()}</span>{" "}
          cents (USD).
        </>
      ) : (
        "USD — submitted in cents."
      )}
    </p>
  );
}

/** The sticky rail: the three sections, the current one washed in lavender (reference §02). */
function ProgressRail({ active, onJump }: { active: number; onJump: (index: number) => void }) {
  return (
    <aside className="sticky top-20 hidden rounded-[10px] border border-border bg-canvas p-[22px] lg:block">
      <p className="mono mb-4 text-[11px] tracking-[0.1em] text-fg-muted uppercase">Progress</p>

      <nav aria-label="Form sections" className="flex flex-col gap-0.5">
        {STEPS.map((section, index) => {
          const current = index === active;
          return (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={() => onJump(index)}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex items-center gap-[11px] rounded-md px-1.5 py-2 transition-colors",
                current ? "bg-tag-bg" : "hover:bg-canvas-subtle",
              )}
            >
              <span
                className={cn(
                  "mono flex size-[22px] flex-none items-center justify-center rounded-full text-[11px]",
                  current
                    ? "bg-accent text-canvas"
                    : "border border-border bg-canvas text-fg-muted",
                )}
                aria-hidden
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "text-[13.5px]",
                  current ? "font-semibold text-primary" : "font-medium text-fg-muted",
                )}
              >
                {section.title}
              </span>
            </a>
          );
        })}
      </nav>

      <div className="my-[18px] h-px bg-border" aria-hidden />

      <p className="flex items-start gap-[9px] text-[12.5px] leading-[1.5] text-fg-muted">
        <Info className="mt-px size-[15px] flex-none text-accent" strokeWidth={2.2} aria-hidden />
        Listings stay hidden until our team has reviewed your submission.
      </p>
    </aside>
  );
}

/**
 * Sell submission form (S3.04). Public, no auth. Controlled fields POST to the FROZEN
 * `POST /api/submissions` contract (12_API_Specification.md) via lib/api.ts. Money fields collect
 * dollars but submit integer `*_cents` (the conversion is shown live under each control). 422 field
 * errors come from `ApiError.errors`, keyed by the contract's snake_case names; a 201 shows the
 * success panel.
 *
 * Presentation follows "Forms & Utility reference §02": a bordered card of numbered sections split
 * by 1px dividers, a canvas-subtle action footer, and a sticky progress rail beside it (≥lg).
 * The reference's Category select and Screenshots dropzone are intentionally NOT rendered — the
 * contract accepts neither, and faking them would either send a rejected field or imply an upload
 * that never happens.
 */
export function SellForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [url, setUrl] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [mrr, setMrr] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(0);

  const mutation = useMutation({
    mutationFn: () =>
      api<SubmissionResponse>("/submissions", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          project_name: projectName,
          url: toUrl(url),
          asking_price_cents: toCents(askingPrice),
          mrr_cents: toCents(mrr),
          description,
        }),
      }),
  });

  const done = mutation.isSuccess;

  // Highlight the section the seller is currently looking at. Focus (keyboard) is handled per
  // section below; this covers scrolling. Re-runs when the form comes back after "Submit another",
  // since the observed nodes are recreated.
  useEffect(() => {
    if (done || typeof IntersectionObserver === "undefined") return;

    const nodes = STEPS.map((section) => document.getElementById(section.id)).filter(
      (node): node is HTMLElement => node !== null,
    );
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const topMost = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (!topMost) return;
        const index = STEPS.findIndex((section) => section.id === topMost.target.id);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-96px 0px -55% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [done]);

  const apiError = mutation.error instanceof ApiError ? mutation.error : undefined;
  const fieldErrors = apiError?.errors;
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;

  // Form-level summary: the first message of each rejected field, in the order the fields appear.
  const summary = fieldErrors
    ? ["name", "email", "project_name", "url", "asking_price_cents", "mrr_cents", "description"]
        .map((field) => fieldErrors[field]?.[0])
        .filter((message): message is string => Boolean(message))
        .map((message) => ({ message }))
    : [];

  function clearForm() {
    setName("");
    setEmail("");
    setProjectName("");
    setUrl("");
    setAskingPrice("");
    setMrr("");
    setDescription("");
    mutation.reset();
  }

  if (done) {
    return (
      <div className="anim-fade rounded-[10px] border border-border bg-canvas px-6 py-12 text-center sm:px-12 sm:py-16">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-tag-bg">
          <Check className="size-[30px] text-accent" strokeWidth={2.6} aria-hidden />
        </div>

        <h2 className="mt-6 text-[1.6rem] leading-tight font-bold text-primary">
          {mutation.data.message || "Listing submitted for review"}
        </h2>

        <p className="mx-auto mt-2 max-w-[46ch] text-[15px] leading-[1.55] text-fg-muted">
          Our team reviews every submission before it goes live — no account needed. We&apos;ll
          follow up
          {email ? (
            <>
              {" "}
              at <span className="mono text-primary">{email}</span>
            </>
          ) : (
            " by email"
          )}
          , either way.
        </p>

        <p className="mono mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-canvas-subtle px-3.5 py-2 text-[12.5px] text-fg-muted">
          ref <span className="text-primary">#{mutation.data.data.id}</span>
          <span aria-hidden>·</span>
          {mutation.data.data.status}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/marketplace" className={cn(buttonVariants())}>
            Browse the marketplace
          </Link>
          <Button type="button" variant="outline" onClick={clearForm}>
            Submit another
          </Button>
        </div>
      </div>
    );
  }

  const askingPriceError = fieldErrors?.asking_price_cents?.[0];
  const mrrError = fieldErrors?.mrr_cents?.[0];
  const urlError = fieldErrors?.url?.[0];

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
        className="overflow-hidden rounded-[10px] border border-border bg-canvas"
      >
        {generalError || summary.length > 0 ? (
          <div className="flex flex-col gap-4 border-b border-border p-6 sm:p-8 lg:px-10 lg:pt-10">
            {generalError ? (
              <Alert variant="error" title="We couldn't send your submission">
                {generalError}
              </Alert>
            ) : null}
            <ErrorSummary errors={summary} />
          </div>
        ) : null}

        {/* 01 — the basics */}
        <div
          id={STEPS[0].id}
          onFocusCapture={() => setActive(0)}
          className="scroll-mt-24 p-6 sm:p-8 lg:p-10"
        >
          <FormSection step={STEPS[0].step} title={STEPS[0].title}>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <Field label="Your name" required error={fieldErrors?.name?.[0]}>
                {(props) => (
                  <Input
                    {...props}
                    name="name"
                    autoComplete="name"
                    placeholder="Jordan Ellis"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                )}
              </Field>

              <Field
                label="Email"
                required
                helper="We'll only use this to follow up about your submission."
                error={fieldErrors?.email?.[0]}
              >
                {(props) => (
                  <Input
                    {...props}
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                )}
              </Field>
            </div>

            <Field
              className="mt-5"
              label="Project name"
              required
              helper="Shown as the public title of your listing."
              error={fieldErrors?.project_name?.[0]}
            >
              {(props) => (
                <Input
                  {...props}
                  name="project_name"
                  placeholder="Inboxly"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                />
              )}
            </Field>

            <Field
              className="mt-5"
              label="Live URL"
              helper="Optional — the live demo or the repository. We verify ownership after submission."
              error={urlError}
            >
              {(props) => (
                <AffixInput
                  {...props}
                  name="url"
                  prefix="https://"
                  invalid={Boolean(urlError)}
                  autoComplete="url"
                  placeholder="inboxly.app"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                />
              )}
            </Field>
          </FormSection>
        </div>

        <div className="h-px bg-border" aria-hidden />

        {/* 02 — financials */}
        <div
          id={STEPS[1].id}
          onFocusCapture={() => setActive(1)}
          className="scroll-mt-24 p-6 sm:p-8 lg:p-10"
        >
          <FormSection step={STEPS[1].step} title={STEPS[1].title}>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <Field label="Asking price" required error={askingPriceError}>
                {(props) => (
                  <div className="flex flex-col gap-[7px]">
                    <MoneyInput
                      {...props}
                      name="asking_price_cents"
                      invalid={Boolean(askingPriceError)}
                      placeholder="0.00"
                      value={askingPrice}
                      onChange={(event) => setAskingPrice(event.target.value)}
                    />
                    <CentsHint value={askingPrice} />
                  </div>
                )}
              </Field>

              <Field label="Monthly recurring revenue" required error={mrrError}>
                {(props) => (
                  <div className="flex flex-col gap-[7px]">
                    <MoneyInput
                      {...props}
                      name="mrr_cents"
                      invalid={Boolean(mrrError)}
                      placeholder="0.00"
                      value={mrr}
                      onChange={(event) => setMrr(event.target.value)}
                    />
                    <CentsHint value={mrr} />
                  </div>
                )}
              </Field>
            </div>
          </FormSection>
        </div>

        <div className="h-px bg-border" aria-hidden />

        {/* 03 — the pitch */}
        <div
          id={STEPS[2].id}
          onFocusCapture={() => setActive(2)}
          className="scroll-mt-24 p-6 sm:p-8 lg:p-10"
        >
          <FormSection step={STEPS[2].step} title={STEPS[2].title}>
            <Field label="Description" required error={fieldErrors?.description?.[0]}>
              {(props) => (
                <div className="flex flex-col gap-1.5">
                  <Textarea
                    {...props}
                    name="description"
                    rows={5}
                    placeholder="What does it do, who is it for, what's included in the sale?"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                  />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12.5px] text-fg-muted">
                      What it does, who it&apos;s for, what&apos;s included in the sale.
                    </span>
                    <span className="mono text-xs text-fg-muted">
                      {description.length} / {DESCRIPTION_TARGET}
                    </span>
                  </div>
                </div>
              )}
            </Field>
          </FormSection>
        </div>

        {/* footer bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-canvas-subtle px-6 py-[22px] sm:px-8 lg:px-10">
          <span className="text-[13px] text-fg-muted">
            No account needed — our team replies by email.
          </span>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={clearForm}
              disabled={mutation.isPending}
            >
              Clear form
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              Submit for review
            </Button>
          </div>
        </div>
      </form>

      <ProgressRail active={active} onJump={setActive} />
    </div>
  );
}

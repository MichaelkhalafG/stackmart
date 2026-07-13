"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Info, ShieldCheck } from "lucide-react";

import { api, ApiError, toFormData } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Alert, ErrorSummary } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormSection } from "@/components/form/Field";
import { AffixInput, MoneyInput } from "@/components/form/AffixInput";
import {
  ImageGalleryField,
  NativeSelect,
  SingleFileField,
  TagInput,
} from "@/components/sell/fields";

/** 201 response shape of POST /api/submissions (12_API_Specification.md — unchanged by DR-8). */
type SubmissionResponse = { data: { id: number; status: string }; message: string };

/** A category from GET /api/categories. */
type Category = { id: number; name: string; slug: string };

/** Server limits (DR-8) — mirrored client-side so the seller isn't bounced by a 422. */
const MAX_ZIP_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_README_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB each
const MAX_IMAGES = 8;

/** The five groups of the form — also the rows of the sticky progress rail (reference §02). */
const STEPS = [
  { id: "sell-basics", step: "01", title: "The basics" },
  { id: "sell-financials", step: "02", title: "Financials" },
  { id: "sell-product", step: "03", title: "The product" },
  { id: "sell-files", step: "04", title: "Files & verification" },
  { id: "sell-payout", step: "05", title: "Payout & confirm" },
] as const;

/** The order the error summary lists rejected fields in (top of the form → bottom). */
const FIELD_ORDER = [
  "name",
  "email",
  "project_name",
  "category_id",
  "url",
  "asking_price_cents",
  "mrr_cents",
  "images",
  "description",
  "deliverable",
  "readme",
  "payout_method",
  "payout_holder_name",
  "payout_identifier",
  "terms_accepted",
] as const;

const DESCRIPTION_TARGET = 600;

/** Dollars string → integer cents (the contract sends *_cents). Empty/invalid/≤0 → 0. */
function toCents(dollars: string): number {
  const value = Number.parseFloat(dollars);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : 0;
}

/** A plain optional integer (metrics are whole numbers, not cents). Blank → undefined (omitted). */
function toInt(raw: string): number | undefined {
  if (raw.trim() === "") return undefined;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

/**
 * The URL control carries a fixed `https://` affix (reference §02), so the seller types only the
 * host. The contract still receives a full HTTPS URL (`nullable|url:https`) — or null when blank.
 */
function toUrl(raw: string): string | null {
  const host = raw.trim().replace(/^https?:\/\//i, "");
  return host ? `https://${host}` : null;
}

/** The live cents readout under every money control: the seller types DOLLARS, we submit cents. */
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

/** The sticky rail: the sections, the current one washed in lavender (reference §02). */
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
                  current ? "bg-accent text-canvas" : "border border-border bg-canvas text-fg-muted",
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
        Listings stay hidden until our team has reviewed your code and verified your revenue.
      </p>
    </aside>
  );
}

/**
 * Sell submission form (S3.04, expanded by DR-8). Public, no auth.
 *
 * POSTs **multipart/form-data** to `POST /api/submissions` via `lib/api.ts` (`toFormData` encodes
 * the nested `tech_stack[...]` / `metrics[...]` groups and the repeated `images[]` files the way
 * Laravel reads them back).
 *
 * Money fields collect DOLLARS but submit integer `*_cents` — the conversion is shown live under
 * each control. Client-side validation mirrors the server rules (required uploads, ≥1 image, file
 * types and sizes) so the seller isn't bounced by a 422 after a long upload; any server 422 still
 * wins and is keyed back to its field via `ApiError.errors`.
 *
 * Presentation follows "Forms & Utility reference §02": a bordered card of numbered sections split
 * by 1px dividers, a canvas-subtle action footer, and a sticky progress rail beside it (≥lg).
 */
export function SellForm() {
  // 01 basics
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [url, setUrl] = useState("");

  // 02 financials
  const [askingPrice, setAskingPrice] = useState("");
  const [mrr, setMrr] = useState("");
  const [metricUsers, setMetricUsers] = useState("");
  const [metricTraffic, setMetricTraffic] = useState("");

  // 03 the product
  const [languages, setLanguages] = useState<string[]>([]);
  const [frameworks, setFrameworks] = useState<string[]>([]);
  const [databases, setDatabases] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");

  // 04 files
  const [deliverable, setDeliverable] = useState<File | null>(null);
  const [readme, setReadme] = useState<File | null>(null);

  // 05 payout + confirm
  const [payoutMethod, setPayoutMethod] = useState<"bank" | "paypal">("bank");
  const [payoutHolder, setPayoutHolder] = useState("");
  const [payoutIdentifier, setPayoutIdentifier] = useState("");
  const [payoutBank, setPayoutBank] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const [active, setActive] = useState(0);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<{ data: Category[] }>("/categories"),
    staleTime: 5 * 60_000,
  });

  const mutation = useMutation({
    mutationFn: () => {
      // The single source of truth for MRR: the seller types it once, in Financials.
      const mrrCents = toCents(mrr);

      return api<SubmissionResponse>("/submissions", {
        method: "POST",
        // Multipart: `toFormData` builds the FormData and `api()` leaves Content-Type unset so the
        // browser supplies the boundary.
        body: toFormData({
          name,
          email,
          project_name: projectName,
          category_id: categoryId,
          url: toUrl(url),
          asking_price_cents: toCents(askingPrice),
          mrr_cents: mrrCents,
          description,

          // Required uploads.
          deliverable,
          readme,
          images,

          // tech_stack[languages][], tech_stack[frameworks][], tech_stack[databases][]
          tech_stack: {
            languages,
            frameworks,
            databases,
          },

          // metrics[mrr], metrics[users], metrics[traffic] — omitted entirely when blank.
          //
          // `metrics.mrr` is DERIVED from the required financials MRR (cents → whole USD, the shape
          // products.metrics uses) rather than asked for twice. A zero MRR is omitted, so a
          // pre-revenue listing doesn't publish a meaningless "$0 MRR" on its card.
          metrics: {
            mrr: mrrCents > 0 ? Math.round(mrrCents / 100) : undefined,
            users: toInt(metricUsers),
            traffic: toInt(metricTraffic),
          },

          payout_method: payoutMethod,
          payout_holder_name: payoutHolder,
          payout_identifier: payoutIdentifier,
          payout_bank_name: payoutMethod === "bank" ? payoutBank : null,

          terms_accepted: termsAccepted,
        }),
      });
    },
  });

  const done = mutation.isSuccess;

  // Highlight the section the seller is looking at (scroll). Focus is handled per section below.
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
  const serverErrors = apiError?.errors;
  const generalError = apiError && !apiError.isValidationError ? apiError.message : undefined;

  /**
   * The message for a field: a client-side error first (it fired before the request), otherwise the
   * server's. `images` also absorbs the per-file keys Laravel returns (`images.0`, `images.1`, …).
   */
  function errorFor(field: string): string | undefined {
    if (clientErrors[field]) return clientErrors[field];
    if (!serverErrors) return undefined;
    if (serverErrors[field]?.[0]) return serverErrors[field][0];

    const nested = Object.keys(serverErrors).find((key) => key.startsWith(`${field}.`));
    return nested ? serverErrors[nested][0] : undefined;
  }

  const summary = FIELD_ORDER.map((field) => errorFor(field))
    .filter((message): message is string => Boolean(message))
    .map((message) => ({ message }));

  /** Mirrors the server rules so a long upload is never wasted on a predictable 422. */
  function validate(): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!name.trim()) errors.name = "Your name is required.";
    if (!email.trim()) errors.email = "Your email is required.";
    if (!projectName.trim()) errors.project_name = "The project name is required.";
    if (!categoryId) errors.category_id = "Choose the category your product belongs in.";
    if (!description.trim()) errors.description = "Describe what you're selling.";

    if (!deliverable) {
      errors.deliverable = "Attach the deliverable .zip — buyers receive this file.";
    } else if (!deliverable.name.toLowerCase().endsWith(".zip")) {
      errors.deliverable = "The deliverable must be a .zip archive.";
    } else if (deliverable.size > MAX_ZIP_BYTES) {
      errors.deliverable = "The deliverable may not be larger than 100 MB.";
    }

    if (!readme) {
      errors.readme = "Attach a README so our team can verify the listing.";
    } else if (!/\.(md|txt|pdf)$/i.test(readme.name)) {
      errors.readme = "The README must be a .md, .txt or .pdf file.";
    } else if (readme.size > MAX_README_BYTES) {
      errors.readme = "The README may not be larger than 10 MB.";
    }

    if (images.length === 0) {
      errors.images = "Add at least one product image.";
    } else if (images.length > MAX_IMAGES) {
      errors.images = `Add at most ${MAX_IMAGES} images.`;
    } else if (images.some((image) => image.size > MAX_IMAGE_BYTES)) {
      errors.images = "Each image may not be larger than 5 MB.";
    }

    if (!payoutHolder.trim()) errors.payout_holder_name = "Tell us who the account belongs to.";
    if (!payoutIdentifier.trim()) {
      errors.payout_identifier =
        payoutMethod === "bank"
          ? "Enter the IBAN or account number we should transfer to."
          : "Enter the PayPal address we should transfer to.";
    }

    if (!termsAccepted) {
      errors.terms_accepted = "Please confirm your listing information is accurate.";
    }

    return errors;
  }

  function clearForm() {
    setName("");
    setEmail("");
    setProjectName("");
    setCategoryId("");
    setUrl("");
    setAskingPrice("");
    setMrr("");
    setMetricUsers("");
    setMetricTraffic("");
    setLanguages([]);
    setFrameworks([]);
    setDatabases([]);
    setImages([]);
    setDescription("");
    setDeliverable(null);
    setReadme(null);
    setPayoutMethod("bank");
    setPayoutHolder("");
    setPayoutIdentifier("");
    setPayoutBank("");
    setTermsAccepted(false);
    setClientErrors({});
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
          The MDN STACKMART team reviews your code and verifies your revenue before the listing goes
          live — typically within 2 business days. We&apos;ll follow up
          {email ? (
            <>
              {" "}
              at <span className="mono text-primary">{email}</span>
            </>
          ) : (
            " by email"
          )}
          .
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

  const categoryOptions = (categories.data?.data ?? []).map((category) => ({
    value: String(category.id),
    label: category.name,
  }));

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();

          const errors = validate();
          setClientErrors(errors);

          if (Object.keys(errors).length > 0) {
            // Send focus to the summary rather than uploading 100 MB just to be rejected.
            document.getElementById("sell-errors")?.scrollIntoView({ block: "center" });
            return;
          }

          mutation.mutate();
        }}
        className="overflow-hidden rounded-[10px] border border-border bg-canvas"
      >
        {generalError || summary.length > 0 ? (
          <div
            id="sell-errors"
            className="flex scroll-mt-24 flex-col gap-4 border-b border-border p-6 sm:p-8 lg:px-10 lg:pt-10"
          >
            {generalError ? (
              <Alert variant="error" title="We couldn't send your submission">
                {generalError}
              </Alert>
            ) : null}
            <ErrorSummary errors={summary} />
          </div>
        ) : null}

        {/* ── 01 the basics ─────────────────────────────────────────────────── */}
        <div
          id={STEPS[0].id}
          onFocusCapture={() => setActive(0)}
          className="scroll-mt-24 p-6 sm:p-8 lg:p-10"
        >
          <FormSection step={STEPS[0].step} title={STEPS[0].title}>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <Field label="Your name" required error={errorFor("name")}>
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
                error={errorFor("email")}
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

            <div className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <Field
                label="Project name"
                required
                helper="Shown as the public title of your listing."
                error={errorFor("project_name")}
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
                label="Category"
                required
                helper={
                  categories.isError
                    ? "Categories couldn't load — refresh and try again."
                    : "Where buyers will find your listing."
                }
                error={errorFor("category_id")}
              >
                {(props) => (
                  <NativeSelect
                    {...props}
                    value={categoryId}
                    onChange={setCategoryId}
                    disabled={categories.isPending || categories.isError}
                    placeholder={categories.isPending ? "Loading categories…" : "Choose a category…"}
                    options={categoryOptions}
                  />
                )}
              </Field>
            </div>

            <Field
              className="mt-5"
              label="Live URL"
              helper="Optional — the live demo or the repository. We verify ownership after submission."
              error={errorFor("url")}
            >
              {(props) => (
                <AffixInput
                  {...props}
                  name="url"
                  prefix="https://"
                  invalid={Boolean(errorFor("url"))}
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

        {/* ── 02 financials ─────────────────────────────────────────────────── */}
        <div
          id={STEPS[1].id}
          onFocusCapture={() => setActive(1)}
          className="scroll-mt-24 p-6 sm:p-8 lg:p-10"
        >
          <FormSection step={STEPS[1].step} title={STEPS[1].title}>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <Field label="Asking price" required error={errorFor("asking_price_cents")}>
                {(props) => (
                  <div className="flex flex-col gap-[7px]">
                    <MoneyInput
                      {...props}
                      name="asking_price_cents"
                      invalid={Boolean(errorFor("asking_price_cents"))}
                      placeholder="0.00"
                      value={askingPrice}
                      onChange={(event) => setAskingPrice(event.target.value)}
                    />
                    <CentsHint value={askingPrice} />
                  </div>
                )}
              </Field>

              <Field label="Monthly recurring revenue" required error={errorFor("mrr_cents")}>
                {(props) => (
                  <div className="flex flex-col gap-[7px]">
                    <MoneyInput
                      {...props}
                      name="mrr_cents"
                      invalid={Boolean(errorFor("mrr_cents"))}
                      placeholder="0.00"
                      value={mrr}
                      onChange={(event) => setMrr(event.target.value)}
                    />
                    <CentsHint value={mrr} />
                  </div>
                )}
              </Field>
            </div>

            <p className="mono mt-8 mb-1.5 text-[11px] tracking-[0.1em] text-fg-muted uppercase">
              Business metrics · optional
            </p>
            <p className="mb-4 text-[12.5px] leading-[1.45] text-fg-muted">
              Shown on your listing card alongside the MRR above — you don&apos;t need to re-enter it.
            </p>

            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <Field label="Active users" helper="Paying or active accounts." error={errorFor("metrics")}>
                {(props) => (
                  <Input
                    {...props}
                    inputMode="numeric"
                    placeholder="2100"
                    value={metricUsers}
                    onChange={(event) => setMetricUsers(event.target.value)}
                  />
                )}
              </Field>

              <Field label="Monthly traffic" helper="Visits per month.">
                {(props) => (
                  <Input
                    {...props}
                    inputMode="numeric"
                    placeholder="48000"
                    value={metricTraffic}
                    onChange={(event) => setMetricTraffic(event.target.value)}
                  />
                )}
              </Field>
            </div>
          </FormSection>
        </div>

        <div className="h-px bg-border" aria-hidden />

        {/* ── 03 the product ────────────────────────────────────────────────── */}
        <div
          id={STEPS[2].id}
          onFocusCapture={() => setActive(2)}
          className="scroll-mt-24 p-6 sm:p-8 lg:p-10"
        >
          <FormSection step={STEPS[2].step} title={STEPS[2].title}>
            <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
              <Field label="Languages" helper="Press Enter to add.">
                {(props) => (
                  <TagInput
                    {...props}
                    values={languages}
                    onChange={setLanguages}
                    placeholder="TypeScript"
                  />
                )}
              </Field>

              <Field label="Frameworks" helper="Press Enter to add.">
                {(props) => (
                  <TagInput
                    {...props}
                    values={frameworks}
                    onChange={setFrameworks}
                    placeholder="Laravel"
                  />
                )}
              </Field>

              <Field label="Databases" helper="Press Enter to add.">
                {(props) => (
                  <TagInput
                    {...props}
                    values={databases}
                    onChange={setDatabases}
                    placeholder="MySQL"
                  />
                )}
              </Field>
            </div>

            <Field
              className="mt-6"
              label="Product images"
              required
              helper={`Shown in the listing gallery. At least 1, up to ${MAX_IMAGES} · JPG, PNG or WEBP · max 5 MB each.`}
              error={errorFor("images")}
            >
              {() => (
                <ImageGalleryField
                  images={images}
                  onChange={setImages}
                  max={MAX_IMAGES}
                  invalid={Boolean(errorFor("images"))}
                />
              )}
            </Field>

            <Field className="mt-6" label="Description" required error={errorFor("description")}>
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

        <div className="h-px bg-border" aria-hidden />

        {/* ── 04 files & verification ───────────────────────────────────────── */}
        <div
          id={STEPS[3].id}
          onFocusCapture={() => setActive(3)}
          className="scroll-mt-24 p-6 sm:p-8 lg:p-10"
        >
          <FormSection step={STEPS[3].step} title={STEPS[3].title}>
            <Alert variant="info" title="Your files stay private" className="mb-6">
              The code and README are stored privately and are only ever seen by the MDN STACKMART
              review team. The code is delivered to a buyer only after a completed purchase.
            </Alert>

            <Field
              label="Deliverable (.zip)"
              required
              helper="The code the buyer receives. Max 100 MB."
              error={errorFor("deliverable")}
            >
              {() => (
                <SingleFileField
                  file={deliverable}
                  onChange={setDeliverable}
                  accept=".zip,application/zip"
                  hint="ZIP archive · up to 100 MB"
                  invalid={Boolean(errorFor("deliverable"))}
                />
              )}
            </Field>

            <Field
              className="mt-6"
              label="Verification README"
              required
              helper="How our team verifies the listing: repo access, analytics, staging credentials. Max 10 MB."
              error={errorFor("readme")}
            >
              {() => (
                <SingleFileField
                  file={readme}
                  onChange={setReadme}
                  accept=".md,.txt,.pdf,text/markdown,text/plain,application/pdf"
                  hint="MD · TXT · PDF · up to 10 MB"
                  invalid={Boolean(errorFor("readme"))}
                />
              )}
            </Field>
          </FormSection>
        </div>

        <div className="h-px bg-border" aria-hidden />

        {/* ── 05 payout & confirm ───────────────────────────────────────────── */}
        <div
          id={STEPS[4].id}
          onFocusCapture={() => setActive(4)}
          className="scroll-mt-24 p-6 sm:p-8 lg:p-10"
        >
          <FormSection step={STEPS[4].step} title={STEPS[4].title}>
            <p className="mb-5 flex items-start gap-2.5 text-[13px] leading-[1.5] text-fg-muted">
              <ShieldCheck
                className="mt-px size-4 flex-none text-accent"
                strokeWidth={2.2}
                aria-hidden
              />
              This is where MDN STACKMART sends your money after a sale. We take a flat 20%
              commission; you keep 80% of every sale. Your details are encrypted and only ever seen
              by our payouts team.
            </p>

            <Field label="Payout method" required error={errorFor("payout_method")}>
              {() => (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {(
                    [
                      { value: "bank", label: "Bank transfer", hint: "IBAN or account number" },
                      { value: "paypal", label: "PayPal", hint: "Your PayPal email" },
                    ] as const
                  ).map((option) => {
                    const selected = payoutMethod === option.value;
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex cursor-pointer items-start gap-3 rounded-md border p-3.5 transition-colors",
                          selected
                            ? "border-accent bg-tag-bg"
                            : "border-border bg-canvas hover:bg-canvas-subtle",
                        )}
                      >
                        <input
                          type="radio"
                          name="payout_method"
                          value={option.value}
                          checked={selected}
                          onChange={() => setPayoutMethod(option.value)}
                          className="peer sr-only"
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "mt-0.5 flex size-[18px] flex-none items-center justify-center rounded-full border-[1.5px]",
                            selected ? "border-accent" : "border-border",
                          )}
                        >
                          {selected ? <span className="size-2.5 rounded-full bg-accent" /> : null}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-primary">
                            {option.label}
                          </span>
                          <span className="mono block text-[11.5px] text-fg-muted">
                            {option.hint}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </Field>

            <div className="mt-5 grid grid-cols-1 gap-[18px] sm:grid-cols-2">
              <Field
                label="Account holder"
                required
                helper="The name on the account."
                error={errorFor("payout_holder_name")}
              >
                {(props) => (
                  <Input
                    {...props}
                    name="payout_holder_name"
                    autoComplete="name"
                    placeholder="Jordan Ellis"
                    value={payoutHolder}
                    onChange={(event) => setPayoutHolder(event.target.value)}
                  />
                )}
              </Field>

              <Field
                label={payoutMethod === "bank" ? "IBAN / account number" : "PayPal email"}
                required
                helper="Encrypted at rest. Never shown publicly."
                error={errorFor("payout_identifier")}
              >
                {(props) => (
                  <Input
                    {...props}
                    name="payout_identifier"
                    autoComplete="off"
                    placeholder={
                      payoutMethod === "bank" ? "DE89 3704 0044 0532 0130 00" : "you@company.com"
                    }
                    value={payoutIdentifier}
                    onChange={(event) => setPayoutIdentifier(event.target.value)}
                  />
                )}
              </Field>
            </div>

            {payoutMethod === "bank" ? (
              <Field
                className="mt-5"
                label="Bank name"
                helper="Optional — helps us route the transfer."
                error={errorFor("payout_bank_name")}
              >
                {(props) => (
                  <Input
                    {...props}
                    name="payout_bank_name"
                    placeholder="Example Bank"
                    value={payoutBank}
                    onChange={(event) => setPayoutBank(event.target.value)}
                  />
                )}
              </Field>
            ) : null}

            <div className="mt-7 rounded-md border border-border bg-canvas-subtle p-4">
              <Checkbox
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                label={
                  <span className="text-[13.5px] leading-[1.5] text-fg">
                    I confirm all listing information is accurate, I own the code I&apos;m selling,
                    and I accept the MDN STACKMART seller terms (flat 20% commission).
                  </span>
                }
              />
              {errorFor("terms_accepted") ? (
                <p className="mt-2 text-[12.5px] text-danger">{errorFor("terms_accepted")}</p>
              ) : null}
            </div>
          </FormSection>
        </div>

        {/* ── footer bar ────────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-canvas-subtle px-6 py-[22px] sm:px-8 lg:px-10">
          <span className="text-[13px] text-fg-muted">
            No account needed — our team replies by email.
          </span>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={clearForm} disabled={mutation.isPending}>
              Clear form
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {mutation.isPending ? "Uploading…" : "Submit for review"}
            </Button>
          </div>
        </div>
      </form>

      <ProgressRail active={active} onJump={setActive} />
    </div>
  );
}

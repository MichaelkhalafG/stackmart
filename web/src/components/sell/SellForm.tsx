"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, Check, Info, ShieldCheck } from "lucide-react";

import { api, ApiError, toFormData } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  email as emailRule,
  firstError,
  httpsUrl,
  maxLength,
  minLength,
  money,
  required,
  validateFile,
  validateFiles,
  wholeNumber,
} from "@/lib/validation";
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
  "metric_users",
  "metric_traffic",
  "images",
  "description",
  "deliverable",
  "readme",
  "payout_method",
  "payout_holder_name",
  "payout_identifier",
  "payout_bank_name",
  "terms_accepted",
] as const;

type FieldKey = (typeof FIELD_ORDER)[number];

/**
 * Two client fields sit under a nested server key (`metrics[...]`); every other field's client key
 * IS its 422 key (`name`, `email`, `project_name`, `url`, `asking_price_cents`, `mrr_cents`,
 * `description`, …) — that mapping is what `errorFor` walks, so a server 422 always lands on the
 * control that caused it.
 */
const SERVER_KEY: Partial<Record<FieldKey, string>> = {
  metric_users: "metrics.users",
  metric_traffic: "metrics.traffic",
};

const DESCRIPTION_TARGET = 600;
const DESCRIPTION_MIN = 50;

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const README_EXTENSIONS = [".md", ".txt", ".pdf"];

/* ── Client-side validation ──────────────────────────────────────────────────────────────────
   Every rule below is a shared validator from `@/lib/validation`, so the copy matches the rest of
   the app: say what is wrong AND how to fix it. Rules run on BLUR (per field, once touched) and
   again on SUBMIT (all of them) — never on keystroke. A failed submit never reaches the network.  */

/** Everything the rules read — passed explicitly so a file/select `onChange` can validate its NEW
 *  value before React has committed the state update. */
type Values = {
  name: string;
  email: string;
  projectName: string;
  categoryId: string;
  url: string;
  askingPrice: string;
  mrr: string;
  metricUsers: string;
  metricTraffic: string;
  images: File[];
  description: string;
  deliverable: File | null;
  readme: File | null;
  payoutMethod: "bank" | "paypal";
  payoutHolder: string;
  payoutIdentifier: string;
  termsAccepted: boolean;
};

/** The whole form's rules in one place — `Object.keys()` of the result is the submit gate. */
function computeErrors(v: Values): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};

  const set = (field: FieldKey, message: string | undefined) => {
    if (message) errors[field] = message;
  };

  set(
    "name",
    firstError(
      v.name,
      required("Enter your name"),
      maxLength(120, "Name must be 120 characters or fewer"),
    ),
  );
  set("email", firstError(v.email, emailRule()));
  set(
    "project_name",
    firstError(
      v.projectName,
      required("Enter your project name"),
      minLength(2, "Project name must be at least 2 characters"),
      maxLength(120, "Project name must be 120 characters or fewer"),
    ),
  );
  set(
    "category_id",
    firstError(v.categoryId, required("Choose the category buyers will find your listing in")),
  );
  set("url", firstError(v.url, httpsUrl("Enter a valid URL like inboxly.app")));

  // Money is typed in DOLLARS and submitted as integer cents — the rules read dollars.
  set(
    "asking_price_cents",
    firstError(v.askingPrice, money({ min: 0, required: true, label: "Asking price" })),
  );
  set(
    "mrr_cents",
    firstError(
      v.mrr,
      required("Enter your monthly recurring revenue — type 0 if it isn't earning yet"),
      money({ label: "Monthly recurring revenue" }),
    ),
  );

  set("metric_users", firstError(v.metricUsers, wholeNumber("Active users")));
  set("metric_traffic", firstError(v.metricTraffic, wholeNumber("Monthly traffic")));

  set(
    "images",
    v.images.length === 0
      ? "Add at least one product image"
      : validateFiles(v.images, {
          extensions: IMAGE_EXTENSIONS,
          maxBytes: MAX_IMAGE_BYTES,
          maxCount: MAX_IMAGES,
          label: "Product images",
        }),
  );

  set(
    "description",
    firstError(
      v.description,
      required("Add a description so buyers know what they're getting"),
      minLength(
        DESCRIPTION_MIN,
        `Description must be at least ${DESCRIPTION_MIN} characters so buyers know what they're getting`,
      ),
    ),
  );

  set(
    "deliverable",
    v.deliverable
      ? validateFile(v.deliverable, {
          extensions: [".zip"],
          maxBytes: MAX_ZIP_BYTES,
          label: "Deliverable",
        })
      : "Upload the deliverable as a .zip file (max 100 MB)",
  );

  set(
    "readme",
    v.readme
      ? validateFile(v.readme, {
          extensions: README_EXTENSIONS,
          maxBytes: MAX_README_BYTES,
          label: "Verification file",
        })
      : "Upload a verification file (.md, .txt or .pdf) so our team can check your project",
  );

  set(
    "payout_holder_name",
    firstError(v.payoutHolder, required("Enter the name on the payout account")),
  );
  set(
    "payout_identifier",
    v.payoutMethod === "bank"
      ? firstError(
          v.payoutIdentifier,
          required("Enter the IBAN or account number we should transfer to"),
        )
      : firstError(
          v.payoutIdentifier,
          required("Enter the PayPal address we should transfer to"),
          emailRule(),
        ),
  );

  set(
    "terms_accepted",
    v.termsAccepted ? undefined : "Confirm your listing details are accurate before submitting",
  );

  return errors;
}

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
 * each control. Validation (`@/lib/validation`) runs on BLUR per field and again on SUBMIT for all
 * of them — never on keystroke — and mirrors the server rules (required uploads, ≥1 image, file
 * types and sizes), so a failed submit never reaches the network and the seller isn't bounced by a
 * 422 after a long upload. A client rule wins where it fires; otherwise the server's 422 shows,
 * keyed back to its field via `ApiError.errors`.
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

  /** Client rule failures, keyed by field. A field only SHOWS its message once it's `touched`. */
  const [clientErrors, setClientErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  /** Bumped by a blocked submit — the effect below scrolls/focuses the summary once it has rendered. */
  const [summarySignal, setSummarySignal] = useState(0);
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
   * The message a field shows. Precedence:
   *   1. its client rule (submit-time, or blur-time once the field is `touched`) — it fired here,
   *   2. otherwise the server's 422 for that field (`images` also absorbs the per-file keys Laravel
   *      returns: `images.0`, `images.1`, …; the two metric fields map onto `metrics.*`).
   */
  function errorFor(field: FieldKey): string | undefined {
    if (touched[field] && clientErrors[field]) return clientErrors[field];
    if (!serverErrors) return undefined;

    const key = SERVER_KEY[field] ?? field;
    if (serverErrors[key]?.[0]) return serverErrors[key][0];

    const nested = Object.keys(serverErrors).find((name) => name.startsWith(`${key}.`));
    return nested ? serverErrors[nested][0] : undefined;
  }

  const summary = Array.from(
    new Set(FIELD_ORDER.map((field) => errorFor(field)).filter(Boolean) as string[]),
  ).map((message) => ({ message }));

  /** The live values the rules read. */
  function currentValues(): Values {
    return {
      name,
      email,
      projectName,
      categoryId,
      url,
      askingPrice,
      mrr,
      metricUsers,
      metricTraffic,
      images,
      description,
      deliverable,
      readme,
      payoutMethod,
      payoutHolder,
      payoutIdentifier,
      termsAccepted,
    };
  }

  /**
   * Validate ONE field and mark it touched — called from a control's `onBlur` (text) or from its
   * `onChange` for the discrete controls (select, files, checkbox), where `patch` carries the new
   * value React hasn't committed yet. Never called per keystroke.
   */
  function check(field: FieldKey, patch?: Partial<Values>) {
    const message = computeErrors({ ...currentValues(), ...patch })[field];

    setTouched((previous) => ({ ...previous, [field]: true }));
    setClientErrors((previous) => {
      const next = { ...previous };
      if (message) next[field] = message;
      else delete next[field];
      return next;
    });
  }

  // A blocked submit renders the summary in the same commit; focus it once it's in the DOM.
  useEffect(() => {
    if (summarySignal === 0) return;
    const node = document.getElementById("sell-errors");
    node?.scrollIntoView({ block: "center", behavior: "smooth" });
    node?.focus({ preventScroll: true });
  }, [summarySignal]);

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
    setTouched({});
    setSummarySignal(0);
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

          // Submit re-runs every rule — a field the seller never visited still gets checked.
          const errors = computeErrors(currentValues());
          const allTouched: Partial<Record<FieldKey, boolean>> = {};
          FIELD_ORDER.forEach((field) => {
            allTouched[field] = true;
          });

          setClientErrors(errors);
          setTouched(allTouched);

          if (Object.keys(errors).length > 0) {
            // Never call the API: send the seller to the summary rather than uploading 100 MB just
            // to be rejected. Any stale 422 from an earlier attempt goes with it.
            mutation.reset();
            setSummarySignal((signal) => signal + 1);
            return;
          }

          mutation.mutate();
        }}
        className="overflow-hidden rounded-[10px] border border-border bg-canvas"
      >
        {generalError || summary.length > 0 ? (
          <div
            id="sell-errors"
            tabIndex={-1}
            className="flex scroll-mt-24 flex-col gap-4 border-b border-border p-6 outline-none sm:p-8 lg:px-10 lg:pt-10"
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
              <Field
                label="Your name"
                required
                helper="The person our review team will deal with. Not shown on your listing."
                error={errorFor("name")}
              >
                {(props) => (
                  <Input
                    {...props}
                    name="name"
                    autoComplete="name"
                    placeholder="Jordan Ellis"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    onBlur={() => check("name")}
                  />
                )}
              </Field>

              <Field
                label="Email"
                required
                helper="We'll only use this to follow up about your submission — and to send proof of payout after a sale."
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
                    onBlur={() => check("email")}
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
                    onBlur={() => check("project_name")}
                  />
                )}
              </Field>

              <Field
                label="Category"
                required
                helper={
                  categories.isError
                    ? "Categories couldn't load — refresh and try again."
                    : "Where buyers will find your listing. Pick the closest fit — our team can move it."
                }
                error={errorFor("category_id")}
              >
                {(props) => (
                  <NativeSelect
                    {...props}
                    value={categoryId}
                    onChange={(value) => {
                      setCategoryId(value);
                      check("category_id", { categoryId: value });
                    }}
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
              helper="Optional — the live demo or the repository. We verify ownership after you submit."
              tooltip="Type the host only — we add https:// for you. After you submit, our team checks that the site or repo really is yours (a DNS record, a file we ask you to upload, or repo access) before the listing goes live."
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
                  onBlur={() => check("url")}
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
              <Field
                label="Asking price"
                required
                helper="In USD. This is the price buyers pay to acquire the product."
                tooltip="Type the amount in DOLLARS — 12000 means $12,000, not $120. We convert it to cents for you and show the exact figure we submit under the box."
                error={errorFor("asking_price_cents")}
              >
                {(props) => (
                  <div className="flex flex-col gap-[7px]">
                    <MoneyInput
                      {...props}
                      name="asking_price_cents"
                      invalid={Boolean(errorFor("asking_price_cents"))}
                      placeholder="0.00"
                      value={askingPrice}
                      onChange={(event) => setAskingPrice(event.target.value)}
                      onBlur={() => check("asking_price_cents")}
                    />
                    <CentsHint value={askingPrice} />
                  </div>
                )}
              </Field>

              <Field
                label="Monthly recurring revenue"
                required
                helper="Monthly recurring revenue, if any. Enter 0 if it isn't earning yet."
                tooltip="In DOLLARS per month, like the asking price. A pre-revenue product is fine — enter 0 and we simply won't show an MRR figure on your listing card. Whatever you enter here is what our team verifies."
                error={errorFor("mrr_cents")}
              >
                {(props) => (
                  <div className="flex flex-col gap-[7px]">
                    <MoneyInput
                      {...props}
                      name="mrr_cents"
                      invalid={Boolean(errorFor("mrr_cents"))}
                      placeholder="0.00"
                      value={mrr}
                      onChange={(event) => setMrr(event.target.value)}
                      onBlur={() => check("mrr_cents")}
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
              <Field
                label="Active users"
                helper="Paying or active accounts — a whole number, no commas."
                error={errorFor("metric_users")}
              >
                {(props) => (
                  <Input
                    {...props}
                    inputMode="numeric"
                    placeholder="2100"
                    value={metricUsers}
                    onChange={(event) => setMetricUsers(event.target.value)}
                    onBlur={() => check("metric_users")}
                  />
                )}
              </Field>

              <Field
                label="Monthly traffic"
                helper="Visits per month — a whole number, no commas."
                error={errorFor("metric_traffic")}
              >
                {(props) => (
                  <Input
                    {...props}
                    inputMode="numeric"
                    placeholder="48000"
                    value={metricTraffic}
                    onChange={(event) => setMetricTraffic(event.target.value)}
                    onBlur={() => check("metric_traffic")}
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
              helper={`Screenshots buyers see on your listing. At least 1, up to ${MAX_IMAGES} · JPG, PNG or WEBP · max 5 MB each.`}
              tooltip="The gallery on your listing page — the first image is the card thumbnail buyers see in the marketplace. Show the real product: the dashboard, the key screens, not a logo."
              error={errorFor("images")}
            >
              {() => (
                <ImageGalleryField
                  images={images}
                  onChange={(next) => {
                    setImages(next);
                    check("images", { images: next });
                  }}
                  max={MAX_IMAGES}
                  invalid={Boolean(errorFor("images"))}
                />
              )}
            </Field>

            <Field
              className="mt-6"
              label="Description"
              required
              helper={`What it does, who it's for, what's included in the sale. At least ${DESCRIPTION_MIN} characters — around ${DESCRIPTION_TARGET} reads best.`}
              labelSuffix={
                <span className="mono text-xs text-fg-muted">
                  {description.length} / {DESCRIPTION_TARGET}
                </span>
              }
              error={errorFor("description")}
            >
              {(props) => (
                <Textarea
                  {...props}
                  name="description"
                  rows={5}
                  placeholder="What does it do, who is it for, what's included in the sale?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  onBlur={() => check("description")}
                />
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
              helper="The full source code the buyer receives after purchase. ZIP, max 100 MB."
              tooltip="This exact archive is what a buyer downloads the moment they pay, so zip up everything they need to run the product: source, migrations, env example, setup notes. It stays private until a sale completes."
              error={errorFor("deliverable")}
            >
              {() => (
                <SingleFileField
                  file={deliverable}
                  onChange={(file) => {
                    setDeliverable(file);
                    check("deliverable", { deliverable: file });
                  }}
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
              helper="Explain how our team can verify your project — repo access, analytics screenshots, staging credentials, how to run it. MD, TXT or PDF, max 10 MB."
              tooltip="Verification access = whatever proves the product and its numbers are real and yours: read access to the repo, a screenshot of the analytics or revenue dashboard, staging logins, and the steps to run it locally. Reviewers never publish any of it."
              error={errorFor("readme")}
            >
              {() => (
                <SingleFileField
                  file={readme}
                  onChange={(file) => {
                    setReadme(file);
                    check("readme", { readme: file });
                  }}
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
              Where we send your money after a sale. MDN STACKMART takes a flat 20% commission and
              transfers the remaining 80% to the details below — the same rate for every seller.
              Kept private: admin-only, never shown on your listing.
            </p>

            <Field
              label="Payout method"
              required
              tooltip="On every sale MDN STACKMART keeps a flat 20% commission and transfers the other 80% to these details — one rate for everyone, no plans and no tiers. We email you proof of the transfer once it's sent."
              error={errorFor("payout_method")}
            >
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
                          onChange={() => {
                            setPayoutMethod(option.value);
                            // The identifier's rule depends on the method (IBAN vs email) — re-check
                            // it, but only if the seller has already been there.
                            if (touched.payout_identifier) {
                              check("payout_identifier", { payoutMethod: option.value });
                            }
                          }}
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
                helper="The exact name on the account — a mismatch delays the transfer."
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
                    onBlur={() => check("payout_holder_name")}
                  />
                )}
              </Field>

              <Field
                label={payoutMethod === "bank" ? "IBAN / account number" : "PayPal email"}
                required
                helper={
                  payoutMethod === "bank"
                    ? "The account we transfer your 80% to. Kept private — admin-only, never shown on your listing."
                    : "The PayPal address we transfer your 80% to. Kept private — admin-only, never shown on your listing."
                }
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
                    onBlur={() => check("payout_identifier")}
                  />
                )}
              </Field>
            </div>

            {payoutMethod === "bank" ? (
              <Field
                className="mt-5"
                label="Bank name"
                helper="Optional — helps us route the transfer faster."
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
                aria-invalid={Boolean(errorFor("terms_accepted"))}
                aria-describedby={errorFor("terms_accepted") ? "terms-error" : undefined}
                onChange={(event) => {
                  setTermsAccepted(event.target.checked);
                  check("terms_accepted", { termsAccepted: event.target.checked });
                }}
                label={
                  <span className="text-[13.5px] leading-[1.5] text-fg">
                    I confirm all listing information is accurate, I own the code I&apos;m selling,
                    and I accept the MDN STACKMART seller terms (flat 20% commission).
                  </span>
                }
              />
              {errorFor("terms_accepted") ? (
                <p
                  id="terms-error"
                  className="mt-2 flex items-center gap-1.5 text-[12.5px] text-danger"
                >
                  <AlertCircle className="size-[13px] shrink-0" strokeWidth={2.4} aria-hidden />
                  {errorFor("terms_accepted")}
                </p>
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

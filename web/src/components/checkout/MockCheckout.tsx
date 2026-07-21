"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, Check, FileArchive, KeyRound, Lock, ShieldCheck } from "lucide-react";

import { api, ApiError } from "@/lib/api";
import { SHOW_SELL } from "@/lib/config";
import { formatPrice } from "@/components/product/MarketplaceCard";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Shimmer } from "@/components/states/LoadingState";
import { cn } from "@/lib/utils";
import type { OrderDetail } from "@/components/checkout/CheckoutSuccess";

/**
 * The checkout page (`/checkout/mock?ref=`) — a full-page, branded payment screen.
 *
 * Payments run on FakePaymentProvider (no real gateway, and none is named here). "Complete purchase"
 * simulates a SUCCESSFUL payment: it POSTs the PaymentEvent-shaped payload to the REAL
 * `POST /api/webhooks/payment` — the same pipeline a live provider would drive — which runs the
 * genuine webhook → FulfillOrder path (license minted, delivery email sent), then routes to the
 * invoice. That simulation logic is UNCHANGED from the original dev mock.
 *
 * What is new: the order summary (fetched from the frozen `GET /api/orders/{ref}`), a plain-English
 * terms/privacy summary, and a REQUIRED consent checkbox that gates the pay button.
 *
 * LAYOUT. From `lg` up: two columns — the "what you receive" + terms column, and a sticky order
 * summary / pay rail on the right. Below `lg` the grid collapses to one column, and the summary rail
 * is pulled ABOVE the long terms copy (`order-first lg:order-none`, CSS only — the JSX order, and
 * therefore the DOM/tab order on desktop, is unchanged). Otherwise a phone user scrolls past two
 * screens of prose before they ever see the price or the pay button. The button's "you haven't
 * agreed yet" affordance — it scrolls down to `#terms-consent` and flashes it — carries the flow the
 * other way, so the price is up top and the consent is one tap away.
 */
export function MockCheckout() {
  const router = useRouter();
  const ref = useSearchParams().get("ref") ?? "";
  const [pending, setPending] = useState<null | "paid" | "failed">(null);
  const [error, setError] = useState<string | undefined>();
  const [agreed, setAgreed] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);

  // The terms live further down the page than the pay button, so the button can look "dead" with no
  // explanation. Clicking it without consent now SCROLLS to the terms and flashes them, and a hint
  // under the button says so up front.
  const termsRef = useRef<HTMLElement>(null);
  const [highlightTerms, setHighlightTerms] = useState(false);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (flashTimer.current) clearTimeout(flashTimer.current);
    },
    [],
  );

  function sendToTerms() {
    setShowConsentError(true);
    setHighlightTerms(true);
    termsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setHighlightTerms(false), 1800);
  }

  // The pending order was created at checkout — look it up by provider_reference for the summary.
  const query = useQuery({
    queryKey: ["order", ref],
    queryFn: () => api<{ data: OrderDetail }>(`/orders/${encodeURIComponent(ref)}`),
    enabled: ref !== "",
    retry: 1,
  });
  const order = query.data?.data;

  /** UNCHANGED simulation path: webhook → FulfillOrder → invoice. */
  async function simulate(status: "paid" | "failed") {
    if (!ref) {
      setError("Missing checkout reference.");
      return;
    }
    if (status === "paid" && !agreed) {
      sendToTerms(); // scroll to the checkbox + flash it, instead of failing silently
      return;
    }

    setError(undefined);
    setPending(status);
    try {
      await api("/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({ ref, status }),
      });
      router.push(
        status === "paid" ? `/checkout/success?ref=${encodeURIComponent(ref)}` : "/checkout/cancel",
      );
    } catch (err) {
      setPending(null);
      setError(err instanceof ApiError ? err.message : "Simulation failed. Please try again.");
    }
  }

  return (
    // Full page container width — no narrow centred column, no oversized side gutters.
    <div className="w-full">
      {/* The navbar already carries the logo — this row is just the secure-checkout chip. */}
      <span className="mono inline-flex items-center gap-2 rounded-md border border-border bg-canvas px-2.5 py-1.5 text-[11px] text-fg-muted">
        <Lock className="size-3.5 text-accent" strokeWidth={2.4} aria-hidden />
        secure checkout
      </span>

      <h1 className="mt-4 text-[clamp(1.9rem,3.2vw,2.6rem)] leading-tight font-bold tracking-[-0.02em] text-primary">
        Complete your purchase
      </h1>
      <p className="mt-2.5 max-w-[60ch] text-[15px] leading-[1.55] text-fg-muted">
        Review what you&rsquo;re buying, agree to the terms, and your license key and source-code ZIP
        are released immediately.
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        {/* ── Left: what you're buying + terms ──────────────────────────── */}
        <div className="flex flex-col gap-6">
          {/* What you receive */}
          <section className="rounded-xl border border-border bg-canvas p-6 sm:p-7">
            <h2 className="text-[1.15rem] font-bold text-primary">What you receive</h2>

            <ul className="mt-5 flex flex-col gap-4">
              {[
                {
                  icon: KeyRound,
                  title: "A license key",
                  body: "Issued the moment payment is confirmed, shown on your invoice and emailed to you. It's your proof of a paid copy — and you need it to download.",
                },
                {
                  icon: FileArchive,
                  title: "The full source-code ZIP",
                  body: SHOW_SELL
                    ? "The complete deliverable the seller packaged. Served privately to your account — never a public link."
                    : "The complete deliverable packaged with this listing. Served privately to your account — never a public link.",
                },
                {
                  icon: ShieldCheck,
                  title: "A vetted product",
                  body: "Our team reviewed the code, the README and the metrics before this listing went live.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <li key={title} className="flex gap-3.5">
                  <span
                    aria-hidden
                    className="mt-0.5 flex size-9 flex-none items-center justify-center rounded-lg bg-tag-bg text-accent"
                  >
                    <Icon className="size-[18px]" strokeWidth={2.2} />
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-primary">{title}</span>
                    <span className="mt-0.5 block text-[14px] leading-[1.55] text-fg-muted">
                      {body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Terms & privacy summary + required consent */}
          <section
            id="terms-consent"
            ref={termsRef}
            className={cn(
              "scroll-mt-28 rounded-xl border bg-canvas p-6 transition-[box-shadow,border-color] duration-300 sm:p-7",
              highlightTerms
                ? "border-accent ring-[3px] ring-accent/30"
                : showConsentError
                  ? "border-danger"
                  : "border-border",
            )}
          >
            <h2 className="text-[1.15rem] font-bold text-primary">
              Before you pay — terms &amp; privacy
            </h2>

            <ul className="mt-4 flex flex-col gap-2.5">
              {[
                "You are buying a licensed copy of the product's source code, delivered digitally.",
                "Delivery is immediate: once payment is confirmed, the code is yours to download.",
                "Because the source code is delivered in full on payment, sales are final — we can't un-deliver code. If delivery genuinely fails, we'll make it right.",
                "Your license key is personal to your account. Keep it safe — it's required for every download.",
                "We store only what's needed to deliver and support your purchase, and never sell your data.",
              ].map((line) => (
                <li key={line} className="flex gap-2.5 text-[14px] leading-[1.55] text-fg">
                  <Check className="mt-1 size-3.5 flex-none text-accent" strokeWidth={3} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-border pt-5">
              <Checkbox
                // On a phone the consent label wraps to 2–3 lines; top-align the box against the
                // first line rather than the middle of the block. `max-lg:` only — desktop, where
                // the label is a single line, is byte-for-byte the same.
                className="max-lg:items-start"
                checked={agreed}
                onChange={(event) => {
                  setAgreed(event.target.checked);
                  if (event.target.checked) setShowConsentError(false);
                }}
                label={
                  <span className="text-[14px] leading-[1.5]">
                    I agree to the{" "}
                    <Link href="/terms" className="font-semibold text-accent hover:underline">
                      Terms &amp; Conditions
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="font-semibold text-accent hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                }
              />

              {showConsentError ? (
                <p role="alert" className="mt-3 text-[12.5px] text-danger">
                  Please agree to the Terms &amp; Conditions and Privacy Policy to continue.
                </p>
              ) : null}
            </div>
          </section>
        </div>

        {/* ── Right: order summary + pay ────────────────────────────────── */}
        {/* Below `lg` this rail is hoisted above the terms (visual order only). At `lg` the order is
            reset so the grid places it back in the second column, sticky, exactly as before. */}
        <aside className="order-first lg:sticky lg:top-24 lg:order-none">
          <div className="panel-navy relative overflow-hidden rounded-xl">
            <div className="motif-grid absolute inset-0" aria-hidden />

            <div className="relative p-6 sm:p-7">
              <h2 className="mono text-[11px] font-semibold tracking-[0.1em] text-tag-bg/70 uppercase">
                Order summary
              </h2>

              {query.isPending ? (
                <div className="mt-5 flex flex-col gap-3">
                  <Shimmer className="h-6 w-40 bg-canvas/10" />
                  <Shimmer className="h-8 w-28 bg-canvas/10" delay="0.1s" />
                </div>
              ) : order ? (
                <>
                  <p className="mt-4 text-[1.25rem] font-bold text-canvas">{order.product.title}</p>
                  <p className="mono mt-1 text-[12px] text-canvas/60">
                    one product · one order · no cart
                  </p>

                  <div className="mt-6 flex items-baseline justify-between border-t border-tag-bg/20 pt-5">
                    <span className="text-[14px] text-canvas/70">Total due</span>
                    <span className="mono text-[1.6rem] font-bold tracking-[-0.02em] text-canvas">
                      {formatPrice(order.amount_cents, order.currency)}
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-4 text-[14px] text-canvas/70">
                  We couldn&rsquo;t load this order. Head back to the listing and try again.
                </p>
              )}

              <div className="mono mt-5 truncate rounded-lg border border-tag-bg/20 bg-primary-emphasis/55 px-3 py-2 text-[11px] text-tag-bg">
                ref {ref || "—"}
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {/*
              Deliberately NOT `disabled` when consent is missing: a disabled button can't be
              clicked, so the user gets no explanation for why nothing happens. It stays clickable,
              is announced as unavailable (`aria-disabled`), and clicking it scrolls to the terms and
              flashes them. Payment is still gated — `simulate()` refuses without consent.
            */}
            <Button
              size="lg"
              block
              loading={pending === "paid"}
              disabled={pending !== null}
              aria-disabled={!agreed}
              className={cn(!agreed && "opacity-60")}
              onClick={() => simulate("paid")}
            >
              {pending === "paid" ? "Completing your purchase…" : "Complete purchase"}
            </Button>

            {!agreed ? (
              <button
                type="button"
                onClick={sendToTerms}
                className="flex min-h-11 items-center justify-center gap-1.5 text-center text-[13px] font-semibold text-accent hover:underline lg:min-h-0"
              >
                <ArrowDown className="size-4 shrink-0" strokeWidth={2.6} aria-hidden />
                Scroll down and agree to the Terms &amp; Privacy to continue
              </button>
            ) : null}

            {error ? (
              <Alert variant="error" className="mt-1">
                {error}
              </Alert>
            ) : null}

            {/* Dev-only escape hatch — the failure path, kept for testing the cancel flow. */}
            <button
              type="button"
              onClick={() => simulate("failed")}
              disabled={pending !== null}
              className="mono mt-1 flex min-h-11 items-center justify-center text-center text-[11px] text-fg-muted underline decoration-dotted underline-offset-4 hover:text-danger disabled:opacity-50 lg:min-h-0"
            >
              dev: simulate a failed payment
            </button>

            <p className="mono mt-2 text-center text-[10.5px] leading-[1.5] text-fg-muted">
              dev build — no gateway connected. Completing this order runs the real fulfillment
              pipeline, but no money moves.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

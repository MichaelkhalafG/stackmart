"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, Clock, Mail, PackageOpen } from "lucide-react";

import { api } from "@/lib/api";
import { formatPrice } from "@/components/product/MarketplaceCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Shimmer } from "@/components/states/LoadingState";
import { DownloadButton } from "@/components/orders/DownloadButton";
import { CopyButton } from "@/components/orders/CopyButton";
import { cn } from "@/lib/utils";

/**
 * One order as returned by the FROZEN `GET /api/orders/{id}` contract (12_API_Specification.md
 * §Buyer — resolves by id OR provider_reference).
 */
export type OrderDetail = {
  id: number;
  product: { title: string; slug: string };
  amount_cents: number;
  currency: string;
  status: string;
  provider_reference: string;
  license_key: string | null;
  download_count: number;
  delivered_at: string | null;
  /** Computed download-availability signal (optional in the frozen shape). */
  can_download?: boolean;
};

/**
 * CheckoutSuccess — the `/checkout/success?ref=` view. Looks up the order by its
 * provider_reference and, once delivered, presents the license key and the download.
 *
 * The data flow is UNCHANGED (same query, same frozen contract, same states). This is the branded
 * treatment: the MDN STACKMART lockup, a confirmation mark that pops in once (`.anim-pop`, disabled
 * under prefers-reduced-motion), the license key in a navy terminal panel (`.panel-navy` +
 * `.motif-grid`) in IBM Plex Mono with a copy button, then the solid-navy download CTA.
 */
export function CheckoutSuccess() {
  const ref = useSearchParams().get("ref") ?? "";

  const query = useQuery({
    queryKey: ["order", ref],
    queryFn: () => api<{ data: OrderDetail }>(`/orders/${encodeURIComponent(ref)}`),
    enabled: ref !== "",
    retry: 1,
  });

  const order = query.data?.data;

  if (!ref) {
    return (
      <StateCard
        icon={<PackageOpen className="size-7" />}
        title="No order reference"
        description="This page needs a checkout reference. Head back to the marketplace to browse products."
        action={
          <Link href="/marketplace" className={cn(buttonVariants({ variant: "outline" }))}>
            Back to marketplace
          </Link>
        }
      />
    );
  }

  if (query.isPending) {
    return (
      // Mirrors the delivered layout's width + two columns, so the page doesn't jump.
      <div className="w-full" aria-busy="true" aria-label="Loading your order">
        <Shimmer className="h-6 w-40" />
        <Shimmer className="mt-8 h-12 w-full max-w-[520px]" delay="0.08s" />

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6">
            <Shimmer className="h-44 w-full rounded-xl" delay="0.16s" />
            <Shimmer className="h-32 w-full rounded-xl" delay="0.24s" />
          </div>
          <Shimmer className="h-72 w-full rounded-xl" delay="0.2s" />
        </div>
      </div>
    );
  }

  if (query.isError || !order) {
    return (
      <StateCard
        icon={<Clock className="size-7" />}
        title="We couldn't load your order yet"
        description="Your payment may still be processing. Refresh in a moment, or check your purchases page."
        action={
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => query.refetch()}>
              Refresh
            </Button>
            <Link
              href="/account/purchases"
              className={cn(buttonVariants({ variant: "ghost" }))}
            >
              View purchases
            </Link>
          </div>
        }
      />
    );
  }

  if (order.status !== "paid" || !order.license_key) {
    return (
      <StateCard
        icon={<Clock className="size-7" />}
        title="Processing your order"
        description="Your payment is being confirmed. Your license key and download will appear here as soon as it's ready."
        action={
          <Button variant="outline" onClick={() => query.refetch()}>
            Refresh
          </Button>
        }
      />
    );
  }

  /* ── Delivered ─────────────────────────────────────────────────────────── */
  return (
    // Full container width — the invoice is a two-column composition, not a narrow centred column.
    <div className="w-full">
      {/* The navbar already carries the logo — this row is just the delivery status chip. */}
      <span className="mono inline-flex items-center gap-2 rounded-md border border-border bg-canvas px-2.5 py-1.5 text-[11px] text-fg-muted">
        <Mail className="size-3.5 text-accent" strokeWidth={2.4} aria-hidden />
        emailed to you
      </span>

      {/* Header — the celebratory mark sits inline with the headline, so the width is used. */}
      <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <span
          aria-hidden
          className="anim-pop flex size-16 flex-none items-center justify-center rounded-full bg-tag-bg text-accent"
        >
          <Check className="size-8" strokeWidth={3} />
        </span>

        <div>
          <h1 className="text-[clamp(1.7rem,3.2vw,2.4rem)] leading-tight font-bold tracking-[-0.02em] text-primary">
            Thank you — your purchase is ready
          </h1>
          <p className="mt-2 text-[15px] text-fg-muted">
            <span className="font-semibold text-primary">{order.product.title}</span> ·{" "}
            <span className="mono">{formatPrice(order.amount_cents, order.currency)}</span>
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start">
        {/* ── Left: the license key + the download CTA ─────────────────────── */}
        <div className="flex flex-col gap-6">
          <div className="panel-navy relative overflow-hidden rounded-xl">
            <div className="motif-grid absolute inset-0" aria-hidden />

            <div className="relative p-6 sm:p-8">
              <div className="mono flex items-center gap-2 text-[11px] tracking-[0.08em] text-tag-bg/70 uppercase">
                <span className="anim-pulse-dot size-1.5 rounded-full bg-tag-bg" aria-hidden />
                Your license key
              </div>

              {/*
                The key is the one string on this page that cannot be allowed to overflow: 19 mono
                characters at wide tracking do not fit beside the copy button at 360px. It breaks
                (`break-all`) and its size + tracking scale down on phones; from `sm` up the clamp
                and the 0.08em tracking are exactly as before.
              */}
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-tag-bg/20 bg-primary-emphasis/55 px-3 py-3.5 sm:gap-3 sm:px-4 sm:py-4">
                <p className="mono min-w-0 flex-1 break-all text-[0.95rem] font-semibold tracking-[0.04em] text-canvas sm:text-[clamp(1.05rem,2.2vw,1.5rem)] sm:tracking-[0.08em]">
                  {order.license_key}
                </p>
                <div className="flex-none [&>button]:size-11 sm:[&>button]:size-9">
                  <CopyButton value={order.license_key} label="Copy license key" />
                </div>
              </div>

              <p className="mono mt-3.5 flex items-center gap-1.5 text-[11.5px] text-tag-bg/60">
                <span className="text-tag-bg">$</span> proof of a paid copy — keep it safe
                <span
                  aria-hidden
                  className="anim-blink inline-block h-[11px] w-[6px] bg-tag-bg align-middle"
                />
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-6 sm:p-7">
            <DownloadButton orderId={order.id} size="lg" label="Download your product" />
            <p className="mt-3 text-center text-[12.5px] leading-[1.5] text-fg-muted">
              You&rsquo;ll be asked for your license key — it protects your source code even if your
              session is stolen.
            </p>

            <Link
              href="/account/purchases"
              className={cn(buttonVariants({ variant: "ghost" }), "mt-2 w-full")}
            >
              Go to your purchases
            </Link>
          </div>
        </div>

        {/* ── Right: the invoice itself ────────────────────────────────────── */}
        <aside className="rounded-xl border border-border bg-canvas p-6 sm:p-7">
          <h2 className="mono text-[11px] font-semibold tracking-[0.1em] text-fg-muted uppercase">
            Invoice
          </h2>

          <dl className="mt-5 flex flex-col text-[14px]">
            {[
              { term: "Product", value: order.product.title, mono: false },
              {
                term: "Amount paid",
                value: formatPrice(order.amount_cents, order.currency),
                mono: true,
              },
              { term: "Date", value: formatDate(order.delivered_at), mono: true },
              { term: "Order", value: `#${order.id}`, mono: true },
              { term: "Status", value: "Paid · delivered", mono: false },
            ].map((row) => (
              <div
                key={row.term}
                className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-b-0"
              >
                <dt className="text-fg-muted">{row.term}</dt>
                <dd
                  className={cn(
                    "truncate text-right font-semibold text-primary",
                    row.mono && "mono text-[13px] font-normal",
                  )}
                >
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mono mt-5 truncate rounded-lg border border-border bg-canvas-subtle px-3 py-2.5 text-[11px] text-fg-muted">
            ref {order.provider_reference}
          </div>

          <p className="mt-5 flex items-start gap-2 text-[12.5px] leading-[1.5] text-fg-muted">
            <Mail className="mt-0.5 size-3.5 flex-none text-accent" strokeWidth={2.2} aria-hidden />
            A copy of this invoice and your license key has been emailed to you.
          </p>
        </aside>
      </div>
    </div>
  );
}

/** Invoice date — falls back to today when the order carries no delivery timestamp. */
function formatDate(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

/** The shared non-delivered state (no ref / still processing / lookup failed). */
function StateCard({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col items-center rounded-xl border border-border bg-canvas p-6 text-center sm:p-10">
      <span
        aria-hidden
        className="flex size-14 items-center justify-center rounded-lg bg-tag-bg text-accent"
      >
        {icon}
      </span>
      <h1 className="mt-5 text-[1.35rem] font-bold text-primary">{title}</h1>
      <p className="mt-2 max-w-[38ch] text-[14.5px] leading-[1.55] text-fg-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

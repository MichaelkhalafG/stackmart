"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Clock, PackageOpen } from "lucide-react";

import { api } from "@/lib/api";
import { formatPrice } from "@/components/product/MarketplaceCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DownloadButton } from "@/components/orders/DownloadButton";

/**
 * One order as returned by the FROZEN `GET /api/orders/{id}` contract (12_API_Specification.md
 * §Buyer — resolves by id OR provider_reference). This is orders-read API (J4.01,
 * CROSS-BRANCH): the success page goes fully live once it merges at end-of-day-4.
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
  /** computed download-availability signal (optional in the frozen shape). */
  can_download?: boolean;
};

/**
 * CheckoutSuccess (S4.05) — the `/checkout/success?ref=` view. Looks up the order by its
 * provider_reference and, once delivered, shows the license key (mono) + a download. The payment
 * is confirmed synchronously by the mock, so the order is normally already paid on arrival;
 * pending/error states are handled gracefully.
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

  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="gap-0 p-0">
        <div className="flex flex-col gap-4 p-6">
          {!ref ? (
            <StateBlock
              icon={<PackageOpen className="size-8" />}
              title="No order reference"
              description="This page needs a checkout reference. Head back to the marketplace to browse products."
              action={<LinkAction href="/marketplace">Back to marketplace</LinkAction>}
            />
          ) : query.isPending ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="mx-auto h-6 w-48" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : query.isError || !order ? (
            <StateBlock
              icon={<Clock className="size-8" />}
              title="We couldn't load your order yet"
              description="Your payment may still be processing. Refresh in a moment, or check your purchases page."
              action={
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => query.refetch()}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Refresh
                  </button>
                  <LinkAction href="/account/purchases">View purchases</LinkAction>
                </div>
              }
            />
          ) : order.status === "paid" && order.license_key ? (
            <>
              <div className="flex flex-col items-center gap-2 text-center">
                <CheckCircle2 className="size-9 text-accent" aria-hidden />
                <h1 className="text-lg font-semibold text-fg">Thank you — your purchase is ready</h1>
                <p className="text-sm text-fg-muted">
                  {order.product.title} · {formatPrice(order.amount_cents, order.currency)}
                </p>
              </div>

              <div className="rounded-md border border-border bg-canvas-subtle p-4">
                <p className="text-xs text-fg-muted">Your license key</p>
                <p className="mono mt-1 break-all text-sm font-semibold text-fg">{order.license_key}</p>
              </div>

              <DownloadButton
                orderId={order.id}
                label="Download your product"
                filename={`${order.product.slug}.zip`}
              />

              <Link
                href="/account/purchases"
                className="text-center text-sm font-medium text-accent hover:underline"
              >
                Go to your purchases
              </Link>
            </>
          ) : (
            <StateBlock
              icon={<Clock className="size-8" />}
              title="Processing your order"
              description="Your payment is being confirmed. Your license key and download will appear here as soon as it's ready."
              action={
                <button
                  type="button"
                  onClick={() => query.refetch()}
                  className="text-sm font-medium text-accent hover:underline"
                >
                  Refresh
                </button>
              }
            />
          )}
        </div>
      </Card>
    </div>
  );
}

function StateBlock({
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
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <div className="text-fg-muted">{icon}</div>
      <h1 className="text-base font-semibold text-fg">{title}</h1>
      <p className="max-w-xs text-sm text-fg-muted">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </div>
  );
}

function LinkAction({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-accent hover:underline">
      {children}
    </Link>
  );
}

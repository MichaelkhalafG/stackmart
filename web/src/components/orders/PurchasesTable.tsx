"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PackageOpen, Receipt } from "lucide-react";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/components/product/MarketplaceCard";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Blankslate } from "@/components/marketplace/Blankslate";
import { CopyButton } from "@/components/orders/CopyButton";
import { DownloadButton } from "@/components/orders/DownloadButton";
import type { Order } from "@/components/orders/types";

/** Status → shadcn Badge variant (no green in the MDN palette). */
const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  paid: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline",
};

/**
 * PurchasesTable (S4.06) — the buyer's real orders. Fetches the FROZEN `GET /api/orders`
 * (`{data:[Order]}`) via TanStack Query + lib/api.ts (Bearer attached).
 *
 * ONE query, TWO presentations of the same `orders` array — never two fetches:
 *   - phones (`md:hidden`): a stacked card list (`OrderCard`), because a 5-column table holding a
 *     19-character mono license key is a sideways-scrolling strip at 360px;
 *   - `md`+ (`hidden md:block`): the original shadcn Table, unchanged.
 * Loading/error/empty are shared by both. Client component — rendered inside the S3.03 (account)
 * guard. Consumes the orders-read API (cross-branch) → fully live after day-4 merges.
 */
export function PurchasesTable() {
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: () => api<{ data: Order[] }>("/orders"),
  });

  const orders = query.data?.data ?? [];

  if (query.isPending) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (query.isError) {
    return (
      <Blankslate
        icon={<PackageOpen className="size-8" />}
        title="Couldn't load your purchases"
        description="The orders service didn't respond. Check your connection and try again."
        action={
          <button
            type="button"
            onClick={() => query.refetch()}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Retry
          </button>
        }
      />
    );
  }

  if (orders.length === 0) {
    return (
      <Blankslate
        icon={<Receipt className="size-8" />}
        title="No purchases yet"
        description="Once you buy a product, it'll appear here with its license key and download."
        action={
          <Link href="/marketplace" className={cn(buttonVariants({ variant: "outline" }))}>
            Browse the marketplace
          </Link>
        }
      />
    );
  }

  return (
    <>
      {/* ── Phones: one card per order — same `orders` array, no second query. ── */}
      <ul className="flex flex-col gap-3 md:hidden">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>

      {/* ── md+: the original table, untouched. ── */}
      <div className="hidden rounded-md border border-border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>License key</TableHead>
              <TableHead className="text-right">Download</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Link
                    href={`/listing/${order.product.slug}`}
                    className="font-medium text-fg hover:text-accent"
                  >
                    {order.product.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "outline"} className="capitalize">
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="mono">
                  {formatPrice(order.amount_cents, order.currency)}
                </TableCell>
                <TableCell>
                  {order.license_key ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="mono text-xs">{order.license_key}</span>
                      <CopyButton value={order.license_key} label="Copy license key" />
                    </span>
                  ) : (
                    <span className="text-fg-muted">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {order.status === "paid" ? (
                    <div className="flex justify-end">
                      {/* Goes to the license-gated download page — never an immediate download. */}
                      <DownloadButton orderId={order.id} label="Download" size="sm" />
                    </div>
                  ) : (
                    <span className="text-fg-muted">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

/**
 * One purchase as a card — the phone-width presentation of a single `TableRow`. Same data, same
 * `DownloadButton` / `CopyButton` / `Badge` / `formatPrice` / `STATUS_VARIANT` as the table; it only
 * re-flows them into a stack so the 19-character license key can wrap (`break-all`) instead of
 * forcing the row sideways. Local to this file — it is a layout of the table, not a new concept.
 */
function OrderCard({ order }: { order: Order }) {
  return (
    <li className="rounded-md border border-border bg-canvas p-4">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/listing/${order.product.slug}`}
          className="min-w-0 flex-1 py-1 text-[15px] leading-snug font-semibold break-words text-fg hover:text-accent"
        >
          {order.product.title}
        </Link>
        <Badge
          variant={STATUS_VARIANT[order.status] ?? "outline"}
          className="mt-1 flex-none capitalize"
        >
          {order.status}
        </Badge>
      </div>

      <dl className="mt-3 flex flex-col gap-3 border-t border-border pt-3 text-[13px]">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex-none text-fg-muted">Amount</dt>
          <dd className="mono font-medium text-fg">
            {formatPrice(order.amount_cents, order.currency)}
          </dd>
        </div>

        <div className="flex flex-col gap-1">
          <dt className="text-fg-muted">License key</dt>
          <dd>
            {order.license_key ? (
              // The copy control is bumped to a 44px tap target for this (phone-only) layout.
              <span className="flex items-center gap-2 [&>button]:size-11">
                <span className="mono min-w-0 flex-1 break-all text-[13px] leading-relaxed text-fg">
                  {order.license_key}
                </span>
                <CopyButton value={order.license_key} label="Copy license key" />
              </span>
            ) : (
              <span className="text-fg-muted">—</span>
            )}
          </dd>
        </div>
      </dl>

      {order.status === "paid" ? (
        <div className="mt-4">
          {/* Goes to the license-gated download page — never an immediate download. */}
          <DownloadButton orderId={order.id} label="Download" />
        </div>
      ) : null}
    </li>
  );
}

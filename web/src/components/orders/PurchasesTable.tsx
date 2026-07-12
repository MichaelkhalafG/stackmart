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
 * (`{data:[Order]}`) via TanStack Query + lib/api.ts (Bearer attached). Renders a shadcn Table:
 * product, status Badge, amount, mono license + copy, and a token-aware download (paid orders
 * only). Loading/error/empty are handled. Client component — rendered inside the S3.03 (account)
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
    <div className="rounded-md border border-border">
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
                    <DownloadButton
                      orderId={order.id}
                      label="Download"
                      filename={`${order.product.slug}.zip`}
                    />
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
  );
}

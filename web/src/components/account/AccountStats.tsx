"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Receipt } from "lucide-react";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/** Only the two fields this summary counts — the full shape is the frozen buyer orders contract. */
type OrderSummary = { id: number; status: string };

/**
 * The purchases summary + the way into `/account/purchases`.
 *
 * Reuses the SAME TanStack query key as `PurchasesTable` (`["orders"]`), so navigating between the
 * two pages hits a warm cache and the numbers can never disagree with the table they link to.
 *
 * A failed count must not cost the user their way to their purchases: on error the tiles are simply
 * omitted and the CTA still renders.
 */
export function AccountStats() {
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: () => api<{ data: OrderSummary[] }>("/orders"),
  });

  const orders = query.data?.data;
  const total = orders?.length ?? 0;
  const paid = orders?.filter((order) => order.status === "paid").length ?? 0;

  return (
    <section className="rounded-xl border border-border bg-canvas p-6">
      <div className="flex items-center gap-2">
        <Receipt className="size-4 text-accent" strokeWidth={2.2} aria-hidden />
        <h2 className="text-[15px] font-bold text-primary">Your purchases</h2>
      </div>

      {query.isPending ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Skeleton className="h-[74px] w-full rounded-md" />
          <Skeleton className="h-[74px] w-full rounded-md" />
        </div>
      ) : query.isError ? (
        <p className="mt-3 text-[13px] leading-[1.5] text-fg-muted">
          We couldn&rsquo;t load your order count just now. Your purchases page still works.
        </p>
      ) : (
        <dl className="mt-4 grid grid-cols-2 gap-3">
          <Stat label={total === 1 ? "Order" : "Orders"} value={total} />
          <Stat label="Licensed" value={paid} />
        </dl>
      )}

      <Link
        href="/account/purchases"
        className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full justify-between")}
      >
        View your purchases
        <ChevronRight className="size-4" aria-hidden />
      </Link>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-canvas-subtle px-4 py-3">
      <dt className="mono text-[11px] font-semibold tracking-[0.08em] text-fg-muted uppercase">
        {label}
      </dt>
      <dd className="mono mt-1 text-[1.6rem] leading-none font-bold text-primary">{value}</dd>
    </div>
  );
}

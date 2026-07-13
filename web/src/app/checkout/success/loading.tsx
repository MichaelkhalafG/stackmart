import { Skeleton } from "@/components/ui/skeleton";

/**
 * Checkout success loading skeleton (S5.02) — mirrors the order/license card while `/checkout/
 * success?ref=` resolves the order. shadcn `Skeleton` as-is + 06_UI_System.md tokens.
 */
export default function CheckoutSuccessLoading() {
  return (
    <div className="mx-auto max-w-xl py-8" aria-busy="true" aria-label="Loading order">
      <div className="flex flex-col gap-4 rounded-md border border-border p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>
  );
}

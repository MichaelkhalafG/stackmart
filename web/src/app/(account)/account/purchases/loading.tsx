import { Skeleton } from "@/components/ui/skeleton";

/**
 * Purchases loading skeleton (S5.02) — heading + table rows while `GET /api/orders` loads (mirrors
 * the PurchasesTable pending state). shadcn `Skeleton` as-is + 06_UI_System.md tokens.
 */
export default function PurchasesLoading() {
  return (
    <div className="py-2" aria-busy="true" aria-label="Loading purchases">
      <Skeleton className="mb-6 h-8 w-40" />
      <div className="flex flex-col gap-2 rounded-md border border-border p-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

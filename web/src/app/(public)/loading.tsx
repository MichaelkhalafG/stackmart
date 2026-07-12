import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/marketplace/ProductGridSkeleton";

/**
 * Home loading skeleton (S5.02) — mirrors the hero + featured-grid layout so the page doesn't jump
 * while the server fetches the catalog. shadcn `Skeleton` as-is + 06_UI_System.md tokens.
 */
export default function HomeLoading() {
  return (
    <div className="flex flex-col gap-12 py-2" aria-busy="true" aria-label="Loading">
      {/* Hero */}
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <Skeleton className="h-10 w-2/3 max-w-xl" />
        <Skeleton className="h-4 w-1/2 max-w-md" />
        <Skeleton className="mt-2 h-9 w-40" />
      </div>
      {/* Featured listings */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-44" />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

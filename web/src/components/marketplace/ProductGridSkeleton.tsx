import { Skeleton } from "@/components/ui/skeleton";

/**
 * Loading skeleton for the marketplace card grid (shadcn Skeleton as-is). Mirrors the
 * MarketplaceCard shape (cover + tag + title + tagline + price) so the layout doesn't jump.
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-xl border border-border bg-canvas shadow-sm"
        >
          <Skeleton className="aspect-[16/9] w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

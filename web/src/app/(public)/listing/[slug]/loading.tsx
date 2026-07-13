import { Skeleton } from "@/components/ui/skeleton";

/**
 * Listing detail loading skeleton (S5.02) — mirrors the repo-page layout (header row + content left
 * + sticky purchase card right) so the server fetch of `GET /api/products/{slug}` doesn't jump.
 * shadcn `Skeleton` as-is + 06_UI_System.md tokens.
 */
export default function ListingLoading() {
  return (
    <div className="py-2" aria-busy="true" aria-label="Loading listing">
      {/* Header row */}
      <div className="flex flex-col gap-3 border-b border-border pb-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-2/3 max-w-lg" />
        <Skeleton className="h-4 w-1/2 max-w-md" />
      </div>

      {/* Content left, sticky purchase card right */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Skeleton className="aspect-[16/9] w-full" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
        <div className="flex flex-col gap-3 rounded-md border border-border p-4">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

/**
 * Home loading skeleton (S5.02, updated for the landing redesign) — mirrors the new landing's hero
 * (copy column + visual panel) and the featured-listings grid, so the page doesn't jump while the
 * server fetches the catalog. Uses the hero's own 1200px measure (the root layout no longer wraps
 * pages in a container). shadcn `Skeleton` as-is + 06_UI_System.md tokens.
 */
export default function HomeLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      {/* Hero */}
      <div className="container-page grid grid-cols-[repeat(auto-fit,minmax(370px,1fr))] items-center gap-[clamp(36px,5vw,72px)] pt-[clamp(52px,6.5vw,100px)] pb-[clamp(48px,6vw,84px)]">
        <div className="flex flex-col gap-5">
          <Skeleton className="h-7 w-64 rounded-md" />
          <Skeleton className="h-16 w-full max-w-lg" />
          <Skeleton className="h-16 w-4/5 max-w-md" />
          <Skeleton className="h-4 w-full max-w-[520px]" />
          <div className="mt-2 flex gap-3.5">
            <Skeleton className="h-[52px] w-40" />
            <Skeleton className="h-[52px] w-40" />
          </div>
        </div>
        <Skeleton className="min-h-[480px] w-full rounded-[14px]" />
      </div>

      {/* Featured listings */}
      <div className="container-page py-[clamp(64px,8vw,108px)]">
        <Skeleton className="h-6 w-44" />
        <Skeleton className="mt-3 h-10 w-full max-w-lg" />
        <div className="mt-[42px] grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-[430px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

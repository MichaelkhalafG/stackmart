import { Shimmer } from "@/components/states/LoadingState";

/**
 * Home loading skeleton — mirrors the landing's hero (copy column + visual panel) and the
 * featured-listings grid, so the page doesn't jump while the server fetches the catalog. Uses the
 * hero's own 1280px measure (the root layout no longer wraps pages in a container). Placeholders
 * are the reference §04 shimmer: a canvas-subtle track swept by lavender.
 */
export default function HomeLoading() {
  return (
    <div aria-busy="true" aria-label="Loading">
      {/* Hero */}
      <div className="container-page grid grid-cols-[repeat(auto-fit,minmax(370px,1fr))] items-center gap-[clamp(36px,5vw,72px)] pt-[clamp(52px,6.5vw,100px)] pb-[clamp(48px,6vw,84px)]">
        <div className="flex flex-col gap-5">
          <Shimmer className="h-7 w-64" />
          <Shimmer className="h-16 w-full max-w-lg" delay="0.08s" />
          <Shimmer className="h-16 w-4/5 max-w-md" delay="0.16s" />
          <Shimmer className="h-4 w-full max-w-[520px]" delay="0.24s" />
          <div className="mt-2 flex gap-3.5">
            <Shimmer className="h-[52px] w-40" delay="0.32s" />
            <Shimmer className="h-[52px] w-40" delay="0.4s" />
          </div>
        </div>
        <Shimmer className="min-h-[480px] w-full rounded-[14px]" delay="0.12s" />
      </div>

      {/* Featured listings */}
      <div className="container-page py-[clamp(64px,8vw,108px)]">
        <Shimmer className="h-6 w-44" />
        <Shimmer className="mt-3 h-10 w-full max-w-lg" delay="0.1s" />
        <div className="mt-[42px] grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-6">
          {[0, 1, 2].map((i) => (
            <Shimmer key={i} className="h-[430px] w-full rounded-xl" delay={`${i * 0.12}s`} />
          ))}
        </div>
      </div>
    </div>
  );
}

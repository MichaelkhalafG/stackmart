import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * `/guidelines` loading skeleton — mirrors the page's opening band (mono eyebrow → headline → lead →
 * jump buttons) and the first row of step cards, so the layout doesn't jump when the page paints.
 * The page is full-bleed, so the container is supplied here.
 */
export default function GuidelinesLoading() {
  return (
    <div className="container-page py-14" aria-busy="true" aria-label="Loading">
      <div className="max-w-[760px]">
        <Shimmer className="h-3 w-24" />
        <Shimmer className="mt-4 h-12 w-full max-w-xl" delay="0.06s" />
        <Shimmer className="mt-3 h-12 w-full max-w-md" delay="0.12s" />
        <Shimmer className="mt-6 h-4 w-full max-w-lg" delay="0.18s" />
        <Shimmer className="mt-2.5 h-4 w-full max-w-sm" delay="0.24s" />

        <div className="mt-9 flex gap-3">
          <Shimmer className="h-12 w-32" delay="0.3s" />
          <Shimmer className="h-12 w-32" delay="0.34s" />
          <Shimmer className="h-12 w-36" delay="0.38s" />
        </div>
      </div>

      <div className="mt-14">
        <TerminalLine>loading the guidelines</TerminalLine>

        <div className="mt-6 grid grid-cols-[repeat(auto-fit,minmax(258px,1fr))] gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-[10px] border border-border bg-canvas p-[26px]">
              <div className="flex items-center justify-between">
                <Shimmer className="size-[46px]" delay={`${i * 0.08}s`} />
                <Shimmer className="h-6 w-9" delay={`${i * 0.08 + 0.04}s`} />
              </div>
              <Shimmer className="mt-5 h-5 w-40" delay={`${i * 0.08 + 0.08}s`} />
              <Shimmer className="mt-3 h-4 w-full" delay={`${i * 0.08 + 0.12}s`} />
              <Shimmer className="mt-2 h-4 w-3/4" delay={`${i * 0.08 + 0.16}s`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

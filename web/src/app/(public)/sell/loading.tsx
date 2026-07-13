import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * `/sell` loading skeleton — mirrors the submission page (heading + sub-line, then the form card)
 * at its own max-w-2xl measure, so the page doesn't jump. The sell layout supplies the container.
 */
export default function SellLoading() {
  return (
    <div className="mx-auto max-w-2xl py-4" aria-busy="true" aria-label="Loading">
      <header className="mb-6 flex flex-col gap-2">
        <Shimmer className="h-8 w-56" />
        <Shimmer className="h-4 w-full max-w-lg" delay="0.1s" />
      </header>

      <div className="flex flex-col gap-5 rounded-md border border-border bg-canvas p-6">
        <TerminalLine>loading the submission form</TerminalLine>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <Shimmer className="h-3 w-24" delay={`${i * 0.08}s`} />
            <Shimmer className="h-11 w-full" delay={`${i * 0.08 + 0.04}s`} />
          </div>
        ))}
        <Shimmer className="h-11 w-40" delay="0.4s" />
      </div>
    </div>
  );
}

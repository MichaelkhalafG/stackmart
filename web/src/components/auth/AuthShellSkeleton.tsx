import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * The loading skeleton for the auth screens — mirrors the CURRENT `AuthShell`: a full-viewport
 * two-panel split (branded form panel left, navy coding panel right), not the old centred card.
 * Keeping the two in step is what stops the page jumping when the real form swaps in.
 *
 * `fields` is the number of inputs the target form has (login 2 · register 4 · forgot 1), so the
 * skeleton's height matches what replaces it.
 */
export function AuthShellSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div
      className="grid min-h-dvh flex-1 grid-cols-1 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading"
    >
      {/* Form panel — mirrors the card-less top/middle/bottom composition of `AuthShell`. */}
      <div className="auth-base relative flex flex-col overflow-hidden px-6 py-10 sm:px-10 lg:px-[clamp(48px,6vw,96px)] lg:py-14">
        <div className="auth-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--accent),var(--tag-bg))]"
        />

        <div className="relative mx-auto flex w-full max-w-[480px] flex-1 flex-col">
          <Shimmer className="h-6 w-40" />

          <div className="flex flex-1 flex-col justify-center py-10">
            <Shimmer className="h-[3px] w-10" />
            <Shimmer className="mt-6 h-10 w-60" delay="0.08s" />
            <Shimmer className="mt-2.5 h-4 w-full max-w-[280px]" delay="0.16s" />

            <div className="mt-9 flex flex-col gap-4">
              {Array.from({ length: fields }, (_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Shimmer className="h-3 w-20" delay={`${i * 0.08 + 0.2}s`} />
                  <Shimmer className="h-11 w-full" delay={`${i * 0.08 + 0.24}s`} />
                </div>
              ))}
              <Shimmer className="mt-2 h-11 w-full" delay={`${fields * 0.08 + 0.28}s`} />
            </div>
          </div>

          <Shimmer className="mx-auto h-4 w-48" delay="0.4s" />
        </div>
      </div>

      {/* Branded navy coding panel */}
      <div className="panel-navy relative flex min-h-[360px] flex-col justify-between overflow-hidden p-[clamp(32px,4.5vw,64px)] lg:min-h-full">
        <div className="motif-grid absolute inset-0" aria-hidden />

        <div className="relative flex flex-col gap-6">
          <Shimmer className="h-6 w-52 bg-canvas/10" />
          <Shimmer className="h-10 w-full max-w-[320px] bg-canvas/10" delay="0.1s" />
        </div>

        <div className="relative rounded-lg border border-tag-bg/20 bg-primary-emphasis/55 px-[18px] py-4">
          <TerminalLine tone="light">{"$ booting mdn stackmart"}</TerminalLine>
        </div>
      </div>
    </div>
  );
}

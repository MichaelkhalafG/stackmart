import { Shimmer, TerminalLine } from "@/components/states/LoadingState";

/**
 * `/register` loading — mirrors the `AuthShell` split card (form side + branded navy panel) so the
 * page doesn't jump. Four fields: name, email, password, confirmation. Container comes from the
 * (auth) layout.
 */
export default function RegisterLoading() {
  return (
    <div className="flex justify-center py-8 sm:py-12" aria-busy="true" aria-label="Loading">
      <div className="shadow-mega grid w-full max-w-[1000px] grid-cols-[repeat(auto-fit,minmax(300px,1fr))] overflow-hidden rounded-[10px] border border-border bg-canvas">
        {/* form side */}
        <div className="p-[clamp(28px,4vw,52px)]">
          <Shimmer className="h-7 w-40" />
          <Shimmer className="mt-7 h-9 w-64" delay="0.08s" />
          <Shimmer className="mt-2 h-4 w-full max-w-[300px]" delay="0.16s" />

          <div className="mt-[26px] flex flex-col gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Shimmer className="h-3 w-24" delay={`${i * 0.08 + 0.2}s`} />
                <Shimmer className="h-11 w-full" delay={`${i * 0.08 + 0.24}s`} />
              </div>
            ))}
            <Shimmer className="mt-1 h-11 w-full" delay="0.56s" />
          </div>
        </div>

        {/* brand panel */}
        <div className="panel-navy relative flex min-h-[320px] flex-col justify-end overflow-hidden p-[clamp(28px,4vw,48px)] md:min-h-[420px]">
          <div className="motif-grid absolute inset-0" aria-hidden />
          <TerminalLine tone="light" className="relative">
            preparing your account
          </TerminalLine>
        </div>
      </div>
    </div>
  );
}

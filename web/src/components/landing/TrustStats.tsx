import { Eye, Lock, ShieldCheck } from "lucide-react";

/**
 * Trust/stats band. Static marketing numbers.
 * TODO: real metrics.
 */
const STATS = [
  { value: "$2.4M", label: "in deals closed" },
  { value: "180", label: "vetted listings" },
  { value: "12k+", label: "active buyers" },
  { value: "98%", label: "deal close rate" },
];

const TRUST_MARKS = [
  { icon: ShieldCheck, label: "Code-verified listings" },
  { icon: Lock, label: "Escrow-protected payments" },
  { icon: Eye, label: "Confidential by default" },
];

export function TrustStats() {
  return (
    // hidden on mobile — the hero's trust line already shows these figures; desktop keeps the band.
    <section className="mesh-stats border-y border-border max-md:hidden">
      <div className="container-page py-[clamp(48px,6vw,80px)]">
        {/* Phones (<sm): a tight 2×2 grid inside ONE bordered card, so the four figures read as a
            single stats block instead of four lonely centred numbers. Every mobile-only class is
            `max-sm:`-scoped (or restored at `sm`), so ≥640px is byte-identical to the approved design. */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-6 gap-y-8 max-sm:grid-cols-2 max-sm:gap-0 max-sm:overflow-hidden max-sm:rounded-[10px] max-sm:border max-sm:border-border max-sm:bg-canvas">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              // The 2×2 dividers: right border on the left column, bottom border on the top row.
              className="text-center max-sm:px-2 max-sm:py-5 max-sm:odd:border-r max-sm:[&:nth-child(-n+2)]:border-b"
            >
              <div className="mono text-[clamp(1.9rem,5vw,3.7rem)] leading-none font-semibold tracking-[-0.03em] text-accent sm:text-[clamp(2.6rem,5vw,3.7rem)]">
                {stat.value}
              </div>
              <div className="mt-3 text-sm text-fg-muted max-sm:mt-1.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Phones: a neat left-aligned column instead of a centre-wrapped row breaking into ragged lines. */}
        <div className="mt-11 flex flex-wrap justify-center gap-x-10 gap-y-3.5 border-t border-border pt-8 max-sm:mt-8 max-sm:flex-col max-sm:items-start max-sm:gap-y-3 max-sm:pt-6">
          {TRUST_MARKS.map(({ icon: Icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-2.5 text-sm font-medium text-primary"
            >
              <Icon className="size-5 text-accent" strokeWidth={2} aria-hidden />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Eye, Lock, ShieldCheck } from "lucide-react";

/**
 * Trust / stats band — approved landing design.
 *
 * TODO: wire to real metrics post-launch.
 *
 * These are marketing numbers and are intentionally STATIC for now. They live in the two constants
 * below so they are trivial to edit (or swap for a server fetch) later without touching the markup.
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
    <section className="mesh-stats border-y border-border">
      <div className="container-page py-[clamp(48px,6vw,80px)]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-x-6 gap-y-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="mono text-[clamp(2.6rem,5vw,3.7rem)] leading-none font-semibold tracking-[-0.03em] text-accent">
                {stat.value}
              </div>
              <div className="mt-3 text-sm text-fg-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-11 flex flex-wrap justify-center gap-x-10 gap-y-3.5 border-t border-border pt-8">
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

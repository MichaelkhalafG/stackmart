import Link from "next/link";
import { Check } from "lucide-react";

/** Seller CTA band — approved landing design. Static copy on the deep-navy gradient mesh. */
const PERKS = ["No listing fees", "Confidential by default", "Vetted buyers only"];

/** The floating glass stat cards in the cluster. Static marketing figures, as designed. */
const FLOAT_STATS = [
  {
    label: "Average sale price",
    value: "$180k",
    pulse: true,
    className: "anim-float-a top-1.5 right-[4%] w-[236px]",
  },
  {
    label: "Time to first offer",
    value: "72h",
    pulse: false,
    className: "anim-float-c top-[150px] left-0 w-[214px]",
  },
  {
    label: "Avg. revenue multiple",
    value: "3.1×",
    pulse: false,
    className: "anim-float-b right-[16%] bottom-0.5 w-[222px]",
  },
];

export function SellCta() {
  return (
    <section id="sell" className="mesh-sell relative scroll-mt-20 overflow-hidden">
      <div className="grid-motif-sell absolute inset-0" aria-hidden />

      <div className="relative container-page grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] items-center gap-[clamp(48px,6vw,80px)] py-[clamp(76px,9vw,136px)]">
        {/* ── Copy ─────────────────────────────────────────────────────────── */}
        <div className="max-w-[560px]">
          <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg/15 px-[13px] py-1.5 text-[13px] font-semibold text-tag-bg">
            For founders
          </span>

          <h2 className="mt-[22px] text-[clamp(2.5rem,4.6vw,3.9rem)] leading-[1.02] font-bold tracking-[-0.035em] text-canvas">
            Exit on
            <br />
            <span className="text-tag-bg">your terms.</span>
          </h2>

          <p className="mt-[22px] max-w-[500px] text-[clamp(1.05rem,1.5vw,1.24rem)] leading-[1.55] text-canvas/75">
            List your micro-SaaS once and reach thousands of pre-qualified acquirers. We handle
            vetting, valuation, and escrow — you stay in control right through the handover.
          </p>

          <div className="mt-9 flex flex-wrap gap-3.5">
            <Link
              href="/sell"
              className="shadow-cta-light rounded-md border border-canvas bg-canvas px-[30px] py-4 text-base font-semibold text-primary-emphasis transition-[background-color,box-shadow] duration-200 hover:bg-tag-bg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg"
            >
              List your SaaS
            </Link>
            <Link
              href="/sell"
              className="rounded-md border border-canvas/35 bg-transparent px-[30px] py-4 text-base font-semibold text-canvas transition-[border-color,background-color] duration-200 hover:border-canvas hover:bg-canvas/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg"
            >
              Talk to our team
            </Link>
          </div>

          <div className="mt-[34px] flex flex-wrap gap-x-[22px] gap-y-3 text-sm text-canvas/65">
            {PERKS.map((perk) => (
              <span key={perk} className="inline-flex items-center gap-2">
                <Check className="size-[15px] text-tag-bg" strokeWidth={3} aria-hidden />
                {perk}
              </span>
            ))}
          </div>
        </div>

        {/* ── Floating stat cluster ────────────────────────────────────────── */}
        <div className="relative min-h-[360px]" aria-hidden>
          <div className="absolute top-1/2 left-1/2 size-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-tag-bg/15" />
          <div className="absolute top-1/2 left-1/2 size-[210px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-2xl border border-accent/50" />

          {FLOAT_STATS.map((stat) => (
            <div
              key={stat.label}
              className={`shadow-glass absolute rounded-xl border border-canvas/15 bg-canvas/7 px-5 py-[18px] backdrop-blur-[10px] ${stat.className}`}
            >
              <div className="flex items-center gap-[7px] text-xs text-canvas/60">
                {stat.pulse ? (
                  <span className="anim-pulse-dot size-1.5 rounded-full bg-tag-bg" />
                ) : null}
                {stat.label}
              </div>
              <div className="mono mt-2 text-[30px] font-semibold tracking-[-0.02em] text-canvas">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

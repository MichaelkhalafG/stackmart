import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";

/**
 * Hero — approved landing design. Copy column + the navy gradient-mesh visual with the floating
 * card cluster. Static by design (the cards in the visual are illustrative art, not live listings —
 * the real catalog is the Featured Listings section below).
 */

/** The three inline proof figures under the CTAs. Static marketing copy, as designed. */
const HERO_STATS = [
  { value: "$2.4M", label: "in deals" },
  { value: "180", label: "vetted listings" },
  { value: "12k+", label: "buyers" },
];

export function Hero() {
  return (
    <section className="mesh-hero relative">
      <div className="container-page grid grid-cols-[repeat(auto-fit,minmax(370px,1fr))] items-center gap-[clamp(36px,5vw,72px)] pt-[clamp(52px,6.5vw,100px)] pb-[clamp(48px,6vw,84px)]">
        {/* ── Copy ─────────────────────────────────────────────────────────── */}
        <div>
          <span className="inline-flex items-center gap-2 rounded-md bg-tag-bg px-[13px] py-1.5 text-[13px] font-semibold text-tag-fg">
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            Curated micro-SaaS marketplace
          </span>

          {/* Two-tone headline: solid navy line, then the payoff line in the royal-blue → violet
              gradient (`.text-gradient-accent`, clipped to the glyphs). */}
          <h1 className="mt-[22px] text-[clamp(2.7rem,5vw,4.4rem)] leading-[1.02] font-bold tracking-[-0.03em] text-primary">
            Skip the build.
            <br />
            <span className="text-gradient-accent">Buy the business.</span>
          </h1>

          <p className="mt-6 max-w-[520px] text-[clamp(1.05rem,1.5vw,1.28rem)] leading-[1.55] text-fg-muted">
            Why spend two years building what you can own today? Acquire a vetted, profitable
            micro-SaaS with real customers — every listing verified for real MRR, clean churn, and
            audited code. Buy with confidence. Exit without the noise.
          </p>

          <div className="mt-[34px] flex flex-wrap gap-3.5">
            <Link
              href="/marketplace"
              className="shadow-cta-hover-lg rounded-md border border-primary bg-primary px-7 py-[15px] text-base font-semibold text-primary-foreground transition-[background-color,box-shadow] duration-200 hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Browse listings
            </Link>
            <Link
              href="/sell"
              className="rounded-md border border-border bg-canvas px-7 py-[15px] text-base font-semibold text-primary transition-[border-color,background-color] duration-200 hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              List your SaaS
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-[11px] text-sm text-fg-muted">
            {HERO_STATS.map((stat, index) => (
              <span key={stat.label} className="flex items-center gap-[11px]">
                {index > 0 ? <span className="size-1 rounded-full bg-border" aria-hidden /> : null}
                <span className="mono font-semibold text-primary">{stat.value}</span>
                <span>{stat.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Visual: gradient mesh + floating cards ───────────────────────── */}
        <div
          className="mesh-hero-visual shadow-hero-visual relative min-h-[480px] overflow-hidden rounded-[14px]"
          aria-hidden
        >
          <div className="grid-motif-hero absolute inset-0" />

          {/* Back card */}
          <div className="anim-float-b shadow-float-sm absolute top-[58px] right-[34px] w-[250px] rounded-[10px] bg-canvas/90 px-[17px] py-[15px] opacity-60">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-tag-bg px-2 py-[3px] text-[11px] font-semibold text-tag-fg">
                Dev Tools
              </span>
              <span className="mono text-xs text-fg-muted">$6.2k</span>
            </div>
            <div className="mt-2 text-[15px] font-semibold text-primary">Cronbase</div>
          </div>

          {/* Middle card */}
          <div className="anim-float-c shadow-float-md absolute top-[168px] right-[70px] w-[270px] rounded-[11px] bg-canvas/95 px-[18px] py-4 opacity-90">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-tag-bg px-2 py-[3px] text-[11px] font-semibold text-tag-fg">
                E-commerce
              </span>
              <span className="mono text-xs text-fg-muted">$8.9k</span>
            </div>
            <div className="mt-2 text-[15px] font-semibold text-primary">Shipgrid</div>
          </div>

          {/* Front card */}
          <div className="anim-float-a shadow-float-lg absolute bottom-[42px] left-8 w-[308px] max-w-[calc(100%-56px)] rounded-xl bg-canvas p-5">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-tag-bg px-2.5 py-1 text-[11px] font-semibold text-tag-fg">
                AI Tools
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                <ShieldCheck className="size-3.5 text-accent" strokeWidth={2.4} />
                Vetted
              </span>
            </div>

            <div className="mt-[13px] text-[21px] font-bold text-primary">Inboxly</div>
            <div className="mt-1 text-[13px] text-fg-muted">AI email triage for busy founders</div>

            {/* Bar chart */}
            <div className="mt-4 flex h-[42px] items-end gap-[5px]">
              {[36, 50, 44].map((height, i) => (
                <div
                  key={`l-${i}`}
                  className="flex-1 rounded-[2px] bg-tag-bg"
                  style={{ height: `${height}%` }}
                />
              ))}
              {[66, 82, 100].map((height, i) => (
                <div
                  key={`h-${i}`}
                  className="flex-1 rounded-[2px] bg-accent"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3.5">
              <div>
                <div className="text-[10px] tracking-[0.06em] text-fg-muted uppercase">MRR</div>
                <div className="mono text-base font-semibold text-primary">$12.4k</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] tracking-[0.06em] text-fg-muted uppercase">Asking</div>
                <div className="mono text-base font-semibold text-primary">$420k</div>
              </div>
            </div>
          </div>

          {/* Corner chip */}
          <div className="shadow-chip absolute top-[26px] left-[26px] inline-flex items-center gap-2 rounded-md bg-tag-bg px-3 py-[7px] text-xs font-bold text-tag-fg">
            <Check className="size-[13px] text-accent" strokeWidth={3} />
            Code-audited &amp; verified
          </div>
        </div>
      </div>
    </section>
  );
}

import { BarChart3, Lock, Search } from "lucide-react";

/** How it works — approved landing design. Static copy on the lavender gradient-mesh band. */
const STEPS = [
  {
    icon: Search,
    step: "01",
    title: "Browse",
    body: "Explore hand-vetted listings with verified MRR, churn, and full code audits — no unverified numbers.",
  },
  {
    icon: Lock,
    step: "02",
    title: "Buy securely",
    body: "Close through escrow with legal docs, funds protection, and asset transfer handled end-to-end.",
  },
  {
    icon: BarChart3,
    step: "03",
    title: "Own & grow",
    body: "Take the keys with a 30-day guided handover and founder support built into every acquisition.",
  },
];

/**
 * The section's "live coding" backdrop — pure CSS + static text, no images and no packages.
 *
 * Layers (all decorative, `aria-hidden`, `pointer-events-none`): a faint navy technical grid, two
 * columns of low-opacity IBM Plex Mono code (an audit terminal on the left, a listing payload on
 * the right), oversized bracket glyphs, and a slow blinking prompt cursor. The whole thing sits
 * inside `.how-backdrop`, whose radial mask fades it out behind the heading and the cards, so it
 * reads as edge texture only. The drift/blink loops are CSS keyframes disabled under
 * `prefers-reduced-motion`. Content is 100% static — nothing random or time-based, so the server
 * and client render identically (no hydration warnings).
 */
const AUDIT_LOG = [
  "import { verify, escrow } from '@stackmart/sdk'",
  "",
  "$ stackmart audit --listing cronbase",
  "",
  "  ✓ mrr verified ............ $6.2k",
  "  ✓ churn ................... 1.8% / mo",
  "  ✓ code audit .............. passed",
  "  ✓ escrow ready ............ true",
  "",
  "export async function acquire(saas: Listing) {",
  "  await verify(saas.metrics)",
  "  await escrow.hold(saas.price)",
  "  return transfer(saas.assets, { handover: '30d' })",
  "}",
];

const LISTING_PAYLOAD = [
  "{",
  '  "listing": "deploydeck",',
  '  "mrr": 11800,',
  '  "verified": true,',
  '  "stack": ["laravel", "next"],',
  '  "handover": "30d"',
  "}",
];

function CodeBackdrop() {
  return (
    <div className="how-backdrop pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Technical grid */}
      <div className="how-grid absolute inset-0" />

      {/* Oversized bracket glyphs */}
      <span className="how-glyph mono absolute -top-10 left-[3%] text-[19rem] leading-none font-bold select-none">
        {"{"}
      </span>
      <span className="how-glyph mono absolute -bottom-24 right-[3%] text-[19rem] leading-none font-bold select-none">
        {"}"}
      </span>

      {/* Left: audit terminal */}
      <div className="anim-drift-slow absolute top-10 left-[2%] hidden lg:block">
        <pre className="how-code mono text-[13px] leading-[1.9] whitespace-pre select-none">
          {AUDIT_LOG.join("\n")}
        </pre>
        {/* Blinking prompt cursor */}
        <span className="mono how-code-accent flex items-center gap-1.5 text-[13px]">
          $ <span className="anim-blink inline-block h-[13px] w-[7px] bg-accent align-middle" />
        </span>
      </div>

      {/* Right: listing payload */}
      <div className="anim-drift-slower absolute right-[2%] bottom-12 hidden lg:block">
        <pre className="how-code-accent mono text-[13px] leading-[1.9] whitespace-pre select-none">
          {LISTING_PAYLOAD.join("\n")}
        </pre>
      </div>

      {/* Narrow screens: a single centred code whisper instead of the two columns */}
      <pre className="how-code mono absolute top-8 left-1/2 -translate-x-1/2 text-[11px] leading-[1.9] whitespace-pre select-none lg:hidden">
        {"</>  verified  ·  escrow  ·  handover"}
      </pre>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section id="how" className="how-base relative scroll-mt-20 overflow-hidden border-t border-border">
      <CodeBackdrop />

      <div className="container-page relative py-[clamp(64px,8vw,108px)]">
        <div className="mx-auto mb-[54px] max-w-[660px] text-center">
          <div className="text-[13px] font-semibold tracking-[0.08em] text-accent uppercase">
            How it works
          </div>
          <h2 className="mt-2.5 text-[clamp(1.9rem,3.2vw,2.8rem)] font-bold tracking-[-0.025em] text-primary">
            From browsing to owning, without the guesswork
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {STEPS.map(({ icon: Icon, step, title, body }) => (
            <div
              key={step}
              className="rounded-[10px] border border-border bg-canvas p-[30px]"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-[50px] items-center justify-center rounded-lg bg-tag-bg">
                  <Icon className="size-[23px] text-accent" strokeWidth={2} aria-hidden />
                </div>
                <span className="mono text-[26px] font-semibold text-accent">{step}</span>
              </div>
              <h3 className="mt-[22px] text-[1.3rem] font-semibold text-primary">{title}</h3>
              <p className="mt-2 text-[15px] leading-[1.55] text-fg-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

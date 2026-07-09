import { CreditCard, Download, Search } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & evaluate",
    body: "Explore vetted listings, open the live demo, and review the repository before you commit.",
  },
  {
    icon: CreditCard,
    title: "Buy instantly",
    body: "One product, one order — pay securely and instantly. No cart, no negotiation.",
  },
  {
    icon: Download,
    title: "Download & own",
    body: "Receive the full source code as a secure ZIP plus your license key, delivered on payment.",
  },
];

/**
 * How-it-works (S2.01) — the 3-step buyer journey (browse → buy → download) as a token-styled
 * row of bordered boxes. Descriptive copy only; no Buy Now action lives here.
 */
export function HowItWorks() {
  return (
    <section className="border-t border-border py-10">
      <h2 className="mb-5 text-xl font-semibold tracking-tight text-fg">How it works</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <div
            key={step.title}
            className="flex flex-col gap-3 rounded-md border border-border bg-canvas p-5"
          >
            <div className="flex items-center gap-3">
              <span className="inline-flex size-9 items-center justify-center rounded-md bg-canvas-subtle text-accent">
                <step.icon className="size-5" aria-hidden />
              </span>
              <span className="mono text-xs text-fg-muted">Step {index + 1}</span>
            </div>
            <h3 className="text-base font-semibold text-fg">{step.title}</h3>
            <p className="text-sm text-fg-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

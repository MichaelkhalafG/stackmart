import { Code2, KeyRound, PackageCheck, ShieldCheck } from "lucide-react";

const points = [
  { icon: ShieldCheck, label: "Every listing is admin-vetted" },
  { icon: Code2, label: "Live demo & repository review" },
  { icon: PackageCheck, label: "Full source code as a secure ZIP" },
  { icon: KeyRound, label: "License key delivered on payment" },
];

/**
 * Trust strip (S2.01) — a muted, token-styled row of the marketplace's guarantees. Static copy;
 * reinforces the buyer promises from the product brief.
 */
export function TrustStrip() {
  return (
    <section className="border-t border-border py-8">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {points.map((point) => (
          <div key={point.label} className="flex items-center gap-3 text-sm text-fg-muted">
            <point.icon className="size-5 shrink-0 text-accent" aria-hidden />
            <span>{point.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * "Sell your project" CTA (S2.01) — a bordered subtle-bg panel linking to `/sell`. Uses the
 * outline (secondary) button so it never competes with the hero's single solid CTA.
 */
export function SellCta() {
  return (
    <section className="my-10 flex flex-col items-start gap-4 rounded-md border border-border bg-canvas-subtle p-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <h2 className="text-xl font-semibold tracking-tight text-fg">Have a project to sell?</h2>
        <p className="mt-1 text-sm text-fg-muted">
          Submit your micro-SaaS, web app, or codebase for review. Our team vets every submission
          before it&apos;s listed on the marketplace.
        </p>
      </div>
      <Link
        href="/sell"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "shrink-0")}
      >
        Submit your project
      </Link>
    </section>
  );
}

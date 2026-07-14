import type { Metadata } from "next";
import Link from "next/link";
import { Undo2 } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

/**
 * `/checkout/cancel` — a clean, on-brand cancelled state. No payment was taken and no order was
 * completed. Static, server-rendered; it sits on the shared branded checkout backdrop supplied by
 * the section layout.
 */
export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto flex max-w-[520px] flex-col items-center">
      {/* No in-body logo — the navbar (SiteChrome) already carries it. */}
      <div className="flex w-full flex-col items-center rounded-xl border border-border bg-canvas p-8 text-center sm:p-10">
        <span
          aria-hidden
          className="flex size-14 items-center justify-center rounded-lg bg-canvas-subtle text-fg-muted"
        >
          <Undo2 className="size-7" strokeWidth={2} />
        </span>

        <h1 className="mt-5 text-[1.5rem] font-bold tracking-[-0.01em] text-primary">
          Checkout cancelled
        </h1>
        <p className="mt-2 max-w-[40ch] text-[14.5px] leading-[1.55] text-fg-muted">
          No payment was taken and your order wasn&rsquo;t completed. Nothing has been charged — you
          can pick up where you left off whenever you&rsquo;re ready.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/marketplace" className={cn(buttonVariants({ variant: "default" }))}>
            Back to marketplace
          </Link>
          <Link href="/account/purchases" className={cn(buttonVariants({ variant: "outline" }))}>
            View purchases
          </Link>
        </div>

        <p className="mono mt-8 text-[11px] text-fg-muted">no charge · no order created</p>
      </div>
    </div>
  );
}

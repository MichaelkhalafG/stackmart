"use client";

import Link from "next/link";
import { Receipt } from "lucide-react";

import { Blankslate } from "@/components/marketplace/Blankslate";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Purchases (S3.05) — PLACEHOLDER only. Renders inside the S3.03 `(account)` guard. Real
 * orders + license keys land with the Day-4 checkout/orders flow (S4.06); no API call is made
 * here yet. Reuses the shared Primer `Blankslate` empty-state (shadcn-as-is philosophy).
 */
export default function PurchasesPage() {
  return (
    <div className="py-2">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Your purchases</h1>
        <p className="text-sm text-fg-muted">Your bought products, downloads, and license keys.</p>
      </header>

      <Blankslate
        icon={<Receipt className="size-8" />}
        title="No purchases yet"
        description="Once you buy a product, it'll appear here with its download and license key. Checkout is coming soon."
        action={
          <Link href="/marketplace" className={cn(buttonVariants({ variant: "outline" }))}>
            Browse the marketplace
          </Link>
        }
      />
    </div>
  );
}

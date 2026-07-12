import type { Metadata } from "next";
import Link from "next/link";
import { XCircle } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

/**
 * `/checkout/cancel` (S4.05) — a clean cancelled-checkout state. Static, server-rendered; no
 * payment was taken and no order completed.
 */
export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="gap-0 p-0">
        <div className="flex flex-col items-center gap-3 p-8 text-center">
          <XCircle className="size-9 text-fg-muted" aria-hidden />
          <h1 className="text-lg font-semibold text-fg">Checkout cancelled</h1>
          <p className="max-w-xs text-sm text-fg-muted">
            No payment was taken and your order wasn&apos;t completed. You can head back and try
            again any time.
          </p>
          <Link href="/marketplace" className={cn(buttonVariants({ variant: "outline" }), "mt-1")}>
            Back to marketplace
          </Link>
        </div>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { api, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * MockCheckout (S4.05) — a DEV-ONLY stand-in for a hosted checkout while the real gateway is a
 * pending business decision. It NEVER names a gateway. Reading the `ref` from the URL, each button
 * POSTs a simulated PaymentEvent-shaped payload to the REAL `POST /api/webhooks/payment` (the same
 * pipeline a real provider would drive), then routes to success (paid) or cancel (failed). The
 * page that renders this guards it to non-production.
 */
export function MockCheckout() {
  const router = useRouter();
  const ref = useSearchParams().get("ref") ?? "";
  const [pending, setPending] = useState<null | "paid" | "failed">(null);
  const [error, setError] = useState<string | undefined>();

  async function simulate(status: "paid" | "failed") {
    if (!ref) {
      setError("Missing checkout reference.");
      return;
    }
    setError(undefined);
    setPending(status);
    try {
      await api("/webhooks/payment", {
        method: "POST",
        body: JSON.stringify({ ref, status }),
      });
      router.push(
        status === "paid"
          ? `/checkout/success?ref=${encodeURIComponent(ref)}`
          : "/checkout/cancel",
      );
    } catch (err) {
      setPending(null);
      setError(err instanceof ApiError ? err.message : "Simulation failed. Please try again.");
    }
  }

  return (
    <div className="mx-auto max-w-md py-16">
      <Card className="gap-0 p-0">
        <div className="flex flex-col gap-4 p-6">
          <div>
            <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
              Dev mock
            </span>
            <h1 className="mt-3 text-lg font-semibold text-fg">Simulated checkout</h1>
            <p className="mt-1 text-sm text-fg-muted">
              A development stand-in for a hosted checkout. Choose an outcome to drive the order
              flow — this is not a real payment.
            </p>
          </div>

          <p className="mono truncate text-xs text-fg-muted">ref: {ref || "—"}</p>

          <div className="flex flex-col gap-2">
            <Button onClick={() => simulate("paid")} disabled={pending !== null}>
              {pending === "paid" ? "Processing…" : "Simulate successful payment"}
            </Button>
            <Button variant="outline" onClick={() => simulate("failed")} disabled={pending !== null}>
              {pending === "failed" ? "Processing…" : "Simulate failed payment"}
            </Button>
          </div>

          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}

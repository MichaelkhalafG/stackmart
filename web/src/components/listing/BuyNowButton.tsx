"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";

/**
 * BuyNowButton (13_Component_Map.md) — the ONLY primary action on the page (shadcn Button default
 * = solid navy `primary`). Wired in S4.01: on click, if there is NO auth token → redirect to
 * `/login`; otherwise `POST /api/checkout { product_id }` → `{ url }` → full-page redirect to the
 * returned url (the dev-only `/checkout/mock`). The component knows ONLY "redirect to {url}" —
 * zero payment-gateway awareness (the gateway lives only behind the API's PaymentProvider).
 */
export function BuyNowButton({ productId }: { productId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleBuyNow() {
    setError(undefined);

    // Auth gate: no token → send them to sign in first.
    if (!useAuthStore.getState().token) {
      router.push("/login");
      return;
    }

    setPending(true);
    try {
      const { url } = await api<{ url: string }>("/checkout", {
        method: "POST",
        body: JSON.stringify({ product_id: productId }),
      });
      // Hand off to the hosted checkout (with FakePaymentProvider, the dev /checkout/mock page).
      window.location.href = url;
    } catch (err) {
      setPending(false);
      setError(
        err instanceof ApiError ? err.message : "Couldn't start checkout. Please try again.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" className="w-full" onClick={handleBuyNow} disabled={pending}>
        {pending ? "Starting checkout…" : "Buy Now"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

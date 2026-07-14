"use client";

import { useCallback, useState } from "react";

import { api, ApiError } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth/AuthModal";

/**
 * BuyNowButton (13_Component_Map.md) — the ONLY primary action on the page (shadcn Button default
 * = solid navy `primary`). `POST /api/checkout { product_id }` → `{ url }` → full-page redirect to
 * the returned url (the dev-only `/checkout/mock`). The component knows ONLY "redirect to {url}" —
 * zero payment-gateway awareness (the gateway lives only behind the API's PaymentProvider).
 *
 * AUTH INTERCEPTION: clicking Buy Now while logged out used to `router.push('/login')`, which threw
 * the buyer out of the listing and lost the purchase context. It now opens the inline `AuthModal`
 * over the current page — no route change — and on successful sign-in/registration the ORIGINAL
 * action resumes automatically: checkout starts for the SAME product. The buyer never lands on
 * /login or /account.
 *
 * The navbar is untouched: its "Sign in" / "Get started" still navigate to the /login and /register
 * pages. This modal is an additional path used only for the purchase-interception case.
 */
export function BuyNowButton({ productId }: { productId: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [authOpen, setAuthOpen] = useState(false);

  /** The actual purchase. Called directly when authed, or resumed after the modal authenticates. */
  const startCheckout = useCallback(async () => {
    setError(undefined);
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
  }, [productId]);

  function handleBuyNow() {
    setError(undefined);

    // Auth gate: no token → intercept with the modal instead of navigating away.
    if (!useAuthStore.getState().token) {
      setAuthOpen(true);
      return;
    }

    void startCheckout();
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        size="lg"
        className="w-full"
        onClick={handleBuyNow}
        disabled={pending}
        loading={pending}
      >
        {pending ? "Starting checkout…" : "Buy Now"}
      </Button>

      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}

      {/* The token is already in the store by the time `onAuthenticated` fires (setAuth runs first
          in the form's onSuccess), so the resumed checkout call is authenticated. */}
      <AuthModal
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthenticated={() => void startCheckout()}
      />
    </div>
  );
}

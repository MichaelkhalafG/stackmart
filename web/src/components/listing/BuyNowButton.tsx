"use client";

import { Button } from "@/components/ui/button";

/**
 * BuyNowButton (13_Component_Map.md) — the ONLY primary action on the page. Uses the shadcn Button
 * default variant = solid `primary` (navy `#0c2239` after the MDN rebrand; the retired green
 * `#1f883d` referenced in older docs no longer exists in the palette). Client component so S4.01
 * can wire checkout onto it: `POST /api/checkout { product_id }` → `{ url }` → redirect. The
 * checkout flow is intentionally NOT built here (S4.x) — the frontend will know only "redirect
 * to {url}", with zero payment-gateway awareness.
 */
export function BuyNowButton({ productId }: { productId: number }) {
  // TODO(S4.01): const { url } = await api('/checkout', { method: 'POST', body: { product_id: productId } }); window.location.href = url;
  return (
    <Button size="lg" className="w-full" data-product-id={productId}>
      Buy Now
    </Button>
  );
}

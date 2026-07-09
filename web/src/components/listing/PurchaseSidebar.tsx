import { formatPrice } from "@/components/product/MarketplaceCard";

import { BuyNowButton } from "./BuyNowButton";
import type { ProductDetail } from "./types";

/**
 * PurchaseSidebar (13_Component_Map.md) — the repo-page "About" box: mono price + Buy Now, sticky
 * on desktop. Directly UNDER Buy Now is the S2.04 SEAM where Live Demo / View Repository buttons
 * slot in (their data — `demo_url`/`repository_url` — is already on `product`, but the buttons are
 * NOT built here). Server-safe wrapper; the interactive Buy Now is its own client component.
 */
export function PurchaseSidebar({ product }: { product: ProductDetail }) {
  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="flex flex-col gap-4 rounded-md border border-border bg-canvas p-5">
        <div>
          <div className="mono text-2xl font-semibold text-fg">
            {formatPrice(product.price_cents, product.currency)}
          </div>
          <p className="mt-1 text-xs text-fg-muted">
            One-time purchase · full source code + license key
          </p>
        </div>

        <BuyNowButton productId={product.id} />

        {/*
          ── S2.04 SEAM ──────────────────────────────────────────────────────────────
          Live Demo (secondary) + View Repository (outline, RepoIcon) render HERE, directly
          under Buy Now, ONLY when product.demo_url / product.repository_url exist. Built in
          S2.04 (repoProvider + RepoIcon). Left intentionally empty for now.
        */}
        <div className="flex flex-col gap-3 empty:hidden" data-slot="demo-repo-actions" />

        <ul className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-fg-muted">
          <li>Instant digital delivery</li>
          <li>Secure ZIP download</li>
          <li>Unique license key on payment</li>
        </ul>
      </div>
    </aside>
  );
}

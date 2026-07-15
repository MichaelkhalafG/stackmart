import { revenueMultiple } from "@/lib/catalog";
import { formatPrice } from "@/components/product/MarketplaceCard";

import { BuyNowButton } from "./BuyNowButton";
import { DemoRepoButtons } from "./DemoRepoButtons";
import type { ProductDetail } from "./types";

/**
 * PurchaseSidebar (13_Component_Map.md) — the repo-page "About" box: mono price + Buy Now, sticky
 * on desktop. Directly UNDER Buy Now is the S2.04 SEAM where Live Demo / View Repository buttons
 * slot in (their data — `demo_url`/`repository_url` — is already on `product`, but the buttons are
 * NOT built here). Server-safe wrapper; the interactive Buy Now is its own client component.
 */
export function PurchaseSidebar({ product }: { product: ProductDetail }) {
  // Pay-vs-earn cue: the asking price as a multiple of monthly revenue. `null` (so omitted) when
  // the listing publishes no MRR — never divides by zero.
  const multiple = revenueMultiple(product.price_cents, product.metrics?.mrr ?? null);

  return (
    <aside className="lg:sticky lg:top-20 lg:self-start">
      <div className="flex flex-col gap-4 rounded-md border border-border bg-canvas p-5">
        <div>
          {/* Asking price = the dominant figure a buyer PAYS: labelled, navy, big and bold — set
              clearly apart from the MRR the business EARNS (a metric in the Metrics grid). */}
          <div className="text-[11px] tracking-[0.06em] text-fg-muted uppercase">Price</div>
          <div className="mono mt-0.5 text-3xl font-bold text-primary">
            {formatPrice(product.price_cents, product.currency)}
          </div>
          {multiple ? (
            <div className="mono mt-1 text-xs text-fg-muted">{multiple}</div>
          ) : null}
          <p className="mt-1.5 text-xs text-fg-muted">
            One-time purchase · full source code + license key
          </p>
        </div>

        <BuyNowButton productId={product.id} />

        {/*
          Demo / Repository buttons (S2.04) — directly under Buy Now, each rendered ONLY when its
          URL exists (06_UI_System.md §3). Live Demo = secondary, View Repository = outline; neither
          is green so Buy Now stays the sole primary. `empty:hidden` collapses the row when both
          URLs are null (DemoRepoButtons returns null).
        */}
        <div className="flex flex-col gap-3 empty:hidden" data-slot="demo-repo-actions">
          <DemoRepoButtons demoUrl={product.demo_url} repositoryUrl={product.repository_url} />
        </div>

        <ul className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-fg-muted">
          <li>Instant digital delivery</li>
          <li>Secure ZIP download</li>
          <li>Unique license key on payment</li>
        </ul>
      </div>
    </aside>
  );
}

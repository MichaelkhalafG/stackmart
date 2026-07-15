import { Container } from "@/components/layout/Container";
import { MarketplaceBackdrop } from "@/components/marketplace/MarketplaceBackdrop";

/**
 * The 1280px page container for `/marketplace` (moved down from the root layout so the landing can
 * be full-bleed). Wraps the page AND its `loading.tsx`, so width and padding are unchanged.
 *
 * Two decorative layers sit BEHIND the content in a full-width `relative` wrapper, so they span the
 * page edge-to-edge while every opaque card / filter panel paints over them:
 *   - `.mkt-backdrop` — the coding-grid + navy/royal gradient-mesh wash (all viewports);
 *   - `MarketplaceBackdrop` — the faint IBM Plex Mono code motif (a browse terminal + filter query),
 *     the same treatment as /sell, confined to the outer margins and shown only where there's room
 *     for it (see that component). Together they read like the /sell page's live-terminal background.
 * Both are `pointer-events-none`, so they never intercept taps.
 */
export default function MarketplaceSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="mkt-backdrop pointer-events-none absolute inset-0" aria-hidden />
      <MarketplaceBackdrop />
      {/* `max-md:pt-0` lets the page's mobile MobilePageHeader band sit flush under the navbar. */}
      <Container className="relative py-6 max-md:pt-0">{children}</Container>
    </div>
  );
}

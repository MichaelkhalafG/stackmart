import { Container } from "@/components/layout/Container";

/**
 * The 1280px page container for `/marketplace` (moved down from the root layout so the landing can
 * be full-bleed). Wraps the page AND its `loading.tsx`, so width and padding are unchanged.
 *
 * The `.mkt-backdrop` layer is a full-page branded wash (coding-grid + navy/royal gradient mesh)
 * that sits BEHIND the content — it's `absolute inset-0` in a full-width `relative` wrapper, so it
 * spans the whole page edge-to-edge (texturing the mobile side gutters and the space around the
 * grid / sidebar / empty + loading states) while every opaque card paints over it. `pointer-events-none`
 * so it never intercepts taps; static, so there's nothing for reduced-motion to disable.
 */
export default function MarketplaceSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <div className="mkt-backdrop pointer-events-none absolute inset-0" aria-hidden />
      <Container className="relative py-6">{children}</Container>
    </div>
  );
}

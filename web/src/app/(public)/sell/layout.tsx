import { Container } from "@/components/layout/Container";
import { SellBackdrop } from "@/components/sell/SellBackdrop";

/**
 * The `/sell` section shell.
 *
 * Provides the branded, full-bleed backdrop (soft gradient base + the coding motif, see
 * `SellBackdrop`) and then the standard 1280px page container on top of it. The backdrop is a
 * sibling BEHIND the content — the container is `relative`, so the form and its heading always
 * paint above it, and the motif's mask keeps it out of the central column entirely.
 *
 * Living in the layout (not the page) means the backdrop is also present for `loading.tsx`, so the
 * page doesn't flash a plain white background before the form appears. Container width and padding
 * are unchanged.
 *
 * OVERFLOW: from `md` up, clip only X (`overflow-x-clip`, not `hidden`) and leave Y visible —
 * `overflow:hidden` makes a scroll container that kills the desktop rail's `position:sticky`; `clip`
 * doesn't. Below `md` (no sticky rail) it keeps plain `overflow-hidden`.
 */
export default function SellSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sell-base relative overflow-hidden md:overflow-x-clip md:overflow-y-visible">
      <SellBackdrop />
      {/* `max-md:pb-0`: the mobile form supplies its own `mb-24` clearance for the fixed bottom nav,
          so the container's default bottom padding just stacked dead space beneath it. */}
      <Container className="relative py-6 max-md:pt-0 max-md:pb-0">{children}</Container>
    </div>
  );
}

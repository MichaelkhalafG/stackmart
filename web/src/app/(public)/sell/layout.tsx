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
 */
export default function SellSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="sell-base relative overflow-hidden">
      <SellBackdrop />
      <Container className="relative py-6">{children}</Container>
    </div>
  );
}

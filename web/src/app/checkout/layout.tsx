import { Container } from "@/components/layout/Container";

/**
 * The 1280px page container for the checkout routes (moved down from the root layout so the
 * landing can be full-bleed). Width and padding are unchanged.
 */
export default function CheckoutSectionLayout({ children }: { children: React.ReactNode }) {
  return <Container className="py-6">{children}</Container>;
}

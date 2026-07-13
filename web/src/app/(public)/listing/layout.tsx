import { Container } from "@/components/layout/Container";

/**
 * The 1280px page container for the listing detail (moved down from the root layout so the landing
 * can be full-bleed). Wraps the page AND its `loading.tsx`, so width and padding are unchanged.
 */
export default function ListingSectionLayout({ children }: { children: React.ReactNode }) {
  return <Container className="py-6">{children}</Container>;
}

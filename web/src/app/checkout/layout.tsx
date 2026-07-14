import { Container } from "@/components/layout/Container";
import { SiteChrome } from "@/components/layout/SiteChrome";

/**
 * The checkout routes — site chrome (navbar + footer) over a branded backdrop.
 *
 * The backdrop is the same language as the auth screens: a soft lavender/royal gradient mesh
 * (`.auth-base`) with a faint navy dot grid (`.auth-grid`), whose radial mask clears the centre so
 * the checkout card always sits on a clean surface. All four checkout screens (mock, success,
 * cancel, the error boundary) inherit it, so the flow reads as one designed sequence.
 */
export default function CheckoutSectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome>
      <div className="auth-base relative min-h-[70vh] overflow-hidden">
        <div className="auth-grid pointer-events-none absolute inset-0" aria-hidden />
        <Container className="relative py-10 sm:py-14">{children}</Container>
      </div>
    </SiteChrome>
  );
}

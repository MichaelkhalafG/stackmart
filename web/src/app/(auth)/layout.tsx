import { Container } from "@/components/layout/Container";

/**
 * The 1280px page container for the auth routes. It used to live in the root layout, but the
 * landing design is full-bleed, so each non-landing section now applies it. Width and padding are
 * unchanged from before (`container-page` + `py-6`).
 */
export default function AuthSectionLayout({ children }: { children: React.ReactNode }) {
  return <Container className="py-6">{children}</Container>;
}

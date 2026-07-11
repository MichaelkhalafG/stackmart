import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";

/**
 * Centered auth card layout shared by /login, /register and /forgot-password.
 * Server-safe (no hooks) — the interactive form is passed in as children. Uses the
 * shadcn Card as-is (padding controlled on an inner wrapper, mirroring MarketplaceCard)
 * with 06_UI_System.md tokens.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Container className="flex justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-fg-muted">{subtitle}</p> : null}
        </div>
        <Card className="gap-0 p-0">
          <div className="p-6">{children}</div>
        </Card>
        {footer ? (
          <div className="mt-4 text-center text-sm text-fg-muted">{footer}</div>
        ) : null}
      </div>
    </Container>
  );
}

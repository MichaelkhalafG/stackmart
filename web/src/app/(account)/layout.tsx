import { SiteChrome } from "@/components/layout/SiteChrome";
import { AccountGuard } from "@/components/layout/AccountGuard";

/**
 * The /account* route group — site chrome (navbar + footer) wrapping the client auth guard.
 *
 * This layout used to BE the guard (a client component). It is now a Server Component so it can
 * render `<SiteChrome>` (which fetches the header's mega-menu data on the server); the guard itself
 * moved to `components/layout/AccountGuard.tsx` unchanged — same hydration-safe token check, same
 * redirect to /login, same Container width.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteChrome>
      <AccountGuard>{children}</AccountGuard>
    </SiteChrome>
  );
}

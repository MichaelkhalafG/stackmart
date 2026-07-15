"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/auth";
import { Container } from "@/components/layout/Container";

/**
 * Guard for every /account* route (S3.03). Extracted VERBATIM from the old `(account)/layout.tsx`
 * so that layout could become a Server Component (it now also renders the site chrome, which needs
 * a server-side fetch). The auth logic below is unchanged.
 *
 * The auth store persists to localStorage with `skipHydration`, so the token is null until the
 * provider rehydrates on the client. We must wait for hydration to finish BEFORE deciding —
 * otherwise an authenticated user would be wrongly bounced to /login on a hard reload.
 *
 * `useSyncExternalStore` reads the hydration flag in an SSR-safe way: the server snapshot is
 * always `false` (and never touches `useAuthStore.persist`, which isn't available during
 * prerender), while the client subscribes to `onFinishHydration`. Once hydrated: no token →
 * redirect to /login; token present → render the account pages. Client-only (Sanctum Bearer is
 * client state; authenticated pages are client components — 08_Frontend_Architecture.md).
 */
export function AccountGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useSyncExternalStore(
    (onStoreChange) => useAuthStore.persist.onFinishHydration(onStoreChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  // Until we know the real auth state (or while redirecting an anonymous visitor), show a
  // neutral placeholder rather than flashing protected content.
  // The 1280px container lives here (it moved out of the root layout so the landing can be
  // full-bleed) — width and padding are unchanged for every /account route.
  if (!hydrated || !token) {
    return (
      <Container className="py-6">
        <p className="py-16 text-sm text-fg-muted">Loading…</p>
      </Container>
    );
  }

  return <Container className="py-6">{children}</Container>;
}

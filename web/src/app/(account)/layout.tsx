"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Container } from "@/components/layout/Container";
import { useAuthStore } from "@/store/auth";

/**
 * Guard for every /account* route (S3.03). The auth store persists to localStorage with
 * `skipHydration`, so the token is null until the provider rehydrates on the client. We
 * therefore wait for hydration to finish BEFORE deciding — otherwise an authenticated user
 * would be wrongly bounced to /login on a hard reload. Once hydrated: no token → redirect
 * to /login; token present → render the account pages (S3.05). Client-only (Sanctum Bearer
 * is client state; authenticated pages are client components — 08_Frontend_Architecture.md).
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  // Initializer captures the "already hydrated" case (e.g. navigating in from another page);
  // the subscription below flips it when the provider's rehydrate() finishes on first load.
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    // Effects run child-first, so this subscription is in place before the provider's
    // rehydrate() call fires onFinishHydration. setState only in the callback (not the
    // effect body) — the recommended external-store subscription pattern.
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  // Until we know the real auth state (or while redirecting an anonymous visitor), show a
  // neutral placeholder rather than flashing protected content.
  if (!hydrated || !token) {
    return (
      <Container className="py-16">
        <p className="text-sm text-fg-muted">Loading…</p>
      </Container>
    );
  }

  return <>{children}</>;
}

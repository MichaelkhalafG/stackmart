"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { Container } from "./Container";
import { UserMenu } from "./UserMenu";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sell", label: "Sell" },
];

/**
 * App header — GitHub light-header pattern (06_UI_System.md §2): white bar with a 1px bottom
 * border; logo left, search (shadcn Input) center, nav + auth control right.
 *
 * AUTH-AWARE (S5.07): the auth store persists with `skipHydration`, so `token`/`user` are null on
 * the server AND the first client render. We read a hydration flag via `useSyncExternalStore` (the
 * same SSR-safe pattern as the `(account)` guard: server snapshot `false`, client subscribes to
 * `onFinishHydration`) and render a neutral placeholder in the auth slot until hydration finishes —
 * so the server and first client render match (no hydration mismatch). After hydration: a signed-in
 * user gets the `UserMenu` (avatar + Sign out); a signed-out visitor gets Sign in / Sign up.
 */
export function Header() {
  const user = useAuthStore((state) => state.user);
  const hydrated = useSyncExternalStore(
    (onStoreChange) => useAuthStore.persist.onFinishHydration(onStoreChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas">
      <Container className="flex h-14 items-center gap-3">
        <Link href="/" className="shrink-0 text-base font-semibold tracking-tight text-fg">
          STACKMART
        </Link>

        {/* Search (center) — shadcn Input as-is */}
        <div className="relative mx-auto hidden w-full max-w-sm md:block">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-fg-muted"
          />
          <Input
            type="search"
            placeholder="Search products…"
            aria-label="Search products"
            className="h-8 bg-canvas-subtle pl-8"
          />
        </div>

        {/* Right: nav links + auth control */}
        <nav className="ml-auto flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-2 py-1 text-sm text-fg-muted hover:bg-muted hover:text-fg"
            >
              {l.label}
            </Link>
          ))}

          {/* Auth slot — hydration-safe: neutral placeholder until the store rehydrates. */}
          {!hydrated ? (
            <div className="ml-1 size-8 shrink-0" aria-hidden />
          ) : user ? (
            <UserMenu user={user} />
          ) : (
            <div className="ml-1 flex items-center gap-1">
              <Link
                href="/login"
                className="rounded-md px-2 py-1 text-sm text-fg-muted hover:bg-muted hover:text-fg"
              >
                Sign in
              </Link>
              <Link href="/register" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </Container>
    </header>
  );
}

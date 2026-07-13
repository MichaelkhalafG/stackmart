"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import { categoryInitials, formatCompactMoney, type CategoryWithCount, type FeaturedProduct } from "@/lib/catalog";
import { Logo } from "./Logo";
import { UserMenu } from "./UserMenu";

/** Nav links. "How it works" / "About" anchor the landing sections (those routes don't exist yet). */
const NAV_LINKS = [
  { href: "/sell", label: "Sell your SaaS" },
  { href: "/#how", label: "How it works" },
  { href: "/#about", label: "About" },
];

/**
 * Site header — the approved landing design (feat/landing-redesign).
 *
 * Sticky, translucent (72% canvas + 14px backdrop blur), gaining a deeper background + shadow once
 * scrolled past 10px. Left: the MDN logo lockup. Centre: nav, where "Marketplace" opens a mega-menu
 * built from REAL categories (passed down from the root layout's server fetch) plus a promo card for
 * the real top featured listing. Right: auth slot. Below `lg` the nav collapses to a hamburger that
 * opens the slide-in drawer, exactly as designed.
 *
 * Responsive behaviour is pure CSS (`lg:` breakpoints), not a JS media query, so the server and
 * first client render always agree — no hydration mismatch.
 *
 * AUTH-AWARE (preserves S5.07): the auth store persists with `skipHydration`, so we read a hydration
 * flag via `useSyncExternalStore` (server snapshot `false`) and hold a neutral placeholder until it
 * rehydrates. Signed in → `UserMenu`; signed out → the design's "Sign in" + navy "Get started".
 */
export function Header({
  categories = [],
  promo = null,
}: {
  categories?: CategoryWithCount[];
  promo?: FeaturedProduct | null;
}) {
  const user = useAuthStore((state) => state.user);
  const hydrated = useSyncExternalStore(
    (onStoreChange) => useAuthStore.persist.onFinishHydration(onStoreChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );

  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Mega-menu open/close.
   *
   * The menu is HOVER/FOCUS-only — it never intercepts the click, so "Marketplace" behaves as a
   * plain link to /marketplace. Closing is deferred by a short grace period, which (together with
   * the menu's transparent top bridge, see `MegaMenu`) means moving the cursor diagonally from the
   * trigger down into the panel can never fall through a dead zone and dismiss it.
   */
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const openMega = useCallback(() => {
    cancelClose();
    setMegaOpen(true);
  }, [cancelClose]);

  const closeMegaSoon = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setMegaOpen(false), 160);
  }, [cancelClose]);

  const closeMegaNow = useCallback(() => {
    cancelClose();
    setMegaOpen(false);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  // Scroll state drives the header's background + shadow (design: threshold 10px).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes whichever overlay is open.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMegaOpen(false);
      setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll while the mobile drawer is open (design behaviour).
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[60] border-b border-border backdrop-blur-[14px] transition-[background-color,box-shadow] duration-200",
          scrolled ? "bg-canvas/92 shadow-header" : "bg-canvas/72",
        )}
      >
        <div className="container-page flex items-center gap-7 py-3">
          <Logo />

          {/* ── Desktop nav (lg and up) ───────────────────────────────────────── */}
          <div className="hidden flex-1 items-center justify-between gap-6 lg:flex">
            <nav className="flex items-center gap-1 text-[15px] font-medium whitespace-nowrap">
              {/* The wrapper is the hover region: the panel is a DOM descendant of it, so moving the
                  cursor from the trigger into the panel never leaves this element. */}
              <div
                className="relative"
                onMouseEnter={openMega}
                onMouseLeave={closeMegaSoon}
                onFocus={openMega}
                onBlur={(event) => {
                  // Only close when focus leaves the trigger AND the panel entirely.
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    closeMegaNow();
                  }
                }}
              >
                {/* A real link: clicking always navigates to /marketplace. The menu is hover/focus
                    only and never steals the click. */}
                <Link
                  href="/marketplace"
                  aria-expanded={megaOpen}
                  aria-haspopup="true"
                  onClick={closeMegaNow}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[15px] font-medium text-fg transition-colors hover:bg-canvas-subtle hover:text-accent"
                >
                  Marketplace
                  <ChevronDown className="size-3" strokeWidth={2.4} aria-hidden />
                </Link>

                {megaOpen ? (
                  <MegaMenu categories={categories} promo={promo} onNavigate={closeMegaNow} />
                ) : null}
              </div>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-md px-3 py-2 text-fg transition-colors hover:bg-canvas-subtle hover:text-accent"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth slot — neutral placeholder until the persisted store rehydrates. */}
            <div className="flex flex-none items-center gap-4 whitespace-nowrap">
              {!hydrated ? (
                <div className="h-[38px] w-[150px]" aria-hidden />
              ) : user ? (
                <UserMenu user={user} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-[15px] font-medium text-fg transition-colors hover:text-accent"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="shadow-cta-hover rounded-md border border-primary bg-primary px-[18px] py-[9px] text-[15px] font-semibold text-primary-foreground transition-[background-color,box-shadow] duration-200 hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* ── Mobile trigger (below lg) ─────────────────────────────────────── */}
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className="ml-auto flex size-[42px] items-center justify-center rounded-md border border-border bg-canvas text-primary lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>
        </div>
      </header>

      {/* ── Mobile drawer ───────────────────────────────────────────────────── */}
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[90] bg-primary/40 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            onClick={(event) => event.stopPropagation()}
            className="anim-slide-in absolute top-0 right-0 flex h-full w-[min(320px,86vw)] flex-col bg-canvas p-5 shadow-drawer"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
                className="flex size-[38px] items-center justify-center rounded-md border border-border bg-canvas-subtle text-primary"
              >
                <X className="size-[18px]" aria-hidden />
              </button>
            </div>

            <nav className="mt-6 flex flex-col gap-0.5 text-[17px] font-medium">
              <Link
                href="/marketplace"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-2.5 py-3 text-primary hover:bg-canvas-subtle"
              >
                Marketplace
              </Link>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md px-2.5 py-3 text-primary hover:bg-canvas-subtle"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-2 flex flex-col gap-3 border-t border-border pt-5">
              {hydrated && user ? (
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md border border-border px-3 py-3 text-center text-base font-semibold text-primary hover:bg-canvas-subtle"
                >
                  Your account
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md border border-border px-3 py-3 text-center text-base font-semibold text-primary hover:bg-canvas-subtle"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md border border-primary bg-primary px-3 py-3 text-center text-base font-semibold text-primary-foreground hover:bg-primary-emphasis"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** The Marketplace mega-menu: real categories on the left, the real top featured listing on the right. */
function MegaMenu({
  categories,
  promo,
  onNavigate,
}: {
  categories: CategoryWithCount[];
  promo: FeaturedProduct | null;
  onNavigate: () => void;
}) {
  return (
    /* The outer element starts flush at the trigger's bottom edge (`top-full`) and carries the
       design's 14px offset as TRANSPARENT top padding. That padding is a hoverable part of the
       menu, so it bridges the gap — the cursor never crosses dead space on its way down, and the
       panel only closes once it leaves both the trigger and the menu. */
    <div className="absolute top-full -left-2 z-[70] pt-[14px]">
      <div className="anim-fade grid w-[680px] max-w-[78vw] grid-cols-[1.4fr_1fr] gap-[22px] rounded-[10px] border border-border bg-canvas p-[22px] shadow-mega">
        <div>
          <div className="mb-3.5 text-[11px] font-semibold tracking-[0.08em] text-fg-muted uppercase">
            Browse by category
          </div>

          {categories.length > 0 ? (
            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/marketplace?category=${encodeURIComponent(category.slug)}`}
                  onClick={onNavigate}
                  className="flex items-center gap-[11px] rounded-md p-[9px] transition-colors hover:bg-canvas-subtle"
                >
                  <span className="flex size-[30px] flex-none items-center justify-center rounded-md bg-tag-bg text-[13px] font-bold text-accent">
                    {categoryInitials(category.name)}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-primary">{category.name}</span>
                    {category.count !== null ? (
                      <span className="mono text-[11px] text-fg-muted">{category.count}</span>
                    ) : null}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-fg-muted">
              Categories appear here once the catalog is published.
            </p>
          )}
        </div>

        {promo ? (
          <div className="bg-navy-gradient flex flex-col justify-between rounded-lg p-[18px] text-canvas">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-[3px] text-[10px] font-bold text-accent-foreground">
                Featured
              </span>
              <div className="mt-3 text-[17px] font-bold">{promo.title}</div>
              <div className="mt-1 line-clamp-2 text-xs leading-[1.45] text-canvas/70">
                {promo.tagline}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between">
              <span className="mono text-[13px] text-tag-bg">
                {promo.mrr !== null
                  ? `${formatCompactMoney(promo.mrr, promo.currency)} MRR`
                  : formatCompactMoney(promo.price_cents / 100, promo.currency)}
              </span>
              <Link
                href={`/listing/${promo.slug}`}
                onClick={onNavigate}
                className="text-xs font-semibold text-canvas hover:text-tag-bg"
              >
                View →
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

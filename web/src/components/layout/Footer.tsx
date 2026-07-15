import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { Logo } from "./Logo";

/**
 * Site footer — the approved landing design: the MDN logo lockup + blurb, then three link
 * columns, then a legal bar. The design's footer sits on the LIGHT canvas, so the logo uses its
 * navy variant here (the `light` variant exists for dark surfaces).
 *
 * TWO FOOTERS, ONE PER FORM FACTOR. Restacking the desktop footer on a phone produced an endless
 * ~13-link column that buried the copyright a full screen below the fold. So below `md` a
 * PURPOSE-BUILT mobile footer renders instead (`md:hidden`), and the approved desktop footer
 * (`hidden md:block`) is untouched:
 *
 *   brand + tagline → the two primary CTAs as full-width buttons → the three link groups as
 *   COLLAPSED accordion sections → a single compact legal row → copyright.
 *
 * The accordions are native `<details>`/`<summary>`: no JS, no state, no client component, and
 * therefore no hydration risk in this Server Component (a JS accordion here would have forced the
 * whole footer client-side for the sake of a disclosure toggle). They ship collapsed, which is what
 * turns 13 stacked links into three 48px rows.
 *
 * Both footers render from the SAME `COLUMNS` / `LEGAL` constants — the mobile footer is a second
 * layout of the same data, never a second copy of it.
 *
 * The Resources column now resolves to the real `/guidelines` page (the buyer/seller guides and the
 * FAQ are its sections, linked by anchor), and the legal bar resolves to the real `/terms` and
 * `/privacy` pages. The remaining marketing destinations (Cookies, Careers, Blog, Contact) are
 * still `href="#"` placeholders, as in the approved design — they become real links when those
 * pages ship (marketing).
 */
const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse listings", href: "/marketplace" },
      { label: "Categories", href: "/#about" },
      { label: "Featured", href: "/#marketplace" },
      { label: "Sell your SaaS", href: "/sell" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/#about" },
      { label: "Careers", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Guidelines", href: "/guidelines" },
      { label: "Seller guide", href: "/guidelines#for-sellers" },
      { label: "Buyer guide", href: "/guidelines#for-buyers" },
      { label: "How it works", href: "/#how" },
      { label: "FAQ", href: "/guidelines#faq" },
    ],
  },
];

const LEGAL = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Cookies", href: "#" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-canvas">
      {/* ── DESKTOP footer (md+) — the approved design, unchanged ───────────── */}
      <div className="container-page hidden pt-[clamp(48px,6vw,76px)] pb-8 md:block">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-x-8 gap-y-10">
          <div className="min-w-[200px]">
            <Logo size="footer" />
            <p className="mt-4 max-w-[270px] text-sm leading-[1.55] text-fg-muted">
              The curated marketplace for buying and selling vetted, profitable micro-SaaS.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <div className="text-[13px] font-semibold tracking-[0.06em] text-primary uppercase">
                {column.title}
              </div>
              <div className="mt-4 flex flex-col gap-2.5 text-sm">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-fg-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-[13px] text-fg-muted">
          <span>© {year} MDN STACKMART, Inc. All rights reserved.</span>
          <div className="flex flex-wrap gap-[22px]">
            {LEGAL.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-fg-muted transition-colors hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE footer (< md) — purpose-built, not a restack ─────────────── */}
      <div className="container-page pt-10 pb-7 md:hidden">
        <Logo size="footer" />
        <p className="mt-3 max-w-[300px] text-sm leading-[1.55] text-fg-muted">
          The curated marketplace for buying and selling vetted, profitable micro-SaaS.
        </p>

        {/* The two things a visitor actually comes here to do, as real buttons. */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/marketplace"
            className="flex min-h-12 items-center justify-center rounded-md border border-primary bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Browse listings
          </Link>
          <Link
            href="/sell"
            className="flex min-h-12 items-center justify-center rounded-md border border-border bg-canvas px-5 text-[15px] font-semibold text-primary transition-colors hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Sell your SaaS
          </Link>
        </div>

        {/* Collapsed by default — three 48px rows instead of thirteen stacked links. Native
            <details>, so this stays a Server Component and needs no JS to open. */}
        <div className="mt-7 border-t border-border">
          {COLUMNS.map((column) => (
            <details key={column.title} className="group border-b border-border">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between py-1 text-[13px] font-semibold tracking-[0.06em] text-primary uppercase [&::-webkit-details-marker]:hidden">
                {column.title}
                <ChevronDown
                  aria-hidden
                  className="size-4 text-fg-muted transition-transform duration-200 group-[[open]]:rotate-180 motion-reduce:transition-none"
                />
              </summary>

              <div className="flex flex-col pb-2">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex min-h-11 items-center text-sm text-fg-muted transition-colors hover:text-accent"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
          ))}
        </div>

        {/* Legal: one compact row, then the copyright. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]">
          {LEGAL.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex min-h-11 items-center text-fg-muted transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p className="mt-2 text-[12px] leading-relaxed text-fg-muted">
          © {year} MDN STACKMART, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

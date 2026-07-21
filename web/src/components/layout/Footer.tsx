import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { SHOW_SELL } from "@/lib/config";
import { Logo } from "./Logo";

/**
 * Site footer — dark navy coding surface (`.panel-navy` + `.grid-motif-hero`). Desktop: logo +
 * tagline + status chip + three link columns + legal row. Mobile (`md:hidden`): brand, two CTA
 * buttons, link groups as native `<details>` accordions (no JS — stays a Server Component), legal.
 *
 * Every href is a real route or an anchor that exists on its target (`/#about`, `/#how`,
 * `/guidelines#faq`). The old dead links (About/Careers/Blog/Contact/Cookies, `/how-it-works`) are gone.
 */
const COLUMNS: Array<{ title: string; links: Array<{ label: string; href: string }> }> = [
  {
    title: "Marketplace",
    links: [
      { label: "Browse listings", href: "/marketplace" },
      { label: "Categories", href: "/#about" },
      ...(SHOW_SELL ? [{ label: "List your SaaS", href: "/sell" }] : []),
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Guidelines", href: "/guidelines" },
      { label: "FAQ", href: "/guidelines#faq" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Create account", href: "/register" },
    ],
  },
];

/** Brand tagline — printed in both the desktop and the mobile footer. */
const TAGLINE = SHOW_SELL
  ? "The curated marketplace for buying and selling vetted, profitable micro-SaaS."
  : "The curated marketplace for acquiring vetted, profitable micro-SaaS.";

const LEGAL = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
];

/** lavender focus ring — visible on navy (royal isn't). */
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tag-bg";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="panel-navy relative overflow-hidden text-canvas">
      {/* Faint navy grid + a royal top-edge accent line — the coding-section language. */}
      <div className="grid-motif-hero pointer-events-none absolute inset-0" aria-hidden />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent"
        aria-hidden
      />

      {/* ── DESKTOP (md+) ──────────────────────────────────────────────────── */}
      <div className="relative z-10 container-page hidden pt-[clamp(52px,6vw,80px)] pb-9 md:block">
        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-x-8 gap-y-10">
          <div className="max-w-[320px]">
            <Logo size="footer" variant="light" />
            <p className="mt-4 text-sm leading-[1.6] text-canvas/65">{TAGLINE}</p>
            <p className="mono mt-5 inline-flex items-center gap-2 rounded-md border border-canvas/15 bg-canvas/5 px-2.5 py-1.5 text-[11.5px] tracking-wide text-tag-bg/85">
              <span
                className="anim-pulse-dot inline-block size-1.5 rounded-full bg-accent"
                aria-hidden
              />
              curated · code-audited · shipped
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <div className="mono text-[11px] font-semibold tracking-[0.14em] text-tag-bg/70 uppercase">
                {column.title}
              </div>
              <ul className="mt-4 flex flex-col gap-2.5 text-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`rounded-sm text-canvas/65 transition-colors hover:text-canvas ${FOCUS}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-canvas/10 pt-6 text-[13px] text-canvas/55">
          <span>© {year} MDN STACKMART, Inc. All rights reserved.</span>
          <div className="flex flex-wrap gap-6">
            {LEGAL.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-sm text-canvas/60 transition-colors hover:text-canvas ${FOCUS}`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── MOBILE (< md) — purpose-built, not a restack ───────────────────── */}
      <div className="relative z-10 container-page pt-10 pb-8 md:hidden">
        <Logo size="footer" variant="light" />
        <p className="mt-3 max-w-[300px] text-sm leading-[1.55] text-canvas/65">{TAGLINE}</p>
        <p className="mono mt-4 inline-flex items-center gap-2 text-[11px] tracking-wide text-tag-bg/80">
          <span
            className="anim-pulse-dot inline-block size-1.5 rounded-full bg-accent"
            aria-hidden
          />
          curated · code-audited · shipped
        </p>

        {/* The two things a visitor comes here to do, as real buttons. */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/marketplace"
            className="flex min-h-12 items-center justify-center rounded-md bg-tag-bg px-5 text-[15px] font-semibold text-primary transition-colors hover:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Browse listings
          </Link>
          {SHOW_SELL ? (
            <Link
              href="/sell"
              className={`flex min-h-12 items-center justify-center rounded-md border border-canvas/25 px-5 text-[15px] font-semibold text-canvas transition-colors hover:border-canvas/45 hover:bg-canvas/10 ${FOCUS}`}
            >
              List your SaaS
            </Link>
          ) : null}
        </div>

        {/* Compact collapsed groups — native <details>, so no JS and no hydration cost. */}
        <div className="mt-8 border-t border-canvas/10">
          {COLUMNS.map((column) => (
            <details key={column.title} className="group border-b border-canvas/10">
              <summary className="mono flex min-h-12 cursor-pointer list-none items-center justify-between py-1 text-[11px] font-semibold tracking-[0.12em] text-tag-bg/75 uppercase [&::-webkit-details-marker]:hidden">
                {column.title}
                <ChevronDown
                  aria-hidden
                  className="size-4 text-canvas/50 transition-transform duration-200 group-[[open]]:rotate-180 motion-reduce:transition-none"
                />
              </summary>
              <ul className="flex flex-col pb-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`flex min-h-11 items-center rounded-sm text-[14px] text-canvas/70 transition-colors hover:text-canvas ${FOCUS}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>

        {/* Legal row, then copyright. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px]">
          {LEGAL.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`flex min-h-11 items-center rounded-sm text-canvas/60 transition-colors hover:text-canvas ${FOCUS}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-canvas/55">
          © {year} MDN STACKMART, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

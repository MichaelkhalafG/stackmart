import Link from "next/link";

import { Logo } from "./Logo";

/**
 * Site footer — the approved landing design: the MDN logo lockup + blurb, then three link
 * columns, then a legal bar. The design's footer sits on the LIGHT canvas, so the logo uses its
 * navy variant here (the `light` variant exists for dark surfaces).
 *
 * Some destinations are marketing/legal pages that do not exist yet (Terms, Privacy, Careers,
 * Blog, Contact, the guides, FAQ). They are `href="#"` placeholders in the approved design too —
 * see the report; they become real links when those pages ship (S5.04 + marketing).
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
      { label: "Seller guide", href: "#" },
      { label: "Buyer guide", href: "#" },
      { label: "How it works", href: "/#how" },
      { label: "FAQ", href: "#" },
    ],
  },
];

const LEGAL = [
  { label: "Terms", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Cookies", href: "#" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-canvas">
      <div className="container-page pt-[clamp(48px,6vw,76px)] pb-8">
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
          <span>© {new Date().getFullYear()} MDN STACKMART, Inc. All rights reserved.</span>
          <div className="flex gap-[22px]">
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
    </footer>
  );
}

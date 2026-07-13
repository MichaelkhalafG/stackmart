import Link from "next/link";

import { Container } from "./Container";

const footerLinks = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/sell", label: "Sell your project" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

/** Simple bordered footer, muted text, links to the static pages (13_Component_Map.md). */
export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-canvas">
      <Container className="flex flex-col gap-3 py-6 text-sm text-fg-muted sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} MDN STACKMART — curated micro-SaaS marketplace.</p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          {footerLinks.map((l) => (
            <Link key={l.href} href={l.href} className="text-fg-muted hover:text-accent">
              {l.label}
            </Link>
          ))}
        </nav>
      </Container>
    </footer>
  );
}

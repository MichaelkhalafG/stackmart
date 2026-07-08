"use client";

import Link from "next/link";
import { Search, User } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Container } from "./Container";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sell", label: "Sell" },
];

/**
 * App header — GitHub light-header pattern (06_UI_System.md §2): white bar with a 1px
 * bottom border; logo left, search (shadcn Input) center, nav + avatar dropdown right.
 * Auth state is a PLACEHOLDER (unauthenticated) — real auth wiring is S3.03 (Day 3).
 */
export function Header() {
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

        {/* Right: nav links + placeholder avatar dropdown */}
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

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Account menu"
              className="ml-1 inline-flex size-8 items-center justify-center rounded-full border border-border bg-canvas text-fg-muted transition-colors hover:bg-muted hover:text-fg focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <User className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuLabel>Not signed in</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/login" />}>Sign in</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/register" />}>
                Create account
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem render={<Link href="/account" />}>Your account</DropdownMenuItem>
              <DropdownMenuItem render={<Link href="/account/purchases" />}>
                Your purchases
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </Container>
    </header>
  );
}

"use client";

import { type MouseEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

/** Windowed page list: always first + last, plus current ±1, with ellipses for gaps. */
function pageItems(current: number, last: number): Array<number | "ellipsis"> {
  const pages = new Set<number>([1, last]);
  for (let i = current - 1; i <= current + 1; i += 1) {
    if (i >= 1 && i <= last) pages.add(i);
  }
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  let previous = 0;
  for (const page of sorted) {
    if (page - previous > 1) items.push("ellipsis");
    items.push(page);
    previous = page;
  }
  return items;
}

/**
 * MarketplacePagination — reads `{meta}` and writes `?page=` (13_Component_Map.md). Anchors carry a
 * real `href` (shareable) but navigate via `onPage` (client-side, no reload). Hidden on a single page.
 *
 * Two on-brand layouts: a compact Prev · "Page X / Y" (mono) · Next row on phones (≥44px tap
 * targets, matching the 4-per-page mobile grid), and the full numbered pager plus a mono
 * "Page X of Y" caption on desktop.
 */
export function MarketplacePagination({
  meta,
  onPage,
  buildHref,
}: {
  meta: PaginationMeta;
  onPage: (page: number) => void;
  buildHref: (page: number) => string;
}) {
  const { current_page, last_page } = meta;
  if (last_page <= 1) return null;

  const go = (page: number) => (event: MouseEvent) => {
    event.preventDefault();
    onPage(page);
  };

  const prev = Math.max(1, current_page - 1);
  const next = Math.min(last_page, current_page + 1);
  const atStart = current_page <= 1;
  const atEnd = current_page >= last_page;

  const stepClass =
    "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-canvas px-4 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent aria-disabled:pointer-events-none aria-disabled:opacity-40";

  return (
    <nav aria-label="Pagination" className="flex flex-col items-center gap-3 pt-2">
      {/* MOBILE (< md): compact Prev · indicator · Next. */}
      <div className="flex w-full items-center gap-3 md:hidden">
        <a
          href={buildHref(prev)}
          onClick={go(prev)}
          aria-disabled={atStart}
          tabIndex={atStart ? -1 : undefined}
          className={stepClass}
        >
          <ChevronLeft className="size-4" aria-hidden />
          Prev
        </a>
        <span className="mono flex-none text-[13px] whitespace-nowrap text-fg-muted">
          Page <span className="font-semibold text-primary">{current_page}</span> / {last_page}
        </span>
        <a
          href={buildHref(next)}
          onClick={go(next)}
          aria-disabled={atEnd}
          tabIndex={atEnd ? -1 : undefined}
          className={stepClass}
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </a>
      </div>

      {/* DESKTOP (md+): numbered pager + mono caption. */}
      <div className="hidden w-full flex-col items-center gap-2 md:flex">
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={buildHref(prev)}
                onClick={go(prev)}
                aria-disabled={atStart}
                tabIndex={atStart ? -1 : undefined}
                className={atStart ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>

            {pageItems(current_page, last_page).map((item, index) =>
              item === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    href={buildHref(item)}
                    onClick={go(item)}
                    isActive={item === current_page}
                    className="mono"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              ),
            )}

            <PaginationItem>
              <PaginationNext
                href={buildHref(next)}
                onClick={go(next)}
                aria-disabled={atEnd}
                tabIndex={atEnd ? -1 : undefined}
                className={atEnd ? "pointer-events-none opacity-50" : undefined}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
        <p className="mono text-xs text-fg-muted">
          Page <span className="font-semibold text-primary">{current_page}</span> of {last_page}
        </p>
      </div>
    </nav>
  );
}

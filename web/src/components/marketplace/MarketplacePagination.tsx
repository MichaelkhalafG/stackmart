"use client";

import { type MouseEvent } from "react";

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
 * MarketplacePagination — shadcn Pagination as-is, reading `{meta}` and writing `?page=`
 * (13_Component_Map.md). Anchors carry a real `href` (shareable) but navigate via `onPage`
 * (client-side, no reload). Hidden when there's a single page.
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

  return (
    <Pagination className="justify-center pt-2">
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
  );
}

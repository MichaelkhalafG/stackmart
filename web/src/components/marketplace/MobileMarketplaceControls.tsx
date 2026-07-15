"use client";

import { useRef, useState } from "react";
import type { TouchEvent } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { SlidersHorizontal, X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Category } from "@/lib/catalog";

import { COMMON_STACKS } from "./FilterSidebar";
import { MarketplaceSearch } from "./MarketplaceSearch";
import { PriceRange } from "./PriceRange";
import { SortSelect, type SortValue } from "./SortSelect";

const ALL = "__all";

/**
 * MobileMarketplaceControls (< md only) — the products-first mobile UX. Above the grid sits a
 * compact, sticky control bar (search + a Sort control + a "Filters" button carrying an
 * active-filter count badge); everything heavier — Category, Tech stack, Price — lives one tap away
 * in a bottom-sheet drawer, so the user sees products immediately instead of scrolling past filters.
 *
 * The drawer is the base-ui Dialog primitive (same one the shadcn Dialog is built on), so it comes
 * with a focus trap, Escape-to-close, backdrop click-to-close, body-scroll lock and `aria-modal` for
 * free; we add a grab handle + swipe-down-to-close and a slide-up animation. It renders the SAME
 * filter controls as the desktop sidebar and drives the SAME callbacks — this is layout only, the
 * filter/search/sort logic and URL params are unchanged.
 *
 * Desktop is untouched: this whole component is `md:hidden`, and the drawer can only be opened from
 * the (hidden-on-desktop) bar.
 */
export function MobileMarketplaceControls({
  search,
  onSearch,
  sort,
  onSort,
  categories,
  category,
  stack,
  minCents,
  maxCents,
  resultCount,
  hasActiveFilters,
  onCategory,
  onStack,
  onPrice,
  onClear,
}: {
  search: string;
  onSearch: (value: string) => void;
  sort: SortValue;
  onSort: (value: SortValue) => void;
  categories: Category[];
  category: string;
  stack: string;
  minCents: string;
  maxCents: string;
  resultCount: number | null;
  hasActiveFilters: boolean;
  onCategory: (slug: string | null) => void;
  onStack: (stack: string | null) => void;
  onPrice: (minCents: number | null, maxCents: number | null) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);

  // The badge counts only the filters BEHIND the button — category, tech stack and price (search and
  // sort live in the bar itself). Price counts once whether one or both bounds are set.
  const drawerCount =
    (category ? 1 : 0) + (stack ? 1 : 0) + (minCents || maxCents ? 1 : 0);

  const countLabel =
    resultCount === null ? "…" : `${resultCount} result${resultCount === 1 ? "" : "s"}`;

  // Swipe-down-to-close, tracked on the header/handle only so it never fights the body scroll.
  const dragStart = useRef<number | null>(null);
  const onDragStart = (e: TouchEvent<HTMLDivElement>) => {
    dragStart.current = e.touches[0]?.clientY ?? null;
  };
  const onDragMove = (e: TouchEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    if ((e.touches[0]?.clientY ?? 0) - dragStart.current > 70) {
      dragStart.current = null;
      setOpen(false);
    }
  };
  const onDragEnd = () => {
    dragStart.current = null;
  };

  return (
    <div className="sticky top-16 z-30 -mx-4 flex flex-col gap-2.5 border-b border-border bg-canvas/95 px-4 pt-1 pb-3 backdrop-blur-sm md:hidden">
      <MarketplaceSearch value={search} onSearch={onSearch} />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-fg-muted">Sort</span>
          <SortSelect value={sort} onChange={onSort} />
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          className="inline-flex min-h-11 flex-none items-center gap-2 rounded-md border border-border bg-canvas px-3.5 text-sm font-semibold text-fg transition-colors hover:border-primary hover:bg-canvas-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <SlidersHorizontal className="size-4 text-fg-muted" aria-hidden />
          Filters
          {drawerCount > 0 ? (
            <span className="mono inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-bold text-accent-foreground">
              {drawerCount}
            </span>
          ) : null}
        </button>
      </div>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-[130] bg-primary-emphasis/55 duration-200 supports-backdrop-filter:backdrop-blur-xs data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0" />
          <DialogPrimitive.Popup className="fixed inset-x-0 bottom-0 z-[131] flex max-h-[88svh] flex-col rounded-t-2xl bg-canvas text-fg ring-1 ring-foreground/10 duration-300 outline-none data-closed:animate-out data-closed:slide-out-to-bottom data-open:animate-in data-open:slide-in-from-bottom">
            {/* Grab handle + header — a branded navy coding-motif band; also the swipe-to-close zone. */}
            <div
              onTouchStart={onDragStart}
              onTouchMove={onDragMove}
              onTouchEnd={onDragEnd}
              className="mesh-hero-visual relative overflow-hidden rounded-t-2xl"
            >
              <div className="grid-motif-hero absolute inset-0" aria-hidden />
              <div className="relative">
                <div className="mx-auto mt-2.5 h-1.5 w-10 rounded-full bg-canvas/30" aria-hidden />
                <div className="flex items-center justify-between gap-3 px-5 pt-3 pb-4">
                  <div className="flex items-center gap-2.5">
                    <SlidersHorizontal className="size-4 text-canvas" aria-hidden />
                    <DialogPrimitive.Title className="text-base font-semibold text-primary-foreground">
                      Filters
                    </DialogPrimitive.Title>
                    <span className="mono rounded-full bg-canvas/15 px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      {countLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {hasActiveFilters ? (
                      <button
                        type="button"
                        onClick={onClear}
                        className="rounded-md px-2 py-1.5 text-xs font-semibold text-primary-foreground/85 hover:text-primary-foreground"
                      >
                        Clear all
                      </button>
                    ) : null}
                    <DialogPrimitive.Close
                      aria-label="Close filters"
                      className="flex size-10 items-center justify-center rounded-md text-primary-foreground/80 transition-colors hover:bg-canvas/10 hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <X className="size-[18px]" aria-hidden />
                    </DialogPrimitive.Close>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable filter body. */}
            <div className="flex flex-1 flex-col gap-7 overflow-y-auto overscroll-contain border-t border-border px-5 py-5">
              {/* Category */}
              <div className="flex flex-col gap-1">
                <span className="mb-1 border-l-2 border-accent/60 pl-2 text-xs font-semibold tracking-wide text-fg-muted uppercase">
                  Category
                </span>
                <RadioGroup
                  value={category || ALL}
                  onValueChange={(value) => onCategory(value === ALL ? null : String(value))}
                >
                  <Label className="min-h-11 cursor-pointer items-center font-normal">
                    <RadioGroupItem value={ALL} />
                    <span>All categories</span>
                  </Label>
                  {categories.map((item) => (
                    <Label key={item.id} className="min-h-11 cursor-pointer items-center font-normal">
                      <RadioGroupItem value={item.slug} />
                      <span>{item.name}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Tech stack */}
              <div className="flex flex-col gap-1">
                <span className="mb-1 border-l-2 border-accent/60 pl-2 text-xs font-semibold tracking-wide text-fg-muted uppercase">
                  Tech stack
                </span>
                <RadioGroup
                  value={stack || ALL}
                  onValueChange={(value) => onStack(value === ALL ? null : String(value))}
                >
                  <Label className="min-h-11 cursor-pointer items-center font-normal">
                    <RadioGroupItem value={ALL} />
                    <span>Any stack</span>
                  </Label>
                  {COMMON_STACKS.map((item) => (
                    <Label key={item} className="min-h-11 cursor-pointer items-center font-normal">
                      <RadioGroupItem value={item} />
                      <span>{item}</span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <span className="border-l-2 border-accent/60 pl-2 text-xs font-semibold tracking-wide text-fg-muted uppercase">
                  Price
                </span>
                <PriceRange minCents={minCents} maxCents={maxCents} onCommit={onPrice} />
              </div>
            </div>

            {/* Apply / close — filters already apply live, so this just confirms and dismisses. */}
            <div className="border-t border-border p-4">
              <DialogPrimitive.Close className="flex min-h-12 w-full items-center justify-center rounded-md bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-emphasis focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
                Show {countLabel}
              </DialogPrimitive.Close>
            </div>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </div>
  );
}

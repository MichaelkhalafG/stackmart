"use client";

import { useCallback, useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PackageOpen, SearchX } from "lucide-react";

import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarketplaceCard, type ProductListItem } from "@/components/product/MarketplaceCard";
import type { Category } from "@/lib/catalog";

import { Blankslate } from "./Blankslate";
import { FilterSidebar } from "./FilterSidebar";
import { MarketplacePagination, type PaginationMeta } from "./MarketplacePagination";
import { MarketplaceSearch } from "./MarketplaceSearch";
import { MobileMarketplaceControls } from "./MobileMarketplaceControls";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { SORT_OPTIONS, SortSelect, type SortValue } from "./SortSelect";

type ProductsResponse = { data: ProductListItem[]; meta: PaginationMeta };
type CategoriesResponse = { data: Category[] };

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);

function parseSort(raw: string | null): SortValue {
  return raw && (SORT_VALUES as string[]).includes(raw) ? (raw as SortValue) : "newest";
}

/** Page size by form factor: a phone caps at 4 per page (no endless scroll); desktop uses 12. */
const MOBILE_PER_PAGE = 4;
const DESKTOP_PER_PAGE = 12;

const MOBILE_QUERY = "(max-width: 767px)";
function subscribeMobile(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(MOBILE_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
/** SSR-safe viewport check — server snapshot is `false`, the client re-reads matchMedia on mount. */
function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeMobile,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

/**
 * MarketplaceBrowser (S2.02) — the URL-driven marketplace. Every filter (search, category, stack,
 * min_price, max_price, sort, page) lives in the query string, so results are shareable and
 * back/forward works. Reads go through TanStack Query + the `lib/api.ts` wrapper against the
 * frozen `GET /api/products` contract; `keepPreviousData` keeps the grid stable across pages.
 * Client component — the parent page wraps it in <Suspense> for `useSearchParams`.
 */
export function MarketplaceBrowser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const stack = searchParams.get("stack") ?? "";
  const minCents = searchParams.get("min_price") ?? "";
  const maxCents = searchParams.get("max_price") ?? "";
  const sort = parseSort(searchParams.get("sort"));
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);

  // Phones page at 4, desktop at 12. Driven by matchMedia so it reacts to rotation/resize.
  const perPage = useIsMobile() ? MOBILE_PER_PAGE : DESKTOP_PER_PAGE;

  // Write params to the URL. Any filter change resets pagination; page changes don't.
  const setParams = useCallback(
    (updates: Record<string, string | null>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, value);
      }
      if (resetPage) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  const onSearch = useCallback((value: string) => setParams({ search: value || null }), [setParams]);
  const onCategory = useCallback((slug: string | null) => setParams({ category: slug }), [setParams]);
  const onStack = useCallback((value: string | null) => setParams({ stack: value }), [setParams]);
  const onPrice = useCallback(
    (min: number | null, max: number | null) =>
      setParams({ min_price: min ? String(min) : null, max_price: max ? String(max) : null }),
    [setParams],
  );
  const onSort = useCallback(
    (value: SortValue) => setParams({ sort: value === "newest" ? null : value }),
    [setParams],
  );
  const onPage = useCallback((next: number) => setParams({ page: next > 1 ? String(next) : null }, false), [setParams]);
  const onClear = useCallback(() => router.replace(pathname, { scroll: false }), [router, pathname]);

  const buildPageHref = useCallback(
    (next: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (next > 1) params.set("page", String(next));
      else params.delete("page");
      const qs = params.toString();
      return qs ? `${pathname}?${qs}` : pathname;
    },
    [searchParams, pathname],
  );

  const apiQuery = useMemo(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (stack) params.set("stack", stack);
    if (minCents) params.set("min_price", minCents);
    if (maxCents) params.set("max_price", maxCents);
    if (sort !== "newest") params.set("sort", sort);
    if (perPage !== DESKTOP_PER_PAGE) params.set("per_page", String(perPage));
    if (page > 1) params.set("page", String(page));
    return params.toString();
  }, [search, category, stack, minCents, maxCents, sort, perPage, page]);

  const productsQuery = useQuery({
    queryKey: ["products", apiQuery],
    queryFn: () => api<ProductsResponse>(`/products${apiQuery ? `?${apiQuery}` : ""}`),
    placeholderData: keepPreviousData,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => api<CategoriesResponse>("/categories"),
    staleTime: 5 * 60 * 1000,
  });

  const products = productsQuery.data?.data ?? [];
  const meta = productsQuery.data?.meta ?? null;
  const categories = categoriesQuery.data?.data ?? [];
  const hasActiveFilters = Boolean(
    search || category || stack || minCents || maxCents || sort !== "newest",
  );

  // Keep `page` in range when the page size changes (e.g. rotating a phone from 4→12 per page, or a
  // deep-linked page beyond the result set): snap to the last page instead of showing an empty grid.
  useEffect(() => {
    if (meta && meta.total > 0 && page > meta.last_page) {
      onPage(meta.last_page);
    }
  }, [meta, page, onPage]);

  // Return the user to the top of the RESULTS whenever the result set changes from an action —
  // paging, sorting, searching, or any filter apply/clear (incl. from the mobile drawer). Without
  // this, `router.replace(..., { scroll: false })` leaves them scrolled down by the pagination and
  // the new products load out of view above them.
  //
  // Keyed on the user-facing query signature, so it fires exactly on those changes and is skipped on
  // the initial mount / a deep-linked URL. `per_page` is deliberately excluded — it changes on
  // viewport resize (4↔12), which must NOT yank the scroll. We scroll the results section (not the
  // document top) so the branded page header isn't re-read every time; `scroll-mt` clears the sticky
  // header. Reduced-motion gets an instant jump instead of a smooth scroll.
  const resultsRef = useRef<HTMLElement>(null);
  const scrollToResults = useCallback(() => {
    const el = resultsRef.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, []);

  const contentKey = `${search}|${category}|${stack}|${minCents}|${maxCents}|${sort}|${page}`;
  const lastContentKey = useRef(contentKey);
  useEffect(() => {
    if (lastContentKey.current === contentKey) return;
    lastContentKey.current = contentKey;
    scrollToResults();
  }, [contentKey, scrollToResults]);

  return (
    <div className="py-2">
      {/* Branded section header — the same coding language as the landing: a subtle canvas mesh
          under a faint navy grid, a mono "terminal" line, the navy heading, and a live mono count. */}
      <header className="mesh-categories relative mb-6 overflow-hidden rounded-2xl border border-border px-5 py-6 sm:px-8 sm:py-8">
        <div className="mkt-grid absolute inset-0" aria-hidden />
        <div className="relative">
          <div className="mono mb-2 flex items-center gap-2 text-[12.5px] text-accent">
            <span className="text-fg-muted">$</span> browse --vetted
            <span className="anim-blink inline-block h-[13px] w-[7px] bg-accent align-middle" aria-hidden />
          </div>
          <h1 className="text-[1.65rem] leading-tight font-bold tracking-tight text-primary sm:text-[2rem]">
            Marketplace
          </h1>
          <p className="mt-1.5 max-w-prose text-sm text-fg-muted">
            Browse vetted micro-SaaS products, web apps, and codebases — evaluate each with a live
            demo and repository review.
          </p>
          {meta ? (
            <p className="mono mt-4 text-[13px] text-fg-muted">
              <span className="font-semibold text-primary">{meta.total}</span> listing
              {meta.total === 1 ? "" : "s"} available
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[248px_1fr]">
        <FilterSidebar
          categories={categories}
          category={category}
          stack={stack}
          minCents={minCents}
          maxCents={maxCents}
          resultCount={meta?.total ?? null}
          hasActiveFilters={hasActiveFilters}
          onCategory={onCategory}
          onStack={onStack}
          onPrice={onPrice}
          onClear={onClear}
        />

        <section ref={resultsRef} className="flex scroll-mt-24 flex-col gap-4">
          {/* MOBILE (< md): products-first. A compact sticky bar (search + sort + a Filters button
              with a count badge) sits above the grid; Category/Stack/Price move into its drawer. */}
          <MobileMarketplaceControls
            search={search}
            onSearch={onSearch}
            sort={sort}
            onSort={onSort}
            categories={categories}
            category={category}
            stack={stack}
            minCents={minCents}
            maxCents={maxCents}
            resultCount={meta?.total ?? null}
            hasActiveFilters={hasActiveFilters}
            onCategory={onCategory}
            onStack={onStack}
            onPrice={onPrice}
            onClear={onClear}
          />

          {/* DESKTOP (md+): the original inline search + sort row, unchanged. */}
          <div className="hidden md:flex md:items-center md:justify-between md:gap-3">
            <MarketplaceSearch value={search} onSearch={onSearch} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-fg-muted">Sort</span>
              <SortSelect value={sort} onChange={onSort} />
            </div>
          </div>

          {/* MOBILE result count above the grid. */}
          {meta && !productsQuery.isError ? (
            <p className="-mt-1 text-sm text-fg-muted md:hidden">
              <span className="mono font-semibold text-fg">{meta.total}</span>{" "}
              result{meta.total === 1 ? "" : "s"}
            </p>
          ) : null}

          {productsQuery.isPending ? (
            <ProductGridSkeleton count={perPage === MOBILE_PER_PAGE ? 4 : 6} />
          ) : productsQuery.isError ? (
            <Blankslate
              icon={<PackageOpen className="size-8" />}
              title="Couldn't load listings"
              description="The catalog service didn't respond. Check your connection and try again."
              action={
                <button
                  type="button"
                  onClick={() => productsQuery.refetch()}
                  className={cn(buttonVariants({ variant: "outline" }))}
                >
                  Retry
                </button>
              }
            />
          ) : products.length === 0 ? (
            <Blankslate
              icon={<SearchX className="size-8" />}
              title="No products found"
              description="No listings match these filters yet. Try broadening your search or clearing filters."
              action={
                hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={onClear}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Clear filters
                  </button>
                ) : (
                  <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
                    Back to home
                  </Link>
                )
              }
            />
          ) : (
            <>
              <div
                aria-busy={productsQuery.isFetching}
                className={cn(
                  "grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3",
                  productsQuery.isFetching && "opacity-60",
                )}
              >
                {products.map((product) => (
                  <MarketplaceCard key={product.id} product={product} />
                ))}
              </div>
              {meta ? (
                <MarketplacePagination meta={meta} onPage={onPage} buildHref={buildPageHref} />
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

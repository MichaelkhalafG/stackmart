"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { PackageOpen, SearchX } from "lucide-react";

import { api } from "@/lib/api";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarketplaceCard, type ProductListItem } from "@/components/product/MarketplaceCard";
import type { Category } from "@/components/home/CategoryStrip";

import { Blankslate } from "./Blankslate";
import { FilterSidebar } from "./FilterSidebar";
import { MarketplacePagination, type PaginationMeta } from "./MarketplacePagination";
import { MarketplaceSearch } from "./MarketplaceSearch";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import { SORT_OPTIONS, SortSelect, type SortValue } from "./SortSelect";

type ProductsResponse = { data: ProductListItem[]; meta: PaginationMeta };
type CategoriesResponse = { data: Category[] };

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);

function parseSort(raw: string | null): SortValue {
  return raw && (SORT_VALUES as string[]).includes(raw) ? (raw as SortValue) : "newest";
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
    if (page > 1) params.set("page", String(page));
    return params.toString();
  }, [search, category, stack, minCents, maxCents, sort, page]);

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

  return (
    <div className="py-2">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">Marketplace</h1>
        <p className="text-sm text-fg-muted">
          Browse vetted micro-SaaS products, web apps, and codebases.
        </p>
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

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <MarketplaceSearch value={search} onSearch={onSearch} />
            <div className="flex items-center gap-2">
              <span className="text-sm text-fg-muted">Sort</span>
              <SortSelect value={sort} onChange={onSort} />
            </div>
          </div>

          {productsQuery.isPending ? (
            <ProductGridSkeleton />
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

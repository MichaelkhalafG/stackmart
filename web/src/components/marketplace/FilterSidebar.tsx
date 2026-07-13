"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { Category } from "@/lib/catalog";

import { PriceRange } from "./PriceRange";

const ALL = "__all";

/**
 * Common tech stacks offered as a quick single-select filter → `?stack=` (matched server-side via
 * JSON_CONTAINS, 12_API_Specification.md). NOTE: there is no stack-enumeration endpoint and the
 * `GET /api/products` list item does not include `tech_stack`, so a curated list is the pragmatic
 * source of options; a selection that matches nothing simply yields the Blankslate.
 */
const COMMON_STACKS = [
  "Laravel",
  "Next.js",
  "React",
  "Vue",
  "Node.js",
  "Python",
  "TypeScript",
  "Tailwind CSS",
];

/**
 * FilterSidebar (13_Component_Map.md) — category + tech stack (shadcn RadioGroup, single-select
 * each per the frozen contract) + PriceRange, with a result counter Badge and selected states.
 * All changes flow up to the URL via the callbacks.
 */
export function FilterSidebar({
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
  return (
    <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-fg">Filters</h2>
          <Badge variant="outline">
            {resultCount === null ? "…" : `${resultCount} result${resultCount === 1 ? "" : "s"}`}
          </Badge>
        </div>
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-accent hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      {/* Category */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
          Category
        </span>
        <RadioGroup
          value={category || ALL}
          onValueChange={(value) => onCategory(value === ALL ? null : String(value))}
        >
          <Label className="cursor-pointer font-normal">
            <RadioGroupItem value={ALL} />
            <span>All categories</span>
          </Label>
          {categories.map((item) => (
            <Label key={item.id} className="cursor-pointer font-normal">
              <RadioGroupItem value={item.slug} />
              <span>{item.name}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Tech stack */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wide text-fg-muted uppercase">
          Tech stack
        </span>
        <RadioGroup
          value={stack || ALL}
          onValueChange={(value) => onStack(value === ALL ? null : String(value))}
        >
          <Label className="cursor-pointer font-normal">
            <RadioGroupItem value={ALL} />
            <span>Any stack</span>
          </Label>
          {COMMON_STACKS.map((item) => (
            <Label key={item} className="cursor-pointer font-normal">
              <RadioGroupItem value={item} />
              <span>{item}</span>
            </Label>
          ))}
        </RadioGroup>
      </div>

      {/* Price */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold tracking-wide text-fg-muted uppercase">Price</span>
        <PriceRange minCents={minCents} maxCents={maxCents} onCommit={onPrice} />
      </div>
    </aside>
  );
}

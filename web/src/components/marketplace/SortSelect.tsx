"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** Sort options → the `sort` query param (12_API_Specification.md). */
export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** SortSelect — shadcn Select as-is; writes `?sort=` (13_Component_Map.md). */
export function SortSelect({
  value,
  onChange,
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SortValue)}>
      <SelectTrigger aria-label="Sort products" className="h-8 w-[168px]">
        <SelectValue placeholder="Sort" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import type { ProductCategory } from "@/components/product/MarketplaceCard";

/** metrics{} block from GET /api/products/{slug} (12_API_Specification.md). `founded` is a string year. */
export type ProductMetrics = {
  mrr?: number;
  users?: number;
  founded?: string | number;
  profit?: number;
};

/** One FAQ entry from the detail payload. */
export type ProductFaq = { q: string; a: string };

/**
 * Full listing shape from `GET /api/products/{slug}` (the FROZEN contract, 12_API_Specification.md).
 * `demo_url`/`repository_url` are nullable and consumed by S2.04 (buttons); exposed here so the
 * purchase card can leave a data seam.
 */
export type ProductDetail = {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  price_cents: number;
  currency: string;
  status: string;
  category: ProductCategory | null;
  demo_url: string | null;
  repository_url: string | null;
  images: string[];
  tech_stack: string[];
  metrics: ProductMetrics | null;
  included: string[];
  faq: ProductFaq[] | null;
  is_featured: boolean;
  published_at: string | null;
};

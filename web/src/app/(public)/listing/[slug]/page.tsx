import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { FaqAccordion } from "@/components/listing/FaqAccordion";
import { ListingGallery } from "@/components/listing/ListingGallery";
import { MetricsGrid } from "@/components/listing/MetricsGrid";
import { ProductJsonLd } from "@/components/listing/ProductJsonLd";
import { PurchaseSidebar } from "@/components/listing/PurchaseSidebar";
import { TechStackChips } from "@/components/listing/TechStackChips";
import type { ProductDetail } from "@/components/listing/types";

/**
 * `/listing/[slug]` — public listing detail, Server Component + ISR (08_Frontend_Architecture.md).
 * Fetches the frozen `GET /api/products/{slug}` contract on the server (no token) and renders the
 * repo-page layout: content left, sticky purchase card right. Unknown slug → framework 404.
 * (SEO metadata + JSON-LD = S2.05; demo/repo buttons = S2.04 — a seam is left in PurchaseSidebar.)
 */
export const revalidate = 300;

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function getProduct(slug: string): Promise<ProductDetail | null> {
  // No API base configured (e.g. build without env) → treat as not found; a real request fetches live.
  if (!API_BASE) return null;

  const res = await fetch(`${API_BASE}/products/${encodeURIComponent(slug)}`, {
    next: { revalidate },
    headers: { Accept: "application/json" },
  });

  if (res.status === 404) return null; // contract 404 shape → framework notFound()
  if (!res.ok) throw new Error(`Failed to load product "${slug}" (${res.status})`);

  const json = (await res.json()) as { data?: ProductDetail };
  return json.data ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug); // deduped with the page fetch (same request)
  if (!product) return { title: "Listing not found" };

  const description = product.tagline || product.description?.slice(0, 200);
  const ogImage = product.images?.[0]; // OG image = the product's FIRST image

  return {
    title: product.title,
    description,
    alternates: { canonical: `/listing/${product.slug}` },
    openGraph: {
      type: "website",
      url: `/listing/${product.slug}`,
      title: product.title,
      description,
      siteName: "STACKMART",
      images: ogImage ? [{ url: ogImage, alt: product.title }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: product.title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return (
    <div className="py-2">
      <ProductJsonLd product={product} />

      {/* Header row (title + status labels), full width */}
      <div className="flex flex-col gap-3 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {product.category ? (
            <Link
              href={`/marketplace?category=${encodeURIComponent(product.category.slug)}`}
              className="inline-flex items-center rounded-full bg-tag-bg px-2 py-0.5 text-xs font-medium text-tag-fg hover:underline"
            >
              {product.category.name}
            </Link>
          ) : null}
          {product.is_featured ? (
            <span className="inline-flex items-center rounded-full bg-highlight px-2 py-0.5 text-xs font-medium text-fg">
              Featured
            </span>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-fg sm:text-3xl">
          {product.title}
        </h1>
        <p className="max-w-2xl text-base text-fg-muted">{product.tagline}</p>
      </div>

      {/* Repo-page layout: content left, sticky purchase card right */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex min-w-0 flex-col gap-8">
          <ListingGallery images={product.images} title={product.title} />

          {product.description ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-fg">About this product</h2>
              <div className="text-sm leading-relaxed whitespace-pre-line text-fg-muted">
                {product.description}
              </div>
            </section>
          ) : null}

          {product.metrics ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-fg">Metrics</h2>
              <MetricsGrid metrics={product.metrics} currency={product.currency} />
            </section>
          ) : null}

          {product.included?.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-fg">What&apos;s included</h2>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {product.included.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-fg">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {product.tech_stack?.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-fg">Tech stack</h2>
              <TechStackChips stack={product.tech_stack} />
            </section>
          ) : null}

          {product.faq?.length ? (
            <section className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-fg">FAQ</h2>
              <FaqAccordion faq={product.faq} />
            </section>
          ) : null}
        </div>

        <PurchaseSidebar product={product} />
      </div>
    </div>
  );
}

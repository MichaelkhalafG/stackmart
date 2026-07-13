import type { ProductDetail } from "./types";

/** Map product status → schema.org availability. */
function availabilityFor(status: string): string {
  if (status === "published") return "https://schema.org/InStock";
  if (status === "sold") return "https://schema.org/SoldOut";
  return "https://schema.org/OutOfStock";
}

/**
 * ProductJsonLd — injects a JSON-LD `Product` schema on the listing detail (08_Frontend_Architecture.md
 * §2): name, description, image, offers.price (from `price_cents`) + priceCurrency, availability from
 * status. Server component; `<` is escaped so product text can't break out of the script.
 */
export function ProductJsonLd({ product }: { product: ProductDetail }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.tagline || product.description || undefined,
    image: product.images && product.images.length > 0 ? product.images : undefined,
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      price: (product.price_cents / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: availabilityFor(product.status),
    },
  };

  return (
    <script
      type="application/ld+json"
      // JSON-LD requires raw script content; `<` is escaped so product text can't break out.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }}
    />
  );
}

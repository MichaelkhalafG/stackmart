/**
 * JSON-LD helpers (S5.01) — structured-data `<script type="application/ld+json">` emitters for the
 * public pages (08_Frontend_Architecture.md §2). All are Server Components (no client JS). The
 * `Product` schema lives in `listing/ProductJsonLd.tsx`; this file adds the site-level `WebSite` +
 * `Organization` (home) and a reusable `BreadcrumbList`.
 *
 * Absolute URLs resolve from `NEXT_PUBLIC_SITE_URL` (same source as `metadataBase` in the root
 * layout), with a localhost fallback so build/dev never breaks. `<` is escaped so any dynamic text
 * can't break out of the script element.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const SITE_NAME = "STACKMART";
const SITE_DESCRIPTION =
  "A curated marketplace for ready-made micro-SaaS products, web apps, and codebases — evaluate via live demo and repository links, then buy instantly.";

/**
 * Site-wide default OG/Twitter image — the `next/og` route at `app/opengraph-image.tsx`. Pages that
 * export their OWN `openGraph` object override the file-convention image, so they must reference this
 * explicitly. Relative → resolved against `metadataBase`. (Pages with no custom `openGraph`, e.g. the
 * auth pages, already inherit it automatically.)
 */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

function serialize(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Low-level emitter. Accepts an already-built schema.org object. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON-LD needs raw script content; `<` is escaped so dynamic text can't break out.
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}

/** WebSite schema with a SearchAction pointing at the marketplace search (home page). */
export function WebsiteJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        description: SITE_DESCRIPTION,
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/marketplace?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

/** Organization schema (home page) — logo points at the self-contained brand icon. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: `${SITE_URL}/icon.svg`,
        description: SITE_DESCRIPTION,
      }}
    />
  );
}

export type Crumb = { name: string; path: string };

/** BreadcrumbList schema — `path` is site-relative (e.g. "/marketplace"); resolved to absolute here. */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: `${SITE_URL}${crumb.path}`,
        })),
      }}
    />
  );
}

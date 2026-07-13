/**
 * Product image resolution for /web.
 *
 * The API returns `cover_image` / `images[]` as bare relative paths without a leading slash
 * (e.g. "placeholders/launchbase-1.png"), which next/image rejects ("must start with a leading
 * slash or be absolute"). These helpers normalize every product image and supply the single shared
 * default when a product has no real image of its own.
 */

/** The one default product image, served from web/public (copied from api/public/img/default.png). */
export const DEFAULT_PRODUCT_IMAGE = "/img/default.png";

/**
 * Is this "not a real product image"?
 *
 * Two cases collapse to the default:
 *   1. null / "" / whitespace — the product genuinely has no image.
 *   2. a seeded `placeholders/*` path — the dev seed points every listing at a FLAT COLOURED SWATCH
 *      (solid orange/blue/etc. PNGs under web/public/placeholders). Those are mock tiles, not real
 *      product imagery, so they resolve to the default too. Delete this branch (and the seeded
 *      files) once real listing images land — nothing else needs to change.
 *
 * Anything else — an https:// URL, an API-storage path, an uploaded /path — is treated as REAL and
 * passes through untouched.
 */
export function isPlaceholderImage(src: string | null | undefined): boolean {
  const s = src?.trim();
  if (!s) return true;
  return /^\/?placeholders\//i.test(s);
}

/**
 * Normalize a product image path for next/image, WITHOUT applying the default:
 *   null / "" / whitespace       → null   (caller decides what to render)
 *   "http(s)://…" or "//…"       → unchanged (absolute — served via next.config remotePatterns)
 *   "/already/absolute.png"      → unchanged (leading-slash public path)
 *   "placeholders/x.png"         → "/placeholders/x.png" (leading-slash public path)
 *
 * Used where a *real* image is required and a missing one must be detectable — e.g. the listing
 * page's OpenGraph image, which has its own social-card fallback (DEFAULT_OG_IMAGE).
 * For rendering a product image in the UI, prefer `productImageOrDefault`.
 *
 * No hardcoded host — relative names resolve against /web's own `public/` dir.
 */
export function productImageUrl(src: string | null | undefined): string | null {
  const s = src?.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s) || s.startsWith("//") || s.startsWith("/")) return s;
  return `/${s}`;
}

/**
 * The resolver every product image in the UI should use: always returns a renderable `src`.
 * A real image passes through normalized; anything missing or placeholder-ish falls back to the
 * single shared default, so no product ever renders an empty/coloured tile.
 */
export function productImageOrDefault(src: string | null | undefined): string {
  if (isPlaceholderImage(src)) return DEFAULT_PRODUCT_IMAGE;
  return productImageUrl(src) ?? DEFAULT_PRODUCT_IMAGE;
}

/**
 * Resolve a product's `images[]` for the gallery — every entry normalized, placeholders collapsed
 * to the default (deduplicated, so a product whose images are all mock swatches shows the default
 * ONCE rather than N identical thumbnails). Always returns at least one image.
 */
export function productImagesOrDefault(images: string[] | null | undefined): string[] {
  const resolved = (images ?? []).map(productImageOrDefault);
  const unique = [...new Set(resolved)];
  return unique.length > 0 ? unique : [DEFAULT_PRODUCT_IMAGE];
}

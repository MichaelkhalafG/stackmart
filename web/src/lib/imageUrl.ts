/**
 * Product image resolution. The API returns `cover_image`/`images[]` as bare relative paths
 * (e.g. "placeholders/x.png") that next/image rejects; these normalize them and fall back to a
 * shared default when there's no real image.
 */

/** Shared fallback — a branded SVG placeholder (was a landing-page screenshot). */
export const DEFAULT_PRODUCT_IMAGE = "/img/default.svg";

/**
 * True for "no real image": null/blank, or a seeded `placeholders/*` swatch (dev mock tiles).
 * Anything else (https, storage path, uploaded /path) is real.
 * TODO: drop the placeholders/* branch (+ seeded files) once real listing images land.
 */
export function isPlaceholderImage(src: string | null | undefined): boolean {
  const s = src?.trim();
  if (!s) return true;
  return /^\/?placeholders\//i.test(s);
}

/**
 * Normalize a path for next/image without applying the default: blank → null; absolute (http(s)://,
 * //, /…) → unchanged; bare relative → leading-slash. Used where a missing image must be detectable
 * (the listing OG); for UI rendering use `productImageOrDefault`.
 */
export function productImageUrl(src: string | null | undefined): string | null {
  const s = src?.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s) || s.startsWith("//") || s.startsWith("/")) return s;
  return `/${s}`;
}

/** Always returns a renderable src: real image normalized, else the shared default. */
export function productImageOrDefault(src: string | null | undefined): string {
  if (isPlaceholderImage(src)) return DEFAULT_PRODUCT_IMAGE;
  return productImageUrl(src) ?? DEFAULT_PRODUCT_IMAGE;
}

/** Gallery images normalized + deduped (an all-placeholder product shows the default once). */
export function productImagesOrDefault(images: string[] | null | undefined): string[] {
  const resolved = (images ?? []).map(productImageOrDefault);
  const unique = [...new Set(resolved)];
  return unique.length > 0 ? unique : [DEFAULT_PRODUCT_IMAGE];
}

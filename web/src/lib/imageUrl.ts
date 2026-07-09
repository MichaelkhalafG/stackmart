/**
 * Normalize a product image path for next/image (fix branch: fix/cors-and-api-url).
 *
 * The API returns `cover_image` / `images[]` as bare relative paths without a leading slash
 * (e.g. "placeholders/launchbase-1.png"), which next/image rejects ("must start with a leading
 * slash or be absolute"). This resolver makes every product image valid, and is resilient to the
 * future where real images arrive as absolute API-storage URLs:
 *   null / "" / whitespace       → null   (caller renders its existing fallback)
 *   "http(s)://…" or "//…"       → unchanged (absolute — served via next.config remotePatterns)
 *   "/already/absolute.png"      → unchanged (leading-slash public path)
 *   "placeholders/x.png"         → "/placeholders/x.png" (leading-slash public path)
 *
 * No hardcoded host — relative names resolve against /web's own `public/` dir.
 */
export function productImageUrl(src: string | null | undefined): string | null {
  const s = src?.trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s) || s.startsWith("//") || s.startsWith("/")) return s;
  return `/${s}`;
}

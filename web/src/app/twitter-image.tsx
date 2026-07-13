/**
 * Site-wide Twitter/X card image (S5.01). Next does not auto-map `og:image` → `twitter:image`, so
 * we reuse the exact default OpenGraph card for `twitter:image` too. Self-contained (`next/og`).
 */
export { alt, size, contentType, default } from "./opengraph-image";

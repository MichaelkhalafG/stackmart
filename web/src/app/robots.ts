import type { MetadataRoute } from "next";

/**
 * robots.txt (S5.01) — allow crawling of the public marketplace; keep authenticated + transactional
 * routes (account, checkout, auth) out of the index. Sitemap URL is absolute via NEXT_PUBLIC_SITE_URL
 * (same source as `metadataBase`), with a localhost fallback so build/dev never breaks.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/account",
        "/checkout",
        "/login",
        "/register",
        "/forgot-password",
        "/reset-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

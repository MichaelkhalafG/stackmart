import type { NextConfig } from "next";

/**
 * Allow Next/Image to load product images from the API's public storage disk. The host is derived
 * from the NEXT_PUBLIC_API_URL ORIGIN (env-driven, no hardcoded host, no second env var) — the
 * frozen contract serves `images[]`/`cover_image` as absolute URLs on that same host under
 * `/storage/**` (12_API_Specification.md, 08_Frontend_Architecture.md §4). Empty when the env is
 * unset (e.g. an env-less build) — safe, since no remote image is optimized in that case.
 */
function storageRemotePatterns(): NonNullable<NextConfig["images"]>["remotePatterns"] {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return [];
  try {
    const origin = new URL(raw);
    return [
      {
        protocol: origin.protocol.replace(":", "") as "http" | "https",
        hostname: origin.hostname,
        port: origin.port || undefined,
        pathname: "/storage/**",
      },
    ];
  } catch {
    return [];
  }
}

/** The API origin the browser is allowed to talk to and load images from. */
function apiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

/**
 * Content-Security-Policy.
 *
 * `script-src` has to keep `'unsafe-inline'`: Next injects inline bootstrap/hydration scripts on
 * every page, and the only way to drop it is nonces, which need a request-time middleware this app
 * doesn't have. So this CSP is not an XSS *cure* — it is containment: an injected script still can't
 * reach an attacker's host (`connect-src`/`default-src` are locked to self + the API), can't be
 * framed for clickjacking (`frame-ancestors 'none'`), can't retarget a form (`form-action 'self'`),
 * and can't rewrite the document base (`base-uri 'self'`).
 *
 * `'unsafe-eval'` is dev-only — the Next dev overlay/HMR needs it; production builds do not.
 */
function contentSecurityPolicy(isDev: boolean): string {
  const api = apiOrigin();

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    // Tailwind + Next inject inline styles; there is no nonce-free way around this.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob:${api ? ` ${api}` : ""}`,
    "font-src 'self' data:",
    // XHR/fetch targets: our own origin and the API. Nothing else — this is the line that stops an
    // injected script from exfiltrating the auth token.
    `connect-src 'self'${api ? ` ${api}` : ""}${isDev ? " ws: wss:" : ""}`,
    "object-src 'none'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: storageRemotePatterns(),
    // Allow the one first-party SVG (`/img/default.svg`). Safe: uploads are validated raster-only and
    // remotePatterns is `/storage/**`, so no untrusted SVG reaches the optimizer; CSP + attachment
    // disposition harden it regardless.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  /**
   * Security headers for every Next-served response. The auth token lives in localStorage, so an
   * XSS is a full account takeover — these are the cheap layers that make that harder to reach and
   * harder to profit from.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
          // Redundant with frame-ancestors for modern browsers; still read by older ones.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          // Nothing here uses these; deny them rather than inherit browser defaults.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          // 2 years + subdomains. No `preload`: that is a hard-to-reverse commitment to keeping
          // EVERY michaelkhalaf.com subdomain HTTPS-only, and it belongs to a deliberate decision
          // rather than a config default.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

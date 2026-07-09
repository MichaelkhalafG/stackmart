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

const nextConfig: NextConfig = {
  images: {
    remotePatterns: storageRemotePatterns(),
  },
};

export default nextConfig;

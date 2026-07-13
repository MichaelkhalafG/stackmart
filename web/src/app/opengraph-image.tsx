import { ImageResponse } from "next/og";

/**
 * Default OpenGraph image (S5.01) — the site-wide social card used by every route that doesn't
 * supply its own (the listing detail derives its own OG from the product's first image). Generated
 * at build/request with `next/og` (built into Next — no package, no external host: fully
 * self-contained per the task rule). Styled with the brand tokens from Planning/06_UI_System.md
 * (navy canvas + the lavender/royal/amber "stacked layers" mark). PNG output, 1200×630.
 */
export const alt = "STACKMART — a curated marketplace for ready-made micro-SaaS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#0c2239";
const CANVAS = "#ffffff";
const MUTED = "#9aa4b2";
const BARS = ["#dee0ff", "#010ed0", "#fbb002"] as const;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: NAVY,
          padding: "72px 80px",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
        }}
      >
        {/* Brand row: stacked-layers mark + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              width: 96,
              height: 96,
              background: "#0a0d31",
              borderRadius: 18,
              padding: "22px 18px",
              justifyContent: "center",
            }}
          >
            {BARS.map((c) => (
              <div key={c} style={{ height: 14, borderRadius: 7, background: c }} />
            ))}
          </div>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: CANVAS,
              letterSpacing: "-0.02em",
            }}
          >
            STACKMART
          </div>
        </div>

        {/* Headline + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: CANVAS,
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              maxWidth: 960,
            }}
          >
            Buy ready-made micro-SaaS, web apps &amp; codebases
          </div>
          <div style={{ fontSize: 30, color: MUTED, maxWidth: 900 }}>
            Vetted listings · live demo &amp; repo review · instant delivery with full source code + a
            license key
          </div>
        </div>

        {/* Accent underline */}
        <div style={{ display: "flex", gap: 12 }}>
          {BARS.map((c) => (
            <div key={c} style={{ height: 10, width: 120, borderRadius: 5, background: c }} />
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}

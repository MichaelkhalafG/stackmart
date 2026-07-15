/* eslint-disable @next/next/no-img-element -- next/og (satori) renders a raw <img>; next/image does not run in the OG image pipeline. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Default OpenGraph image (S5.01) — the site-wide social card used by every route that doesn't
 * supply its own (the listing detail derives its own OG from the product's first image). Generated
 * at build/request with `next/og` (built into Next — no package, no external host). PNG output,
 * 1200×630.
 *
 * Brand: the real MDN wordmark (`public/logo-mdn.png`, the single source of truth used everywhere)
 * sits prominently in a white panel — the navy wordmark needs a light field — beside "STACKMART", on
 * the brand navy #032b42 card, with a royal #010ed0 / lavender / white accent. The wordmark is read
 * from disk and embedded as a data URI so satori can draw it.
 */
export const alt = "MDN STACKMART — a curated marketplace for ready-made micro-SaaS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Hex literals, not tokens: satori renders outside the DOM and cannot resolve the CSS variables in
// globals.css. Keep in sync with Planning/06_UI_System.md by hand. Amber is retired from the palette.
const NAVY = "#032b42";
const CANVAS = "#ffffff";
const MUTED = "#9aa4b2";
const BARS = ["#dee0ff", "#010ed0", "#ffffff"] as const;

export default async function OpengraphImage() {
  const logo = await readFile(join(process.cwd(), "public", "logo-mdn.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

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
        {/* Brand lockup: the real MDN wordmark on a white panel + "STACKMART". */}
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: CANVAS,
              borderRadius: 18,
              padding: "22px 30px",
            }}
          >
            {/* 1855×752 → 2.47:1; 300px wide reads large and stays crisp. */}
            <img src={logoSrc} width={300} height={122} style={{ objectFit: "contain" }} alt="" />
          </div>
          <div style={{ display: "flex", width: 2, height: 66, background: "rgba(222,224,255,0.3)" }} />
          <div
            style={{
              fontSize: 54,
              fontWeight: 700,
              color: CANVAS,
              letterSpacing: "0.04em",
            }}
          >
            STACKMART
          </div>
        </div>

        {/* Headline + tagline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              display: "flex",
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
          <div style={{ display: "flex", fontSize: 30, color: MUTED, maxWidth: 900 }}>
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

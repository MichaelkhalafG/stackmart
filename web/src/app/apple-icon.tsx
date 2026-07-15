/* eslint-disable @next/next/no-img-element -- next/og (satori) renders a raw <img>; next/image does not run in the OG image pipeline. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

/**
 * Apple touch icon (180×180) — generated with `next/og` (built into Next: no package, no
 * hand-rasterised PNG). Uses the SINGLE brand wordmark `public/logo-mdn.png` (navy, transparent),
 * the same asset the navbar/footer use — read from disk and embedded as a data URI so satori can
 * draw it. Letterboxed with comfortable padding on a white tile (the navy wordmark needs a light
 * field; satori can't recolour a raster to white). iOS rounds the corners itself.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const logo = await readFile(join(process.cwd(), "public", "logo-mdn.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* 1855×752 wordmark → keep the 2.47:1 aspect; 122px wide reads well at 180px with padding. */}
        <img src={logoSrc} width={122} height={49} style={{ objectFit: "contain" }} alt="" />
      </div>
    ),
    { ...size },
  );
}

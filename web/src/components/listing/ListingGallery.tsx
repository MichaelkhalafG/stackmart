"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

/**
 * ListingGallery (13_Component_Map.md) — main image + clickable thumbnails. Renders with a plain
 * <img> (not Next/Image): the images come from the API storage host, and configuring
 * `next.config` `images.remotePatterns` is outside this task's allowed files — deferred to the
 * image/deploy config task. Consistent with the S2.01 MarketplaceCard cover.
 */
export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-md border border-border bg-canvas-subtle text-sm text-fg-muted">
        No preview images
      </div>
    );
  }

  const current = Math.min(active, images.length - 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[16/9] w-full overflow-hidden rounded-md border border-border bg-canvas-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element -- API storage host; remotePatterns config is out of scope for S2.03 */}
        <img src={images[current]} alt={title} className="size-full object-cover" />
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === current}
              className={cn(
                "aspect-[16/9] overflow-hidden rounded-md border bg-canvas-subtle transition-colors",
                index === current
                  ? "border-accent ring-1 ring-accent"
                  : "border-border hover:border-fg-muted",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- see above */}
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

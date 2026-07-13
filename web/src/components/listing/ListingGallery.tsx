"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { productImagesOrDefault } from "@/lib/imageUrl";

/**
 * ListingGallery (13_Component_Map.md) — main image + clickable thumbnails via Next/Image.
 *
 * Every `images[]` entry goes through `productImagesOrDefault`: real images (absolute API-storage
 * URLs or uploaded paths) pass through normalized, while missing images and the seeded coloured
 * placeholder swatches collapse to the single shared default. The list is never empty, so the old
 * "No preview images" empty state is gone — a listing without imagery now shows the default.
 */
export function ListingGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  const resolved = productImagesOrDefault(images);
  const current = Math.min(active, resolved.length - 1);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-md border border-border bg-canvas-subtle">
        <Image
          src={resolved[current]}
          alt={title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>

      {resolved.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {resolved.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${resolved.length}`}
              aria-current={index === current}
              className={cn(
                "relative aspect-[16/9] overflow-hidden rounded-md border bg-canvas-subtle transition-colors",
                index === current
                  ? "border-accent ring-1 ring-accent"
                  : "border-border hover:border-fg-muted",
              )}
            >
              <Image src={image} alt="" fill sizes="15vw" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

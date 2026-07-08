"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  darkPage: boolean;
};

export function ProductGallery({ images, productName, darkPage }: ProductGalleryProps) {
  const galleryImages = images.length > 0 ? images : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  return (
    <div>
      <button
        type="button"
        className="garment-frame block aspect-[4/5] w-full overflow-hidden border border-gold/20"
        onClick={() => setLightboxIndex(activeIndex)}
        aria-label={`Open ${productName} image`}
      >
        <img src={activeImage} alt={`${productName} selected view`} className="garment-image h-full w-full" />
      </button>

      <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {galleryImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            onDoubleClick={() => setLightboxIndex(index)}
            className={cn(
              "garment-frame aspect-square overflow-hidden border transition",
              activeIndex === index ? "border-gold ring-2 ring-gold/35" : "border-gold/20 hover:border-gold/70"
            )}
            aria-label={`Show ${productName} view ${index + 1}`}
          >
            <img
              src={image}
              alt={`${productName} view ${index + 1}`}
              className="h-full w-full object-contain p-3"
              style={{ transform: index % 3 === 1 ? "scale(1.14)" : index % 3 === 2 ? "scale(0.94)" : undefined }}
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-obsidian/78 p-5 backdrop-blur-md" role="dialog" aria-modal="true">
          <div
            className="relative w-full max-w-4xl overflow-hidden rounded-[35px] border border-gold/25 p-4 shadow-2xl"
            style={{ backgroundColor: darkPage ? "#1F1F1F" : "#F7F3E8" }}
          >
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              className="gold-focus absolute right-5 top-5 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gold text-obsidian transition hover:bg-obsidian hover:text-ivory"
              aria-label="Close image preview"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="garment-frame aspect-[4/5] max-h-[80vh] overflow-hidden">
              <img src={galleryImages[lightboxIndex]} alt={`${productName} enlarged view`} className="garment-image h-full w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

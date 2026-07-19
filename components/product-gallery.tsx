"use client";

import Image from "next/image";
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
    <div className="mx-auto w-full max-w-[520px] md:max-w-none">
      <button
        type="button"
        className="garment-frame relative block aspect-[4/5] w-full overflow-hidden border border-gold/20"
        onClick={() => setLightboxIndex(activeIndex)}
        aria-label={`Open ${productName} image`}
      >
        <Image src={activeImage} alt={`${productName} selected view`} fill sizes="(min-width: 768px) 48vw, 100vw" className="garment-image h-full w-full" priority />
      </button>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {galleryImages.map((image, index) => (
          <button
            key={`${image}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            onDoubleClick={() => setLightboxIndex(index)}
            className={cn(
              "garment-frame aspect-square overflow-hidden border transition",
              "relative",
              activeIndex === index ? "border-gold ring-2 ring-gold/35" : "border-gold/20 hover:border-gold/70"
            )}
            aria-label={`Show ${productName} view ${index + 1}`}
          >
            <Image
              src={image}
              alt={`${productName} view ${index + 1}`}
              fill
              sizes="120px"
              className="h-full w-full object-contain p-2"
              style={{ transform: index % 3 === 1 ? "scale(1.14)" : index % 3 === 2 ? "scale(0.94)" : undefined }}
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-obsidian/78 p-5 backdrop-blur-md" role="dialog" aria-modal="true">
          <div
            className="relative w-full max-w-3xl overflow-hidden rounded-[26px] border border-gold/25 p-3 shadow-2xl"
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
            <div className="garment-frame relative aspect-[4/5] max-h-[80vh] overflow-hidden">
              <Image src={galleryImages[lightboxIndex]} alt={`${productName} enlarged view`} fill sizes="min(100vw, 768px)" className="garment-image h-full w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

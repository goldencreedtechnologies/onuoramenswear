"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/cn";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const galleryImages = Array.from(new Set(images.filter(Boolean)));
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  function previous(index: number) {
    return (index - 1 + galleryImages.length) % galleryImages.length;
  }

  function next(index: number) {
    return (index + 1) % galleryImages.length;
  }

  if (!activeImage) {
    return <div className="aspect-[4/5] bg-surface-subtle" aria-label="Product image unavailable" />;
  }

  return (
    <div className="grid gap-2">
      <button
        type="button"
        className="group/zoom gold-focus relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-page"
        onClick={() => setLightboxIndex(activeIndex)}
        aria-label={`Enlarge ${productName} image`}
      >
        <Image
          src={activeImage}
          alt={`${productName} view ${activeIndex + 1}`}
          fill
          loading="eager"
          quality={95}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className="object-cover object-top transition-transform duration-500 ease-out md:group-hover/zoom:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-page/92 text-copy shadow-sm backdrop-blur">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>

      {galleryImages.length > 1 ? (
        <div className="hide-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:gap-2">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "gold-focus relative aspect-[4/5] w-[82px] shrink-0 overflow-hidden bg-page transition sm:w-[92px]",
                activeIndex === index ? "opacity-100 ring-1 ring-copy" : "opacity-58 hover:opacity-100"
              )}
              aria-label={`Show ${productName} view ${index + 1}`}
            >
              <Image src={image} alt="" fill sizes="92px" className="object-cover object-top" />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxIndex !== null ? (
        <div className="fixed inset-0 z-[150] grid place-items-center bg-black/90 p-3 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${productName} image gallery`}>
          <button type="button" onClick={() => setLightboxIndex(null)} className="gold-focus absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/45 text-white transition hover:bg-white hover:text-black" aria-label="Close image gallery">
            <X className="h-6 w-6" />
          </button>
          {galleryImages.length > 1 ? (
            <>
              <button type="button" onClick={() => setLightboxIndex((index) => previous(index ?? 0))} className="gold-focus absolute left-2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-black md:left-6" aria-label="Previous image">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => setLightboxIndex((index) => next(index ?? 0))} className="gold-focus absolute right-2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-black md:right-6" aria-label="Next image">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          ) : null}
          <div className="relative h-[88vh] w-[min(92vw,980px)]">
            <Image src={galleryImages[lightboxIndex]} alt={`${productName} enlarged view ${lightboxIndex + 1}`} fill quality={96} sizes="92vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

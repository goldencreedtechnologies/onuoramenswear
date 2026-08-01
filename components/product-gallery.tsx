"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { cn } from "@/lib/cn";

type ProductGalleryProps = {
  images: string[];
  productName: string;
};

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const galleryImages = images.filter(Boolean);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxZoomed, setLightboxZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];

  function setPrevious(index: number) {
    return (index - 1 + galleryImages.length) % galleryImages.length;
  }

  function setNext(index: number) {
    return (index + 1) % galleryImages.length;
  }

  function handleZoom(event: MouseEvent<HTMLButtonElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    setZoomOrigin(`${x}% ${y}%`);
  }

  if (!activeImage) {
    return <div className="aspect-[4/5] bg-surface-subtle" aria-label="Product image unavailable" />;
  }

  return (
    <div className="grid gap-3">
      {galleryImages.length > 1 ? (
        <div className="hide-scrollbar order-2 flex gap-2 overflow-x-auto">
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "gold-focus relative aspect-[3/4] w-[72px] shrink-0 overflow-hidden bg-page transition sm:w-[82px]",
                activeIndex === index ? "opacity-100" : "opacity-60 hover:opacity-100"
              )}
              aria-label={`Show ${productName} view ${index + 1}`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="72px"
                className="object-contain"
              />
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        className="group/zoom gold-focus relative order-1 aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-page"
        onMouseMove={handleZoom}
        onClick={() => {
          setLightboxZoomed(false);
          setLightboxIndex(activeIndex);
        }}
        aria-label={`Enlarge ${productName} image`}
      >
        <Image
          src={activeImage}
          alt={`${productName} view ${activeIndex + 1}`}
          fill
          loading="eager"
          quality={94}
          sizes="(min-width: 1024px) 56vw, 100vw"
          className="object-contain transition-transform duration-500 ease-out md:group-hover/zoom:scale-[1.02]"
          style={{ transformOrigin: zoomOrigin }}
        />
        <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-page/92 text-copy shadow-sm backdrop-blur">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>

      {lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center overflow-auto bg-black/88 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image gallery`}
        >
          <button
            type="button"
            onClick={() => {
              setLightboxZoomed(false);
              setLightboxIndex(null);
            }}
            className="gold-focus absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/45 text-[#ffffff] transition hover:bg-white hover:text-black"
            aria-label="Close image gallery"
          >
            <X className="h-5 w-5" strokeWidth={2.5} />
          </button>
          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setLightboxZoomed(false);
                  setLightboxIndex((index) => setPrevious(index ?? 0));
                }}
                className="gold-focus absolute left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-black md:left-6"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setLightboxZoomed(false);
                  setLightboxIndex((index) => setNext(index ?? 0));
                }}
                className="gold-focus absolute right-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white hover:bg-white hover:text-black md:right-6"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setLightboxZoomed((zoomed) => !zoomed)}
            className={cn(
              "gold-focus relative transition-[height,width] duration-500",
              lightboxZoomed
                ? "h-[145vh] w-[145vw] max-w-none cursor-zoom-out"
                : "h-[86vh] w-[min(86vw,900px)] cursor-zoom-in"
            )}
            aria-label={lightboxZoomed ? "Reduce image zoom" : "Zoom further into image"}
          >
            <Image
              src={galleryImages[lightboxIndex]}
              alt={`${productName} enlarged view ${lightboxIndex + 1}`}
              fill
              quality={96}
              sizes={lightboxZoomed ? "145vw" : "86vw"}
              className="object-contain"
            />
          </button>
        </div>
      ) : null}
    </div>
  );
}

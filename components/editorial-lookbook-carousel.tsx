"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { StoreProduct } from "@/lib/backend/types";
import { cn } from "@/lib/cn";

type EditorialLookbookCarouselProps = {
  products: StoreProduct[];
};

const orbitSlots = [
  "left-[1%] top-[43%] z-20 -rotate-[10deg] scale-[0.9] md:left-[-1%]",
  "left-[33%] top-[40%] z-30 -rotate-[2deg] scale-100 md:left-[31%]",
  "right-[2%] top-[42%] z-20 rotate-[8deg] scale-[0.9] md:right-[-1%]"
];

function ProductScreen({
  product,
  compact = false
}: {
  product: StoreProduct;
  compact?: boolean;
}) {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: product.palette, color: product.pageText }}
    >
      <div className={cn("relative z-10", compact ? "px-3 pt-3" : "px-5 pt-5")}>
        <p className={cn("font-bold uppercase tracking-[0]", compact ? "text-[8px]" : "text-[10px]")} style={{ color: product.pageMuted }}>
          {product.name}
        </p>
        <p className={cn("mt-1 font-semibold uppercase tracking-[0]", compact ? "text-[7px]" : "text-[9px]")} style={{ color: product.pageMuted }}>
          {product.edition}
        </p>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={product.image}
          alt={`${product.name} ${product.edition}`}
          className={cn("h-full w-full object-contain object-center", compact ? "p-4" : "p-5")}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/12 to-transparent" />
    </div>
  );
}

function OrbitCard({
  product,
  className,
  onClick
}: {
  product: StoreProduct;
  className: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "absolute h-[218px] w-[148px] overflow-hidden rounded-[24px] border-2 border-[#161412] bg-[#161412] p-[3px] shadow-[0_18px_34px_rgba(0,0,0,0.22)] transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-[0_26px_48px_rgba(0,0,0,0.26)] md:h-[246px] md:w-[166px]",
        className
      )}
      aria-label={`Show ${product.name}`}
    >
      <div className="h-full w-full overflow-hidden rounded-[20px]">
        <ProductScreen product={product} compact />
      </div>
    </button>
  );
}

export function EditorialLookbookCarousel({ products }: EditorialLookbookCarouselProps) {
  const [index, setIndex] = useState(0);

  const visibleProducts = useMemo(() => {
    if (!products.length) {
      return [];
    }

    return Array.from({ length: 4 }, (_, offset) => products[(index + offset) % products.length]);
  }, [index, products]);

  const main = visibleProducts[0];
  const orbitProducts = visibleProducts.slice(1, 4);

  if (!main || orbitProducts.length < 3) {
    return null;
  }

  const goPrevious = () => setIndex((current) => (current - 1 + products.length) % products.length);
  const goNext = () => setIndex((current) => (current + 1) % products.length);

  return (
    <div className="grid gap-10 overflow-hidden md:grid-cols-[1.08fr_0.92fr] md:items-center">
      <div className="relative mx-auto h-[660px] w-full max-w-[610px] md:h-[720px]">
        <div className="absolute left-1/2 top-[2%] z-10 h-[560px] w-[560px] -translate-x-1/2 md:h-[620px] md:w-[620px]">
          <div className="absolute inset-x-[18%] bottom-[4%] h-16 rounded-full bg-black/18 blur-2xl" />
          <img
            src="/brand/phone-screen.png"
            alt="Tilted phone lookbook screen"
            className="relative z-10 h-full w-full object-contain"
          />

          <div className="absolute left-[39.7%] top-[25.8%] z-20 h-[49.8%] w-[22.7%] rotate-[-10.8deg] overflow-hidden rounded-[24px] bg-obsidian shadow-inner">
            <ProductScreen product={main} />
          </div>
        </div>

        <div className="absolute inset-x-0 top-[12%] z-30 h-[430px] md:top-[14%]">
          {orbitProducts.map((product, productIndex) => (
            <OrbitCard
              key={`${product.slug}-${productIndex}`}
              product={product}
              className={orbitSlots[productIndex]}
              onClick={() => setIndex((current) => (current + productIndex + 1) % products.length)}
            />
          ))}

          <button
            type="button"
            onClick={goPrevious}
            className="gold-focus absolute left-0 top-[55%] z-40 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-obsidian bg-transparent text-obsidian backdrop-blur-sm transition hover:border-gold hover:text-gold md:left-[-18px]"
            aria-label="Previous lookbook products"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="gold-focus absolute right-0 top-[55%] z-40 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-obsidian bg-transparent text-obsidian backdrop-blur-sm transition hover:border-gold hover:text-gold md:right-[-18px]"
            aria-label="Next lookbook products"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl md:pl-6">
        <p className="text-[10px] font-bold uppercase tracking-[0] text-gold">Editorial lookbook</p>
        <h3 className="mt-4 font-display text-4xl leading-[0.95] text-copy md:text-5xl">
          A modern screen for an ancestral signal.
        </h3>
        <p className="mt-5 max-w-xl text-base leading-8 text-copy-muted">
          The lookbook now rotates through every signature, one chapter at a time, so each story can breathe before the next one arrives
        </p>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductPrice } from "@/components/currency-provider";
import type { Product } from "@/data/catalog";
import { getCollectionByFamily } from "@/data/site-config";

type ProductCardVisualVariant = "current" | "july29";

export function ProductCard({
  product,
  priority = false,
  badge,
  visualVariant = "current",
  collectionOnly = false,
  imageOverride,
  secondaryImageOverride
}: {
  product: Product;
  priority?: boolean;
  badge?: string;
  visualVariant?: ProductCardVisualVariant;
  collectionOnly?: boolean;
  imageOverride?: string;
  secondaryImageOverride?: string;
}) {
  const primaryImage = imageOverride ?? product.image;
  const secondaryImage =
    secondaryImageOverride ??
    product.images.find((image) => image && image !== product.image) ??
    primaryImage;
  const useJuly29Visuals = visualVariant === "july29";
  const collection = getCollectionByFamily(product.family);
  const cardLabel = collectionOnly
    ? `Explore ${collection.englishName}, ${product.colorName}`
    : `Shop ${product.name}, ${product.colorName}`;

  return (
    <article className="group min-w-0">
      <Link href={`/products/${product.slug}`} className="gold-focus block" aria-label={cardLabel}>
        <div className={`product-card-media relative aspect-[4/5] overflow-hidden ${useJuly29Visuals ? "bg-[#f1f0ec]" : "bg-page"}`}>
          <Image
            src={primaryImage}
            alt={collectionOnly ? `${collection.englishName} in ${product.colorName}` : `${product.name} ${product.colorName}`}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className="product-card-image object-cover object-top transition duration-700 ease-out group-hover:scale-[1.018]"
          />
          {secondaryImage !== primaryImage ? (
            <Image
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="product-card-secondary object-cover object-top"
            />
          ) : null}
          {badge ? (
            <span className="absolute left-2 top-2 max-w-[76%] bg-page/92 px-2 py-1 text-[7px] font-semibold uppercase leading-3 text-copy backdrop-blur-sm">
              {badge}
            </span>
          ) : null}
          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-obsidian text-ivory opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 pt-2">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.06em] text-gold">
              {collection.igboName}
            </p>
            <h3 className="mt-1 truncate text-sm font-semibold text-copy">
              {collectionOnly ? collection.englishName : product.name}
            </h3>
            <p className="mt-0.5 truncate text-[11px] text-copy-muted">{product.colorName}</p>
          </div>
          <ProductPrice className="shrink-0 text-sm font-medium text-copy" />
        </div>
      </Link>
    </article>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductPrice } from "@/components/currency-provider";
import type { Product } from "@/data/catalog";
import {
  PRODUCT_INCLUSION_LABEL,
  PRODUCT_TYPE_LABEL,
  getCollectionByFamily
} from "@/data/site-config";

type ProductCardVisualVariant = "current" | "july29";

export function ProductCard({
  product,
  priority = false,
  badge,
  visualVariant = "current",
  collectionOnly = false
}: {
  product: Product;
  priority?: boolean;
  badge?: string;
  visualVariant?: ProductCardVisualVariant;
  collectionOnly?: boolean;
}) {
  const secondaryImage =
    product.images.find((image) => image && image !== product.image) ?? product.image;
  const useJuly29Visuals = visualVariant === "july29";
  const collection = getCollectionByFamily(product.family);
  const cardLabel = collectionOnly
    ? `Explore ${collection.englishName}`
    : `Shop ${product.name}, ${product.edition}`;
  const imageAlt = collectionOnly
    ? `${collection.englishName} outfit`
    : `${product.name} ${product.edition}`;

  return (
    <article className="group min-w-0">
      <Link
        href={`/products/${product.slug}`}
        className="gold-focus block"
        aria-label={cardLabel}
      >
        <div
          className={`product-card-media relative aspect-[3/4] overflow-hidden ${
            useJuly29Visuals ? "bg-[#f1f0ec]" : "bg-page"
          }`}
        >
          <Image
            src={product.image}
            alt={imageAlt}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
            priority={priority}
            className="product-card-image object-cover transition duration-700 ease-out group-hover:scale-[1.018]"
          />
          {secondaryImage !== product.image ? (
            <Image
              src={secondaryImage}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="product-card-secondary object-cover"
            />
          ) : null}
          {badge ? (
            <span
              className={
                useJuly29Visuals
                  ? "absolute left-2 top-2 max-w-[70%] bg-page/92 px-1.5 py-0.5 text-[7px] font-semibold uppercase leading-3 text-copy backdrop-blur-sm"
                  : "absolute bottom-2 right-2 max-w-[calc(100%-3.5rem)] bg-page/88 px-2 py-0.5 text-right text-[8px] font-semibold uppercase leading-4 text-copy backdrop-blur-sm"
              }
            >
              {badge}
            </span>
          ) : null}
          <span
            className={`absolute flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-obsidian text-ivory opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 ${
              useJuly29Visuals ? "bottom-3 right-3" : "bottom-2 left-2"
            }`}
          >
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <div className="flex items-start justify-between gap-3 pt-3">
          <div className="min-w-0">
            {collectionOnly ? (
              <>
                <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-gold">
                  {collection.igboName}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-copy">
                  {collection.englishName}
                </h3>
                <p className="mt-1 text-xs text-copy-muted">{PRODUCT_INCLUSION_LABEL}</p>
              </>
            ) : (
              <>
                <p className="truncate text-[10px] font-medium uppercase text-copy-muted">
                  {product.edition}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-copy">{product.name}</h3>
                <p className="mt-1 text-xs text-copy-muted">{PRODUCT_TYPE_LABEL}</p>
              </>
            )}
          </div>
          <ProductPrice className="shrink-0 text-sm font-medium text-copy" />
        </div>
      </Link>
    </article>
  );
}

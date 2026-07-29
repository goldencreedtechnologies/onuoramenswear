import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CollectionImageSwap } from "@/components/collection-image-swap";
import { RegionalPriceList } from "@/components/regional-price-list";
import type { PhaseOneCollectionProduct } from "@/data/phase-one-collections";

export function CollectionProductCard({
  product,
  priority = false
}: {
  product: PhaseOneCollectionProduct;
  priority?: boolean;
}) {
  const content = (
    <>
      <div
        className={`relative aspect-[3/4] overflow-hidden ${
          product.href ? "bg-[#f1f0ec]" : "bg-surface-subtle"
        }`}
      >
        <CollectionImageSwap
          images={product.images}
          alt={`${product.name} in ${product.color}`}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          priority={priority}
          className="object-cover object-center"
        />
        <span className="absolute left-3 top-3 bg-page/90 px-2.5 py-1 text-[9px] font-semibold uppercase text-copy backdrop-blur-sm">
          {product.description}
        </span>
        {product.href ? (
          <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-obsidian text-ivory opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className="pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-copy">{product.name}</h3>
            <p className="mt-1 flex items-center gap-2 text-[10px] uppercase text-copy-muted">
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-copy/15"
                style={{ backgroundColor: product.colorValue }}
              />
              {product.color}
            </p>
          </div>
          <RegionalPriceList prices={product.prices} compact />
        </div>
      </div>
    </>
  );

  if (!product.href) {
    return <article className="collection-image-pair group min-w-0">{content}</article>;
  }

  return (
    <Link
      href={product.href}
      className="collection-image-pair gold-focus group block min-w-0"
      aria-label={`Shop ${product.name}`}
    >
      {content}
    </Link>
  );
}

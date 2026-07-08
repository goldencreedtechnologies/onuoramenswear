import Link from "next/link";
import { Product } from "@/data/catalog";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <Link href={`/products/${product.slug}`} className="image-lift group block overflow-hidden rounded-[24px] border border-gold/15 bg-panel shadow-sm shadow-black/5">
      <div className="garment-frame relative aspect-[4/5] overflow-hidden">
        <img
          src={product.image}
          alt={`${product.name} ${product.edition} premium stretch menswear`}
          className="garment-image h-full w-full p-3"
          loading={priority ? "eager" : "lazy"}
        />
        <div className="absolute inset-x-0 bottom-0 rounded-b-[24px] bg-gradient-to-t from-obsidian/86 via-obsidian/28 to-transparent p-4 text-ivory">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0] text-gold-soft">{product.edition}</p>
              <h3 className="font-display text-2xl leading-none">{product.name}</h3>
              <p className="mt-2 text-sm text-ivory/72">{product.meaning}</p>
            </div>
            <p className="text-sm font-bold">{product.price}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-gold/15 bg-panel px-5 py-4 text-xs font-bold uppercase tracking-[0] text-copy">
        <span className="text-gold transition group-hover:translate-x-1">Buy Now</span>
      </div>
    </Link>
  );
}

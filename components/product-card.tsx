import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/data/catalog";

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  return (
    <Link href={`/products/${product.slug}`} className="image-lift group block overflow-hidden rounded-[18px] border border-gold/15 bg-panel shadow-sm shadow-black/5">
      <div className="garment-frame relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.image}
          alt={`${product.name} ${product.edition} premium stretch menswear`}
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className="garment-image h-full w-full p-2"
          priority={priority}
        />
        <div className="absolute inset-x-0 bottom-0 rounded-b-[18px] bg-gradient-to-t from-obsidian/86 via-obsidian/28 to-transparent p-3 text-ivory">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0] text-gold-soft">{product.edition}</p>
              <h3 className="font-display text-xl leading-none">{product.name}</h3>
              <p className="mt-1.5 text-xs text-ivory/72">{product.meaning}</p>
            </div>
            <p className="text-xs font-bold">{product.price}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end border-t border-gold/15 bg-panel px-4 py-3 text-[11px] font-bold uppercase tracking-[0] text-copy">
        <span className="text-gold transition group-hover:translate-x-1">Buy Now</span>
      </div>
    </Link>
  );
}

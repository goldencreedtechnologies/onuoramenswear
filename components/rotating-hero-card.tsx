"use client";

import { useEffect, useState } from "react";
import { products } from "@/data/catalog";

export function RotatingHeroCard() {
  const [index, setIndex] = useState(0);
  const product = products[index % products.length];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % products.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="floating hidden w-[270px] rounded-[32px] border border-gold/25 bg-obsidian/55 p-3 text-ivory shadow-2xl shadow-black/25 backdrop-blur-2xl md:block">
      <div className="garment-frame relative aspect-[4/5] overflow-hidden">
        <img
          key={product.slug}
          src={product.image}
          alt={`${product.name} ${product.edition}`}
          className="garment-image h-full w-full transition duration-500"
        />
      </div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0] text-gold-soft">{product.edition}</p>
          <p className="font-display text-2xl leading-none">{product.name}</p>
        </div>
        <p className="max-w-[7rem] text-right text-xs leading-5 text-ivory/68">{product.meaning}</p>
      </div>
    </div>
  );
}

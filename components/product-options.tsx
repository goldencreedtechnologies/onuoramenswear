"use client";

import { useState } from "react";
import { Check, ShoppingBag, X } from "lucide-react";
import { addCartItem, productToCartItem } from "@/lib/cart";
import { cn } from "@/lib/cn";
import type { StoreProduct } from "@/lib/backend/types";

const sizes = [
  { label: "S", chest: "36-40", waist: "28-32", trouser: "30" },
  { label: "M", chest: "40-44", waist: "32-34", trouser: "32" },
  { label: "L", chest: "44-46", waist: "36-38", trouser: "34" },
  { label: "XL", chest: "46-50", waist: "38-42", trouser: "36" },
  { label: "XXL", chest: "50-55", waist: "42-48", trouser: "40" }
];

type ProductOptionsProps = {
  product: StoreProduct;
};

export function ProductOptions({ product }: ProductOptionsProps) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);

  function handleAddToBag() {
    addCartItem(productToCartItem(product, selectedSize));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0]">Select size</p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {sizes.map((size) => (
            <button
              key={size.label}
              type="button"
              onClick={() => setSelectedSize(size.label)}
              className={cn(
                "gold-focus h-12 rounded-[18px] border border-gold/30 bg-[var(--product-panel)] text-sm font-bold transition hover:border-gold hover:bg-gold hover:text-obsidian",
                selectedSize === size.label && "border-gold bg-gold text-obsidian"
              )}
              aria-pressed={selectedSize === size.label}
            >
              {size.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--product-muted)" }}>Selected: <span className="font-bold" style={{ color: "var(--product-text)" }}>{selectedSize}</span></p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToBag}
          className="gold-focus inline-flex min-h-12 items-center justify-center gap-3 rounded-[3px] bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0] text-obsidian transition hover:-translate-y-0.5 hover:bg-gold-soft"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {added ? "Added to bag" : `Add ${selectedSize} to bag`}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="gold-focus inline-flex min-h-12 items-center justify-center rounded-[18px] border border-gold/35 px-5 py-3 text-xs font-bold uppercase tracking-[0] transition hover:border-gold hover:text-gold"
        >
          View size details
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-obsidian/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Size details">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[35px] border border-gold/25 bg-panel p-6 text-copy shadow-2xl md:p-8">
            <div className="mb-6 flex items-start justify-between gap-6">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0] text-gold">Stretch-fit size guide</p>
                <h2 className="font-display text-4xl">Available sizes</h2>
              </div>
              <button className="gold-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/20" onClick={() => setOpen(false)} aria-label="Close size details">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/20 text-xs uppercase tracking-[0] text-copy-muted">
                    <th className="py-4 pr-4">Size</th>
                    <th className="py-4 pr-4">Chest (in)</th>
                    <th className="py-4 pr-4">Waist (in)</th>
                    <th className="py-4 pr-4">Trouser length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size.label} className="border-b border-gold/15">
                      <td className="py-4 pr-4 font-bold">{size.label}</td>
                      <td className="py-4 pr-4">{size.chest}</td>
                      <td className="py-4 pr-4">{size.waist}</td>
                      <td className="py-4 pr-4">{size.trouser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-sm leading-7 text-copy-muted">
              Because of the stretch-fit fabric, this garment allows for natural flexibility across sizes.
              If you are between two sizes, size down for a fitted look or size up for relaxed comfort.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

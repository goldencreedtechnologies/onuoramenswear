"use client";

import { useEffect, useMemo, useState } from "react";
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

type InventoryItem = {
  size: string;
  availableQuantity: number;
  isLowStock: boolean;
  isSoldOut: boolean;
};

export function ProductOptions({ product }: ProductOptionsProps) {
  const [selectedSize, setSelectedSize] = useState("M");
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/inventory/${product.slug}`)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled && Array.isArray(result?.inventory)) {
          setInventory(result.inventory);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setInventory([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [product.slug]);

  const inventoryBySize = useMemo(() => {
    return new Map((inventory ?? []).map((item) => [item.size, item]));
  }, [inventory]);

  const firstAvailableSize = sizes.find((size) => !inventoryBySize.get(size.label)?.isSoldOut)?.label;
  const selectedSizeIsSoldOut = Boolean(inventoryBySize.get(selectedSize)?.isSoldOut);
  const activeSize = selectedSizeIsSoldOut && firstAvailableSize ? firstAvailableSize : selectedSize;
  const selectedInventory = inventoryBySize.get(activeSize);
  const selectedIsSoldOut = Boolean(selectedInventory?.isSoldOut);

  function handleAddToBag() {
    if (selectedIsSoldOut) {
      return;
    }

    addCartItem(productToCartItem(product, activeSize));
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0]">Select size</p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {sizes.map((size) => {
            const sizeInventory = inventoryBySize.get(size.label);
            const isSoldOut = Boolean(sizeInventory?.isSoldOut);

            return (
              <button
                key={size.label}
                type="button"
                onClick={() => !isSoldOut && setSelectedSize(size.label)}
                disabled={isSoldOut}
                className={cn(
                  "gold-focus h-10 rounded-[14px] border border-gold/30 bg-[var(--product-panel)] text-sm font-bold transition hover:border-gold hover:bg-gold hover:text-obsidian",
                  activeSize === size.label && "border-gold bg-gold text-obsidian",
                  isSoldOut && "cursor-not-allowed border-black/10 opacity-35 hover:border-black/10 hover:bg-[var(--product-panel)] hover:text-current"
                )}
                aria-pressed={activeSize === size.label}
                aria-label={isSoldOut ? `${size.label} sold out` : `${size.label} available`}
              >
                {size.label}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm" style={{ color: "var(--product-muted)" }}>
          Selected: <span className="font-bold" style={{ color: "var(--product-text)" }}>{activeSize}</span>
          {selectedInventory?.isLowStock ? <span className="ml-2 font-bold text-gold">Only {selectedInventory.availableQuantity} left</span> : null}
          {selectedIsSoldOut ? <span className="ml-2 font-bold text-gold">Sold out</span> : null}
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToBag}
          disabled={selectedIsSoldOut || (inventory !== null && !firstAvailableSize)}
          className="gold-focus inline-flex min-h-10 items-center justify-center gap-3 rounded-[3px] bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-[0] text-obsidian transition hover:-translate-y-0.5 hover:bg-gold-soft"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {selectedIsSoldOut ? "Sold out" : added ? "Added to bag" : `Add ${activeSize} to bag`}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="gold-focus inline-flex min-h-10 items-center justify-center rounded-[14px] border border-gold/35 px-4 py-2.5 text-xs font-bold uppercase tracking-[0] transition hover:border-gold hover:text-gold"
        >
          View size details
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-obsidian/70 p-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Size details">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-[26px] border border-gold/25 bg-panel p-5 text-copy shadow-2xl md:p-5">
            <div className="mb-6 flex items-start justify-between gap-5">
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-[0] text-gold">Stretch-fit size guide</p>
                <h2 className="font-display text-3xl">Available sizes</h2>
              </div>
              <button className="gold-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/20" onClick={() => setOpen(false)} aria-label="Close size details">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-gold/20 text-xs uppercase tracking-[0] text-copy-muted">
                    <th className="py-3 pr-4">Size</th>
                    <th className="py-3 pr-4">Chest (in)</th>
                    <th className="py-3 pr-4">Waist (in)</th>
                    <th className="py-3 pr-4">Trouser length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size.label} className="border-b border-gold/15">
                      <td className="py-3 pr-4 font-bold">{size.label}</td>
                      <td className="py-3 pr-4">{size.chest}</td>
                      <td className="py-3 pr-4">{size.waist}</td>
                      <td className="py-3 pr-4">{size.trouser}</td>
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

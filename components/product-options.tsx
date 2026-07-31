"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Minus, Plus, Ruler, ShoppingBag, X } from "lucide-react";
import { ADDITIONAL_PRODUCT_COLOURS } from "@/data/site-config";
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

type InventoryItem = {
  size: string;
  availableQuantity: number;
  isLowStock: boolean;
  isSoldOut: boolean;
};

type ColorOption = {
  slug: string;
  name: string;
  colorName: string;
  colorValue: string;
};

type SelectedColour = {
  name: string;
  value: string;
  usesCurrentPhotography: boolean;
};

export function ProductOptions({ product, colorOptions }: { product: StoreProduct; colorOptions: ColorOption[] }) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColour, setSelectedColour] = useState<SelectedColour>({
    name: product.colorName,
    value: product.colorValue,
    usesCurrentPhotography: false
  });
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [added, setAdded] = useState(false);
  const [needsSize, setNeedsSize] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[] | null>(null);

  useEffect(() => {
    setSelectedColour({
      name: product.colorName,
      value: product.colorValue,
      usesCurrentPhotography: false
    });
    setSelectedSize("");
    setQuantity(1);
    setNeedsSize(false);
  }, [product.slug, product.colorName, product.colorValue]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/inventory/${product.slug}`)
      .then((response) => response.json())
      .then((result) => {
        if (!cancelled && Array.isArray(result?.inventory)) setInventory(result.inventory);
      })
      .catch(() => {
        if (!cancelled) setInventory([]);
      });
    return () => {
      cancelled = true;
    };
  }, [product.slug]);

  const inventoryBySize = useMemo(
    () => new Map((inventory ?? []).map((item) => [item.size, item])),
    [inventory]
  );
  const selectedInventory = selectedSize ? inventoryBySize.get(selectedSize) : undefined;
  const allSoldOut =
    inventory !== null &&
    inventory.length > 0 &&
    sizes.every((size) => inventoryBySize.get(size.label)?.isSoldOut);
  const maxQuantity = selectedInventory
    ? Math.max(1, Math.min(6, selectedInventory.availableQuantity))
    : 6;

  function chooseSize(size: string) {
    setSelectedSize(size);
    setQuantity(1);
    setNeedsSize(false);
  }

  function addSelectedProduct(redirectToCheckout = false) {
    if (!selectedSize) {
      setNeedsSize(true);
      return;
    }
    if (selectedInventory?.isSoldOut || allSoldOut) return;

    const item = productToCartItem(product, selectedSize, {
      colorName: selectedColour.name,
      colorValue: selectedColour.value
    });
    item.quantity = quantity;
    addCartItem(item);
    setAdded(true);

    if (redirectToCheckout) {
      window.location.assign("/checkout");
      return;
    }

    window.dispatchEvent(new Event("onuora-cart-open"));
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <>
      <div className="mt-5 border-t border-line pt-5">
        <p className="text-xs font-semibold uppercase">
          Colour <span className="ml-2 font-normal text-copy-muted">{selectedColour.name}</span>
        </p>
        <div className="mt-3 flex flex-wrap gap-3" aria-label="Available colours">
          {colorOptions.map((option) => {
            const isSelected = !selectedColour.usesCurrentPhotography && option.slug === product.slug;
            return (
              <Link
                key={option.slug}
                href={`/products/${option.slug}`}
                onClick={() =>
                  setSelectedColour({
                    name: option.colorName,
                    value: option.colorValue,
                    usesCurrentPhotography: false
                  })
                }
                className={cn(
                  "gold-focus grid h-8 w-8 place-items-center rounded-full border transition",
                  isSelected
                    ? "border-copy ring-1 ring-copy ring-offset-2 ring-offset-page"
                    : "border-copy/20 hover:border-copy"
                )}
                aria-label={`${option.name}, ${option.colorName}${isSelected ? ", selected" : ""}`}
                aria-current={isSelected ? "page" : undefined}
                title={`${option.name} / ${option.colorName}`}
              >
                <span className="h-5 w-5 rounded-full border border-black/15" style={{ backgroundColor: option.colorValue }} />
              </Link>
            );
          })}
          {ADDITIONAL_PRODUCT_COLOURS.map((colour) => {
            const isSelected = selectedColour.usesCurrentPhotography && selectedColour.name === colour.name;
            return (
              <button
                key={colour.id}
                type="button"
                onClick={() => setSelectedColour({ name: colour.name, value: colour.value, usesCurrentPhotography: true })}
                className={cn(
                  "gold-focus grid h-8 w-8 place-items-center rounded-full border transition",
                  isSelected
                    ? "border-copy ring-1 ring-copy ring-offset-2 ring-offset-page"
                    : "border-copy/20 hover:border-copy"
                )}
                aria-label={`${colour.name}${isSelected ? ", selected" : ""}`}
                aria-pressed={isSelected}
                title={`${colour.name} / Photography coming soon`}
              >
                <span className="h-5 w-5 rounded-full border border-black/15" style={{ backgroundColor: colour.value }} />
              </button>
            );
          })}
        </div>
        {selectedColour.usesCurrentPhotography ? (
          <p className="mt-3 text-[11px] leading-5 text-copy-muted">
            This colour is available to order. Its dedicated photography will be added when approved.
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase">Size</p>
          <button
            type="button"
            onClick={() => setSizeGuideOpen(true)}
            className="gold-focus inline-flex items-center gap-2 text-[10px] font-semibold uppercase text-copy-muted underline underline-offset-4 hover:text-copy"
          >
            <Ruler className="h-3.5 w-3.5" />
            Size Guide
          </button>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {sizes.map((size) => {
            const sizeInventory = inventoryBySize.get(size.label);
            const isSoldOut = Boolean(sizeInventory?.isSoldOut);
            return (
              <button
                key={size.label}
                type="button"
                onClick={() => !isSoldOut && chooseSize(size.label)}
                disabled={isSoldOut}
                className={cn(
                  "size-choice gold-focus relative h-11 border text-xs font-semibold transition",
                  isSoldOut && "cursor-not-allowed text-copy-muted/45 after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-8 after:-translate-x-1/2 after:-translate-y-1/2 after:-rotate-45 after:bg-copy-muted/45"
                )}
                data-selected={selectedSize === size.label}
                aria-pressed={selectedSize === size.label}
                aria-label={isSoldOut ? `${size.label} sold out` : `Select size ${size.label}`}
              >
                {size.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2 min-h-5 text-[11px]">
          {needsSize ? <p className="font-medium text-wine">Choose a size before continuing.</p> : null}
          {selectedInventory?.isLowStock && !needsSize ? (
            <p className="font-medium text-gold">Only {selectedInventory.availableQuantity} left in {selectedSize}</p>
          ) : null}
          {allSoldOut ? <p className="font-medium text-wine">This style is currently sold out.</p> : null}
        </div>

        <button
          type="button"
          onClick={() => addSelectedProduct(false)}
          disabled={allSoldOut}
          className="gold-focus mt-2 inline-flex min-h-13 w-full items-center justify-center gap-3 bg-obsidian px-5 py-4 text-xs font-semibold uppercase text-white transition hover:bg-gold hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-45"
        >
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {allSoldOut ? "Sold Out" : added ? "Added To Cart" : "Add To Cart"}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between border-y border-line py-3">
        <p className="text-xs font-semibold uppercase">Quantity</p>
        <div className="flex h-10 items-center border border-line">
          <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="gold-focus flex h-full w-10 items-center justify-center hover:bg-surface-subtle" aria-label="Decrease quantity">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="grid h-full w-10 place-items-center border-x border-line text-xs font-semibold">{quantity}</span>
          <button type="button" onClick={() => setQuantity((value) => Math.min(maxQuantity, value + 1))} disabled={quantity >= maxQuantity} className="gold-focus flex h-full w-10 items-center justify-center hover:bg-surface-subtle disabled:opacity-30" aria-label="Increase quantity">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => addSelectedProduct(true)}
        disabled={allSoldOut}
        className="gold-focus mt-3 min-h-12 w-full border border-copy px-5 text-xs font-semibold uppercase text-copy transition hover:bg-copy hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
      >
        Buy Now
      </button>

      {sizeGuideOpen ? (
        <div className="fixed inset-0 z-[160] grid place-items-center bg-black/62 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Size guide">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto bg-page p-5 text-copy shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-5 border-b border-line pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase text-gold">Size Guide</p>
                <h2 className="mt-2 text-2xl font-semibold">Available Sizes</h2>
              </div>
              <button type="button" className="gold-focus flex h-12 w-12 items-center justify-center rounded-full hover:bg-surface-subtle" onClick={() => setSizeGuideOpen(false)} aria-label="Close size guide">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-[10px] uppercase text-copy-muted">
                    <th className="py-4 pr-4">Size</th>
                    <th className="py-4 pr-4">Chest (in)</th>
                    <th className="py-4 pr-4">Waist (in)</th>
                    <th className="py-4">Trouser length (in)</th>
                  </tr>
                </thead>
                <tbody>
                  {sizes.map((size) => (
                    <tr key={size.label} className="border-b border-line">
                      <td className="py-4 pr-4 font-semibold">{size.label}</td>
                      <td className="py-4 pr-4">{size.chest}</td>
                      <td className="py-4 pr-4">{size.waist}</td>
                      <td className="py-4">{size.trouser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 text-sm leading-6 text-copy-muted">
              Choose the smaller size for a closer tailored line or the larger size for a more relaxed fit.
            </p>
          </div>
        </div>
      ) : null}
    </>
  );
}

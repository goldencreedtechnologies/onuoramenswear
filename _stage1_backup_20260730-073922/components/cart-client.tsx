"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cartSubtotal, readCart, updateCartItemQuantity, type CartItem } from "@/lib/cart";

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  useEffect(() => {
    const syncCart = () => setItems(readCart().items);
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("onuora-cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("onuora-cart-updated", syncCart);
    };
  }, []);

  function updateQuantity(item: CartItem, quantity: number) {
    const nextCart = updateCartItemQuantity(item.productSlug, item.size, quantity);
    setItems(nextCart.items);
  }

  if (!items.length) {
    return (
      <div className="mt-8 border-y border-line py-16 text-center">
        <p className="text-sm text-copy-muted">Your bag is currently empty.</p>
        <Link
          href="/collection"
          className="gold-focus mt-6 inline-flex min-h-12 items-center gap-3 bg-obsidian px-6 text-xs font-semibold uppercase text-ivory hover:bg-gold hover:text-obsidian"
        >
          Explore collections
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
      <div className="border-t border-line">
        {items.map((item) => (
          <article
            key={`${item.productSlug}-${item.size}`}
            className="grid grid-cols-[96px_1fr] gap-4 border-b border-line py-5 sm:grid-cols-[132px_1fr]"
          >
            <Link
              href={`/products/${item.productSlug}`}
              className="gold-focus relative aspect-[3/4] overflow-hidden bg-surface-subtle"
            >
              <Image src={item.image} alt={item.name} fill sizes="132px" className="object-contain p-2" />
            </Link>
            <div className="flex min-w-0 flex-col justify-between gap-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase text-gold">{item.edition}</p>
                  <h2 className="mt-1 truncate text-lg font-semibold">{item.name}</h2>
                  <p className="mt-1 text-xs text-copy-muted">Size {item.size}</p>
                </div>
                <p className="shrink-0 text-sm font-medium">{money(item.unitPriceUsd * item.quantity)}</p>
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-10 items-center border border-line">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item, item.quantity - 1)}
                    className="gold-focus flex h-full w-10 items-center justify-center hover:bg-surface-subtle"
                    aria-label={`Reduce ${item.name} quantity`}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="grid h-full w-9 place-items-center border-x border-line text-xs font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item, item.quantity + 1)}
                    className="gold-focus flex h-full w-10 items-center justify-center hover:bg-surface-subtle"
                    aria-label={`Increase ${item.name} quantity`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => updateQuantity(item, 0)}
                  className="gold-focus inline-flex h-10 w-10 items-center justify-center text-copy-muted transition hover:text-wine"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
        <Link
          href="/collection"
          className="gold-focus mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase text-copy-muted underline underline-offset-4 hover:text-copy"
        >
          Continue shopping
        </Link>
      </div>

      <aside className="bg-surface-subtle p-6 lg:sticky lg:top-[124px]">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="my-6 space-y-3 border-y border-line py-5 text-sm">
          <div className="flex justify-between gap-5">
            <span className="text-copy-muted">Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-5">
            <span className="text-copy-muted">Delivery</span>
            <span className="text-right">Calculated at checkout</span>
          </div>
        </div>
        <div className="flex justify-between text-base font-semibold">
          <span>Estimated total</span>
          <span>{money(subtotal)}</span>
        </div>
        <Link
          href="/checkout"
          className="gold-focus mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian"
        >
          Secure checkout
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-4 text-center text-[10px] leading-5 text-copy-muted">
          Taxes and delivery are confirmed before payment.
        </p>
      </aside>
    </div>
  );
}

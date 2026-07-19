"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Cta } from "@/components/cta";
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

  return (
    <div className="mt-8 grid gap-5 md:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        {items.length ? (
          items.map((item) => (
            <article
              key={`${item.productSlug}-${item.size}`}
              className="grid gap-4 rounded-[26px] border border-gold/20 bg-panel-muted p-3 shadow-sm shadow-black/5 sm:grid-cols-[112px_1fr] sm:p-4"
            >
              <Link href={`/products/${item.productSlug}`} className="block overflow-hidden rounded-[22px] bg-panel">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={360}
                  height={420}
                  className="aspect-[4/5] h-full w-full object-contain p-3"
                />
              </Link>
              <div className="flex flex-col justify-between gap-5">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0] text-gold">{item.edition}</p>
                    <h2 className="mt-2 font-display text-3xl leading-none">{item.name}</h2>
                    <p className="mt-2 text-sm text-copy-muted">Size {item.size}</p>
                  </div>
                  <p className="text-sm font-bold">{money(item.unitPriceUsd * item.quantity)}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex items-center rounded-full border border-gold/25 bg-panel">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity - 1)}
                      className="gold-focus inline-flex h-10 w-10 items-center justify-center rounded-full"
                      aria-label={`Reduce ${item.name} quantity`}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item, item.quantity + 1)}
                      className="gold-focus inline-flex h-10 w-10 items-center justify-center rounded-full"
                      aria-label={`Increase ${item.name} quantity`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item, 0)}
                    className="gold-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold/20 text-copy-muted transition hover:border-gold hover:text-gold"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[26px] border border-gold/20 bg-panel-muted p-5">
            <p className="text-copy-muted">Your bag is empty. Choose a signature set to begin your edit.</p>
            <Cta href="/collections" className="mt-6">Shop collections</Cta>
          </div>
        )}
      </div>
      <aside className="h-fit rounded-[26px] border border-gold/20 bg-obsidian p-5 text-ivory">
        <h2 className="font-display text-3xl">Order summary</h2>
        <div className="my-5 space-y-3 text-sm text-ivory/70">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
        </div>
        {items.length ? (
          <Cta href="/checkout">Continue to checkout</Cta>
        ) : (
          <Cta href="/collections" variant="light">Start shopping</Cta>
        )}
      </aside>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  cartSubtotal,
  readCart,
  updateCartItemQuantity,
  type CartItem
} from "@/lib/cart";

function money(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

export function MiniCartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  useEffect(() => {
    const syncCart = () => setItems(readCart().items);
    const showCart = () => {
      syncCart();
      setOpen(true);
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("onuora-cart-updated", syncCart);
    window.addEventListener("onuora-cart-open", showCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("onuora-cart-updated", syncCart);
      window.removeEventListener("onuora-cart-open", showCart);
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function updateQuantity(item: CartItem, quantity: number) {
    setItems(updateCartItemQuantity(item.productSlug, item.size, quantity).items);
  }

  return (
    <div
      className={`fixed inset-0 z-[110] transition ${
        open ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-black/52 backdrop-blur-[2px] transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        aria-label="Close shopping bag"
      />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-page text-copy shadow-2xl transition-transform duration-500 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        <div className="flex h-[72px] items-center justify-between border-b border-line px-5">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-4 w-4 text-gold" />
            <h2 className="text-sm font-semibold uppercase">Your bag</h2>
            <span className="text-xs text-copy-muted">
              {items.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="gold-focus grid h-10 w-10 place-items-center hover:bg-surface-subtle"
            aria-label="Close shopping bag"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length ? (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <article
                  key={`${item.productSlug}-${item.size}`}
                  className="grid grid-cols-[88px_1fr] gap-4 border-b border-line py-5"
                >
                  <Link
                    href={`/products/${item.productSlug}`}
                    onClick={() => setOpen(false)}
                    className="gold-focus relative aspect-[3/4] overflow-hidden bg-[#f3f0e9]"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="88px"
                      className="object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.name}</p>
                        <p className="mt-1 text-[10px] uppercase text-copy-muted">
                          {item.edition} · Size {item.size}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-medium">
                        {money(item.unitPriceUsd * item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 items-center border border-line">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="gold-focus grid h-full w-9 place-items-center"
                          aria-label={`Reduce ${item.name} quantity`}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="grid h-full w-8 place-items-center border-x border-line text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="gold-focus grid h-full w-9 place-items-center"
                          aria-label={`Increase ${item.name} quantity`}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item, 0)}
                        className="gold-focus grid h-9 w-9 place-items-center text-copy-muted hover:text-wine"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="border-t border-line bg-panel p-5">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-copy-muted">
                Delivery and taxes are confirmed before payment.
              </p>
              <div className="mt-5 grid gap-2">
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="gold-focus inline-flex min-h-12 items-center justify-center gap-3 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="gold-focus min-h-11 border border-copy px-5 text-xs font-semibold uppercase transition hover:bg-copy hover:text-white"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="grid flex-1 place-items-center p-8 text-center">
            <div>
              <ShoppingBag className="mx-auto h-6 w-6 text-gold" />
              <p className="mt-5 text-lg font-semibold">Your bag is empty.</p>
              <p className="mt-2 text-sm text-copy-muted">
                Discover the new buttoned, buttonless, and original edits.
              </p>
              <Link
                href="/collection"
                onClick={() => setOpen(false)}
                className="gold-focus mt-6 inline-flex min-h-11 items-center gap-3 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian"
              >
                Shop collections
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

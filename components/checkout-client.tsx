"use client";

import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { cartSubtotal, clearCart, readCart, type CartItem } from "@/lib/cart";

type OrderStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; orderId: string }
  | { type: "error"; message: string };

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>(() => readCart().items);
  const [status, setStatus] = useState<OrderStatus>({ type: "idle" });
  const subtotal = useMemo(() => cartSubtotal(items), [items]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!items.length) {
      setStatus({ type: "error", message: "Your bag is empty." });
      return;
    }

    const form = new FormData(event.currentTarget);
    setStatus({ type: "loading" });

    const payload = {
      email: String(form.get("email") ?? ""),
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      currency: String(form.get("currency") ?? "USD"),
      shippingAddress: String(form.get("shippingAddress") ?? ""),
      shippingCity: String(form.get("shippingCity") ?? ""),
      shippingCountry: String(form.get("shippingCountry") ?? ""),
      items: items.map((item) => ({
        productSlug: item.productSlug,
        quantity: item.quantity,
        size: item.size,
        unitPriceUsd: item.unitPriceUsd
      }))
    };

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to place this order right now." });
      return;
    }

    clearCart();
    setItems([]);
    setStatus({ type: "success", orderId: result.orderId });
  }

  return (
    <div className="grid gap-8 md:grid-cols-[1fr_420px]">
      <div>
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Secure checkout</p>
        <h1 className="font-display text-6xl md:text-8xl">Finish with confidence.</h1>
        {status.type === "success" ? (
          <div className="mt-10 rounded-[35px] border border-gold/20 bg-panel p-8">
            <CheckCircle2 className="mb-5 h-10 w-10 text-gold" />
            <h2 className="font-display text-4xl">Order draft received.</h2>
            <p className="mt-4 text-copy-muted">
              Your order reference is <span className="font-bold text-copy">{status.orderId}</span>. Payment and delivery pricing will be added in the next backend phase.
            </p>
            <Link href="/collections" className="gold-focus mt-7 inline-flex min-h-12 items-center justify-center rounded-[3px] bg-gold px-5 py-3 text-xs font-bold uppercase tracking-[0] text-obsidian transition hover:bg-gold-soft">
              Continue shopping
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 grid gap-4">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Email
              <input name="email" type="email" required className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case text-copy" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Full name
              <input name="fullName" required className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case text-copy" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Phone
              <input name="phone" className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case text-copy" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Address
              <input name="shippingAddress" required className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case text-copy" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
                City
                <input name="shippingCity" required className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case text-copy" />
              </label>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
                Country
                <input name="shippingCountry" required className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case text-copy" />
              </label>
            </div>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Currency
              <select name="currency" defaultValue="USD" className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case text-copy">
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
                <option value="NGN">NGN</option>
                <option value="CAD">CAD</option>
              </select>
            </label>
            {status.type === "error" ? <p className="text-sm font-semibold text-red-600">{status.message}</p> : null}
            <button
              type="submit"
              disabled={status.type === "loading" || !items.length}
              className="gold-focus mt-4 inline-flex min-h-12 items-center justify-center gap-3 bg-gold px-5 text-xs font-bold uppercase tracking-[0] text-obsidian transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Place order draft
            </button>
          </form>
        )}
      </div>
      <aside className="h-fit rounded-[35px] border border-gold/20 bg-obsidian p-7 text-ivory">
        <h2 className="font-display text-4xl">Private order summary</h2>
        <div className="mt-7 space-y-4">
          {items.length ? (
            items.map((item) => (
              <div key={`${item.productSlug}-${item.size}`} className="grid grid-cols-[64px_1fr] gap-4 border-b border-ivory/10 pb-4">
                <Image src={item.image} alt={item.name} width={120} height={150} className="aspect-[4/5] rounded-[20px] bg-ivory object-contain p-2" />
                <div>
                  <p className="font-display text-2xl leading-none">{item.name}</p>
                  <p className="mt-2 text-xs text-ivory/62">Size {item.size} x {item.quantity}</p>
                  <p className="mt-2 text-sm font-bold">{money(item.unitPriceUsd * item.quantity)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm leading-7 text-ivory/62">Your bag is empty. Add a garment before checkout.</p>
          )}
        </div>
        <div className="mt-7 space-y-4 text-sm text-ivory/70">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Calculated after address</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

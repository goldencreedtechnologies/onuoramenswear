"use client";

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cartSubtotal, readCart, type CartItem } from "@/lib/cart";

type OrderStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string };

type QuoteStatus =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string };

type DeliveryQuote = {
  id?: string;
  methodName: string;
  shippingUsd: number;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  distanceKm: number | null;
  routeConfidence: string;
  requiresManualReview: boolean;
  note: string;
};

const deliveryFields = new Set([
  "shippingAddress",
  "shippingCity",
  "shippingState",
  "postalCode",
  "shippingCountry"
]);

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function CheckoutClient() {
  const [items] = useState<CartItem[]>(() => readCart().items);
  const [status, setStatus] = useState<OrderStatus>({ type: "idle" });
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>({ type: "idle" });
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const shipping = deliveryQuote?.shippingUsd ?? 0;
  const total = subtotal + shipping;

  function handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;

    if (deliveryQuote && deliveryFields.has(target.name)) {
      setDeliveryQuote(null);
      setQuoteStatus({ type: "idle" });
    }
  }

  async function handleDeliveryQuote() {
    if (!formRef.current) {
      return;
    }

    const form = new FormData(formRef.current);
    const payload = {
      email: String(form.get("email") ?? "") || undefined,
      shippingAddress: String(form.get("shippingAddress") ?? ""),
      shippingCity: String(form.get("shippingCity") ?? ""),
      shippingState: String(form.get("shippingState") ?? "") || undefined,
      postalCode: String(form.get("postalCode") ?? "") || undefined,
      shippingCountry: String(form.get("shippingCountry") ?? ""),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotalUsd: subtotal
    };

    if (!payload.shippingAddress || !payload.shippingCity || !payload.shippingCountry) {
      setQuoteStatus({ type: "error", message: "Add your address, city, and country to estimate delivery." });
      return;
    }

    setQuoteStatus({ type: "loading" });

    const response = await fetch("/api/delivery/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.quote) {
      setQuoteStatus({ type: "error", message: result?.error ?? "Unable to estimate delivery right now." });
      return;
    }

    setDeliveryQuote(result.quote);
    setQuoteStatus({ type: "idle" });
    setStatus({ type: "idle" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!items.length) {
      setStatus({ type: "error", message: "Your bag is empty." });
      return;
    }

    if (!deliveryQuote) {
      setStatus({ type: "error", message: "Estimate delivery before continuing to secure payment." });
      return;
    }

    const form = new FormData(event.currentTarget);
    setStatus({ type: "loading" });

    const payload = {
      email: String(form.get("email") ?? ""),
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      currency: "USD",
      shippingAddress: String(form.get("shippingAddress") ?? ""),
      shippingCity: String(form.get("shippingCity") ?? ""),
      shippingState: String(form.get("shippingState") ?? "") || undefined,
      postalCode: String(form.get("postalCode") ?? "") || undefined,
      shippingCountry: String(form.get("shippingCountry") ?? ""),
      deliveryQuoteId: deliveryQuote?.id,
      items: items.map((item) => ({
        productSlug: item.productSlug,
        quantity: item.quantity,
        size: item.size,
        unitPriceUsd: item.unitPriceUsd
      }))
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus({ type: "error", message: result?.error ?? "Unable to place this order right now." });
      return;
    }

    if (result?.checkoutUrl) {
      window.location.assign(result.checkoutUrl);
      return;
    }

    setStatus({ type: "error", message: "Stripe did not return a checkout URL." });
  }

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_360px]">
      <div>
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Secure checkout</p>
        <h1 className="font-display text-4xl md:text-5xl">Finish with confidence.</h1>
        <form ref={formRef} onSubmit={handleSubmit} onChange={handleFormChange} className="mt-7 grid gap-3">
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Email
              <input name="email" type="email" required className="gold-focus min-h-10 border border-gold/15 bg-panel px-4 text-sm font-normal normal-case text-copy" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Full name
              <input name="fullName" required className="gold-focus min-h-10 border border-gold/15 bg-panel px-4 text-sm font-normal normal-case text-copy" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Phone
              <input name="phone" className="gold-focus min-h-10 border border-gold/15 bg-panel px-4 text-sm font-normal normal-case text-copy" />
            </label>
            <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              Address
              <input name="shippingAddress" required className="gold-focus min-h-10 border border-gold/15 bg-panel px-4 text-sm font-normal normal-case text-copy" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
                City
                <input name="shippingCity" required className="gold-focus min-h-10 border border-gold/15 bg-panel px-4 text-sm font-normal normal-case text-copy" />
              </label>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
                State / Region
                <input name="shippingState" className="gold-focus min-h-10 border border-gold/15 bg-panel px-4 text-sm font-normal normal-case text-copy" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
                Postal code
                <input name="postalCode" className="gold-focus min-h-10 border border-gold/15 bg-panel px-4 text-sm font-normal normal-case text-copy" />
              </label>
              <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
                Country
                <input name="shippingCountry" required className="gold-focus min-h-10 border border-gold/15 bg-panel px-4 text-sm font-normal normal-case text-copy" />
              </label>
            </div>
            <p className="text-sm leading-7 text-copy-muted">
              Payments are securely processed by Stripe in USD. Your bank may show the equivalent in your local currency.
            </p>
            <div className="rounded-[22px] border border-gold/15 bg-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0] text-gold">Delivery estimate</p>
                  <p className="mt-1 text-sm leading-6 text-copy-muted">
                    {deliveryQuote
                      ? `${deliveryQuote.methodName} arrives in ${deliveryQuote.estimatedMinDays}-${deliveryQuote.estimatedMaxDays} business days${deliveryQuote.distanceKm ? ` across ${deliveryQuote.distanceKm} km` : ""}.`
                      : "Estimate delivery before entering secure payment."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDeliveryQuote}
                  disabled={quoteStatus.type === "loading" || !items.length}
                  className="gold-focus inline-flex min-h-10 items-center justify-center gap-2 border border-gold/30 px-4 text-[11px] font-bold uppercase tracking-[0] text-copy transition hover:border-gold hover:bg-gold hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {quoteStatus.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Estimate
                </button>
              </div>
              {quoteStatus.type === "error" ? <p className="mt-3 text-sm font-semibold text-red-600">{quoteStatus.message}</p> : null}
              {deliveryQuote?.requiresManualReview ? <p className="mt-3 text-sm text-copy-muted">{deliveryQuote.note}</p> : null}
            </div>
            {status.type === "error" ? <p className="text-sm font-semibold text-red-600">{status.message}</p> : null}
            <button
              type="submit"
              disabled={status.type === "loading" || !items.length || !deliveryQuote}
              className="gold-focus mt-4 inline-flex min-h-10 items-center justify-center gap-3 bg-gold px-4 text-xs font-bold uppercase tracking-[0] text-obsidian transition hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Proceed to secure payment
            </button>
          </form>
      </div>
      <aside className="h-fit rounded-[26px] border border-gold/20 bg-obsidian p-5 text-ivory">
        <h2 className="font-display text-3xl">Private order summary</h2>
        <div className="mt-5 space-y-3">
          {items.length ? (
            items.map((item) => (
              <div key={`${item.productSlug}-${item.size}`} className="grid grid-cols-[54px_1fr] gap-3 border-b border-ivory/10 pb-3">
                <Image src={item.image} alt={item.name} width={120} height={150} className="aspect-[4/5] rounded-[20px] bg-ivory object-contain p-2" />
                <div>
                  <p className="font-display text-xl leading-none">{item.name}</p>
                  <p className="mt-2 text-xs text-ivory/62">Size {item.size} x {item.quantity}</p>
                  <p className="mt-2 text-sm font-bold">{money(item.unitPriceUsd * item.quantity)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm leading-7 text-ivory/62">Your bag is empty. Add a garment before checkout.</p>
          )}
        </div>
        <div className="mt-5 space-y-3 text-sm text-ivory/70">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{deliveryQuote ? money(shipping) : "Estimate available"}</span>
          </div>
          <div className="flex justify-between border-t border-ivory/10 pt-3 text-ivory">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

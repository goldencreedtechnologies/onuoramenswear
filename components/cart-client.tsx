"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useCurrency } from "@/components/currency-provider";
import {
  PRODUCT_PRICES,
  PRODUCT_TYPE_LABEL,
  PROMOTIONS,
  formatCurrency,
  promotionDiscountForQuantity,
  type CurrencyCode
} from "@/data/site-config";
import { resolveShippingRule, shippingIncreaseForNextOutfit } from "@/lib/commerce/shipping-rules";
import { readCart, updateCartItemQuantity, type CartItem } from "@/lib/cart";

const SHIPPING_COUNTRY_KEY = "onuora-shipping-country";

function ShippingMoney({ currency, amount }: { currency: CurrencyCode; amount: number }) {
  return <>{formatCurrency(currency, amount)}</>;
}

export function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [shippingCountry] = useState(() =>
    typeof window === "undefined" ? "" : window.localStorage.getItem(SHIPPING_COUNTRY_KEY) ?? ""
  );
  const { currency } = useCurrency();
  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const subtotal = PRODUCT_PRICES[currency] * itemCount;
  const wardrobeDiscount = promotionDiscountForQuantity(itemCount, currency);
  const shippingRule = shippingCountry
    ? resolveShippingRule({ shippingCountry, itemCount, currency })
    : null;
  const sameCurrencyShipping = shippingRule?.displayCurrency === currency ? shippingRule.displayAmount ?? 0 : 0;
  const total = subtotal - wardrobeDiscount + sameCurrencyShipping;
  const money = (amount: number) => formatCurrency(currency, amount);

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
    const nextCart = updateCartItemQuantity(item.productSlug, item.size, item.colorName, quantity);
    setItems(nextCart.items);
  }

  if (!items.length) {
    return (
      <div className="mt-8 border-y border-line py-16 text-center">
        <p className="text-sm text-copy-muted">Your cart is currently empty.</p>
        <Link href="/collection" className="gold-focus mt-6 inline-flex min-h-12 items-center gap-3 bg-obsidian px-6 text-xs font-semibold uppercase text-ivory hover:bg-gold hover:text-obsidian">
          Explore Collections
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const nextShippingIncrease = shippingCountry
    ? shippingIncreaseForNextOutfit({ shippingCountry, itemCount, currency })
    : null;
  const halfPriceValue = Math.round(PRODUCT_PRICES[currency] * (PROMOTIONS.campaigns[PROMOTIONS.activeCampaign].discountPercent / 100));
  const combinedThirdCost = nextShippingIncrease === null ? null : halfPriceValue + nextShippingIncrease;

  return (
    <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-10">
      <div className="border-t border-line">
        {items.map((item) => (
          <article key={`${item.productSlug}-${item.size}-${item.colorName}`} className="grid grid-cols-[116px_1fr] gap-4 border-b border-line py-7 sm:grid-cols-[140px_1fr] sm:gap-5">
            <Link href={`/products/${item.productSlug}`} className="gold-focus relative aspect-[4/5] overflow-hidden bg-page">
              <Image src={item.image} alt={item.name} fill sizes="140px" className="object-cover object-top" />
            </Link>
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[9px] font-semibold uppercase text-gold">{item.edition}</p>
                  <h2 className="mt-1 truncate text-base font-semibold sm:text-lg">{item.name}</h2>
                  <p className="mt-1 text-[11px] leading-5 text-copy-muted">{PRODUCT_TYPE_LABEL}<br />{item.colorName} · Size {item.size}</p>
                </div>
                <p className="shrink-0 text-sm font-medium">{money(PRODUCT_PRICES[currency] * item.quantity)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3">
                <div className="flex h-10 items-center border border-line">
                  <button type="button" onClick={() => updateQuantity(item, item.quantity - 1)} className="gold-focus flex h-full w-10 items-center justify-center hover:bg-surface-subtle" aria-label={`Reduce ${item.name} quantity`}><Minus className="h-3.5 w-3.5" /></button>
                  <span className="grid h-full w-9 place-items-center border-x border-line text-xs font-semibold">{item.quantity}</span>
                  <button type="button" onClick={() => updateQuantity(item, item.quantity + 1)} className="gold-focus flex h-full w-10 items-center justify-center hover:bg-surface-subtle" aria-label={`Increase ${item.name} quantity`}><Plus className="h-3.5 w-3.5" /></button>
                </div>
                <button type="button" onClick={() => updateQuantity(item, 0)} className="gold-focus inline-flex h-10 w-10 items-center justify-center text-copy-muted transition hover:text-wine" aria-label={`Remove ${item.name}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </article>
        ))}

        <section className="mt-6 border border-line p-5" aria-live="polite">
          {itemCount === 1 ? (
            <>
              {shippingRule && !shippingRule.requiresManualQuote && nextShippingIncrease === 0 ? (
                <>
                  <h2 className="text-lg font-semibold">Add a Second Outfit With No Increase in International Shipping</h2>
                  <p className="mt-2 text-sm leading-6 text-copy-muted">Your second outfit remains within the same 1–2 outfit delivery band.</p>
                </>
              ) : null}
              <p className="mt-3 text-sm font-semibold">Add another outfit for {money(PRODUCT_PRICES[currency])}.</p>
              <Link href="/collection" className="gold-focus mt-5 inline-flex min-h-12 items-center justify-center border border-copy px-5 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white">Add a Second Outfit</Link>
              <p className="mt-4 text-sm leading-6 text-copy-muted">Add two more outfits to receive 50% off your third.</p>
            </>
          ) : null}

          {itemCount === 2 ? (
            <>
              <h2 className="text-lg font-semibold">Your Third Outfit Is Half Price</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-5"><span className="text-copy-muted">Half-price garment value</span><span>{money(halfPriceValue)}</span></div>
                <div className="flex justify-between gap-5"><span className="text-copy-muted">Shipping-band increase</span><span>{nextShippingIncrease === null ? "Calculated after address" : money(nextShippingIncrease)}</span></div>
                <div className="flex justify-between gap-5 border-t border-line pt-3 font-semibold"><span>Combined additional checkout cost</span><span>{combinedThirdCost === null ? "Calculated after address" : money(combinedThirdCost)}</span></div>
              </div>
              <Link href="/collection" className="gold-focus mt-5 inline-flex min-h-12 items-center justify-center border border-copy px-5 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white">Add a Third Outfit</Link>
            </>
          ) : null}

          {itemCount === 3 ? (
            <>
              <h2 className="text-lg font-semibold">Your Wardrobe Offer Has Been Applied</h2>
              <p className="mt-2 text-sm leading-6 text-copy-muted">You have received 50% off the lowest-priced qualifying outfit.</p>
              <Link href="/collection" className="gold-focus mt-5 inline-flex min-h-12 items-center justify-center border border-copy px-5 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white">Continue Shopping</Link>
            </>
          ) : null}

          {itemCount >= 4 ? (
            <>
              <h2 className="text-lg font-semibold">Your Active Wardrobe Discount Is Shown in the Order Summary.</h2>
              <Link href="/collection" className="gold-focus mt-5 inline-flex min-h-12 items-center justify-center border border-copy px-5 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white">Continue Shopping</Link>
            </>
          ) : null}
        </section>

        <Link href="/collection" className="gold-focus mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase text-copy-muted underline underline-offset-4 hover:text-copy">Continue Shopping</Link>
      </div>

      <aside className="bg-surface-subtle p-5 sm:p-6 lg:sticky lg:top-[124px]">
        <h2 className="text-lg font-semibold">Order Summary</h2>
        <div className="my-5 space-y-3 border-y border-line py-5 text-sm">
          <div className="flex justify-between gap-5"><span className="text-copy-muted">Subtotal</span><span>{money(subtotal)}</span></div>
          {wardrobeDiscount > 0 ? <div className="flex justify-between gap-5"><span className="text-copy-muted">Wardrobe Discount</span><span>-{money(wardrobeDiscount)}</span></div> : null}
          <div className="flex justify-between gap-5">
            <span className="text-copy-muted">{shippingRule?.label ?? "Shipping"}</span>
            <span className="text-right">
              {!shippingRule ? "Calculated after address" : shippingRule.requiresManualQuote ? "Manual quotation" : <ShippingMoney currency={shippingRule.displayCurrency} amount={shippingRule.displayAmount ?? 0} />}
            </span>
          </div>
          {!shippingRule ? <p className="text-xs leading-5 text-copy-muted">Shipping is based on your destination and the number of outfits in your bag.</p> : null}
        </div>
        <div className="flex justify-between text-base font-semibold"><span>Total</span><span>{shippingRule?.requiresManualQuote ? "Quotation required" : money(total)}</span></div>

        {itemCount >= 7 ? (
          <div className="mt-6">
            <p className="text-sm leading-6 text-copy-muted">Please contact Client Care for a delivery quotation on orders of seven outfits or more.</p>
            <Link href="/contact?enquiry=large-order-delivery-quote" className="gold-focus mt-4 inline-flex min-h-14 w-full items-center justify-center bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian">Request a Delivery Quote</Link>
          </div>
        ) : (
          <Link href="/checkout" className="gold-focus mt-6 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian">Secure Checkout<ArrowRight className="h-4 w-4" /></Link>
        )}
      </aside>
    </div>
  );
}

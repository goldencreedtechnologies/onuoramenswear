"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const rates = {
  USD: 1,
  GBP: 0.79,
  EUR: 0.92,
  NGN: 1530,
  CAD: 1.36,
  AUD: 1.52,
  ZAR: 18.8,
  GHS: 15.2,
  KES: 129,
  XOF: 606,
  INR: 83.5
} as const;

const currencies = Object.keys(rates) as Array<keyof typeof rates>;

export function CurrencyConverter({
  priceUsd,
  className
}: {
  priceUsd: number;
  accentText?: string;
  panelText?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState<keyof typeof rates>("USD");

  const amount = useMemo(() => {
    const converted = priceUsd * rates[currency];
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "NGN" || currency === "XOF" ? 0 : 2
    }).format(converted);
  }, [currency, priceUsd]);

  return (
    <div className={cn("relative mt-2 w-fit", className)}>
      <button
        type="button"
        className="gold-focus inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase text-copy-muted hover:text-copy"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Choose display currency"
      >
        {currency}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
        {currency !== "USD" ? <span className="ml-1 normal-case text-copy">{amount}</span> : null}
      </button>
      {open ? (
        <div className="absolute left-0 top-full z-30 mt-2 grid min-w-44 bg-page p-1.5 shadow-xl ring-1 ring-line">
          {currencies.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setCurrency(item);
                setOpen(false);
              }}
              className={cn(
                "gold-focus flex min-h-9 items-center justify-between px-3 text-left text-xs transition hover:bg-surface-subtle",
                currency === item && "font-semibold"
              )}
            >
              {item}
              <span className="ml-5 text-copy-muted">
                {new Intl.NumberFormat("en", {
                  style: "currency",
                  currency: item,
                  maximumFractionDigits: item === "NGN" || item === "XOF" ? 0 : 2
                }).format(priceUsd * rates[item])}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

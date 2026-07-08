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

type CurrencyConverterProps = {
  priceUsd: number;
  accentText: string;
  panelText: string;
};

export function CurrencyConverter({ priceUsd, accentText, panelText }: CurrencyConverterProps) {
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
    <div className="mt-3">
      <button
        type="button"
        className="gold-focus inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0]"
        onClick={() => setOpen((value) => !value)}
        style={{ color: accentText }}
        aria-expanded={open}
        aria-label="Open currency selector"
      >
        <span className="underline decoration-gold/40 underline-offset-4">USD</span>
        <ChevronDown className="h-4 w-4" />
      </button>
      {open ? (
        <div className="mt-3 inline-flex flex-col gap-1 rounded-[22px] border border-gold/20 bg-panel p-2 shadow-lg shadow-black/10">
          {currencies.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setCurrency(item);
                setOpen(false);
              }}
              className={cn(
                "gold-focus rounded-[18px] px-3 py-2 text-left text-sm font-semibold transition hover:bg-gold hover:text-obsidian",
                currency === item ? "bg-gold text-obsidian" : "text-copy"
              )}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-3 text-sm" style={{ color: panelText }}>
        {amount} equivalent
      </div>
    </div>
  );
}

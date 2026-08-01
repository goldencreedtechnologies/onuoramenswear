"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { ChevronDown } from "lucide-react";
import {
  CURRENCY_PREFERENCE_KEY,
  SUPPORTED_CURRENCIES,
  detectSuggestedCurrency,
  fixedProductPriceLabel,
  formatCurrency,
  isCurrencyCode,
  operationalUsdAmountInCurrency,
  type CurrencyCode
} from "@/data/site-config";
import { cn } from "@/lib/cn";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
};

const CurrencyContext = createContext<CurrencyContextValue>({
  currency: "USD",
  setCurrency: () => undefined
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const currency = useSyncExternalStore<CurrencyCode>(
    (onStoreChange) => {
      window.addEventListener("onuora-currency-updated", onStoreChange);
      return () => window.removeEventListener("onuora-currency-updated", onStoreChange);
    },
    () => {
    const saved = window.localStorage.getItem(CURRENCY_PREFERENCE_KEY);
    if (isCurrencyCode(saved)) {
        return saved;
    }

    const suggested = detectSuggestedCurrency(
      navigator.languages?.length ? navigator.languages : [navigator.language],
      Intl.DateTimeFormat().resolvedOptions().timeZone
    );
      window.localStorage.setItem(CURRENCY_PREFERENCE_KEY, suggested);
      return suggested;
    },
    () => "USD" as CurrencyCode
  );

  function setCurrency(nextCurrency: CurrencyCode) {
    window.localStorage.setItem(CURRENCY_PREFERENCE_KEY, nextCurrency);
    window.dispatchEvent(new CustomEvent("onuora-currency-updated", { detail: nextCurrency }));
  }

  const value = useMemo(() => ({ currency, setCurrency }), [currency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencySelector({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="gold-focus inline-flex h-10 min-w-14 items-center justify-center gap-1 px-2 text-[10px] font-semibold uppercase"
        aria-label="Choose Currency"
        aria-expanded={open}
      >
        {currency}
        <ChevronDown className={cn("h-3.5 w-3.5 transition", open && "rotate-180")} />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-[130] mt-2 min-w-24 bg-page p-1.5 text-copy shadow-xl ring-1 ring-line">
          {SUPPORTED_CURRENCIES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setCurrency(code);
                setOpen(false);
              }}
              className={cn(
                "gold-focus flex min-h-9 w-full items-center px-3 text-left text-xs hover:bg-surface-subtle",
                code === currency && "font-semibold"
              )}
            >
              {code}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ProductPrice({ quantity = 1, className }: { quantity?: number; className?: string }) {
  const { currency } = useCurrency();
  return <span className={className}>{fixedProductPriceLabel(currency, quantity)}</span>;
}

export function OperationalAmount({ amountUsd, className }: { amountUsd: number; className?: string }) {
  const { currency } = useCurrency();
  return (
    <span className={className}>
      {formatCurrency(currency, operationalUsdAmountInCurrency(amountUsd, currency))}
    </span>
  );
}

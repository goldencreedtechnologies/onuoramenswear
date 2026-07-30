"use client";

import { CurrencySelector, ProductPrice } from "@/components/currency-provider";
import { cn } from "@/lib/cn";

export function CurrencyConverter({ className }: { priceUsd?: number; accentText?: string; panelText?: string; className?: string }) {
  return (
    <div className={cn("mt-2 flex items-center gap-3", className)}>
      <ProductPrice className="text-sm font-semibold text-copy" />
      <CurrencySelector />
    </div>
  );
}

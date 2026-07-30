"use client";

import { useCurrency } from "@/components/currency-provider";
import type { RegionalPrices } from "@/data/phase-one-collections";
import { PRODUCT_INCLUSION_LABEL, formatCurrency } from "@/data/site-config";
import { cn } from "@/lib/cn";

export function RegionalPriceList({
  prices,
  className,
  compact = false
}: {
  prices: RegionalPrices;
  className?: string;
  compact?: boolean;
}) {
  const { currency } = useCurrency();
  const price = formatCurrency(currency, prices[currency]);

  if (compact) {
    return (
      <p className={cn("shrink-0 text-right text-xs font-medium text-copy", className)}>
        {price}
        <span className="mt-1 block text-[9px] font-normal uppercase text-copy-muted">
          {PRODUCT_INCLUSION_LABEL}
        </span>
      </p>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm font-semibold text-copy">{price}</p>
      <p className="text-[10px] uppercase text-copy-muted">{PRODUCT_INCLUSION_LABEL}</p>
    </div>
  );
}

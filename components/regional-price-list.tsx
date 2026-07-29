import type { RegionalCurrency, RegionalPrices } from "@/data/phase-one-collections";
import { cn } from "@/lib/cn";

const priceLocales: Record<RegionalCurrency, string> = {
  NGN: "en-NG",
  USD: "en-US",
  GBP: "en-GB"
};

function formatRegionalPrice(currency: RegionalCurrency, value: number) {
  return new Intl.NumberFormat(priceLocales[currency], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0
  }).format(value);
}

export function RegionalPriceList({
  prices,
  className,
  compact = false
}: {
  prices: RegionalPrices;
  className?: string;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <p className={cn("shrink-0 text-right text-xs font-medium text-copy", className)}>
        {formatRegionalPrice("USD", prices.USD)}
        <span className="mt-1 block text-[9px] font-normal uppercase text-copy-muted">
          From {formatRegionalPrice("NGN", prices.NGN)}
        </span>
      </p>
    );
  }

  return (
    <dl className={cn("flex flex-wrap gap-x-3 gap-y-1.5", className)}>
      {(Object.keys(priceLocales) as RegionalCurrency[]).map((currency) => (
        <div key={currency} className="flex items-baseline gap-1.5 whitespace-nowrap">
          <dt className="text-[9px] font-semibold uppercase text-copy-muted">{currency}</dt>
          <dd className="text-[11px] font-medium text-copy">
            {formatRegionalPrice(currency, prices[currency])}
          </dd>
        </div>
      ))}
    </dl>
  );
}

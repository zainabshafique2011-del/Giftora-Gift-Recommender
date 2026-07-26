import { CURRENCIES, useCurrency, type CurrencyCode } from "@/lib/currency";

/**
 * Currency dropdown. `variant="field"` matches the form inputs,
 * `variant="pill"` is the compact version used in the navigation.
 */
export function CurrencySelect({
  variant = "field",
  className = "",
  id,
}: {
  variant?: "field" | "pill";
  className?: string;
  id?: string;
}) {
  const { code, currency, setCurrency } = useCurrency();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
    setCurrency(e.target.value as CurrencyCode);

  if (variant === "pill") {
    return (
      <div className={`relative ${className}`}>
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm">
          {currency.flag}
        </span>
        <select
          id={id}
          value={code}
          onChange={onChange}
          aria-label="Preferred currency"
          className="cursor-pointer appearance-none rounded-full border border-border/60 bg-background/70 py-1.5 pl-8 pr-7 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:bg-lavender focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} {c.symbol}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base">
        {currency.flag}
      </span>
      <select
        id={id}
        value={code}
        onChange={onChange}
        aria-label="Preferred currency"
        className="input pl-10"
      >
        {CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} ({c.symbol}) — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

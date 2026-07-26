import { useCallback, useEffect, useState } from "react";

export type CurrencyCode =
  | "USD"
  | "EUR"
  | "GBP"
  | "PKR"
  | "INR"
  | "AED"
  | "SAR"
  | "CAD"
  | "AUD"
  | "JPY";

export type Currency = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
  /** Units per 1 USD. Replace with live rates later. */
  rate: number;
  /** Rounding step used when converting from the USD base budget. */
  step: number;
};

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", flag: "🇺🇸", rate: 1, step: 1 },
  { code: "EUR", symbol: "€", name: "Euro", flag: "🇪🇺", rate: 0.92, step: 1 },
  { code: "GBP", symbol: "£", name: "British Pound", flag: "🇬🇧", rate: 0.79, step: 1 },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee", flag: "🇵🇰", rate: 278, step: 100 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", flag: "🇮🇳", rate: 83, step: 50 },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham", flag: "🇦🇪", rate: 3.67, step: 5 },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal", flag: "🇸🇦", rate: 3.75, step: 5 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", flag: "🇨🇦", rate: 1.36, step: 1 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", flag: "🇦🇺", rate: 1.52, step: 1 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", flag: "🇯🇵", rate: 157, step: 100 },
];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

const STORAGE_KEY = "giftora:currency";
const EVENT = "giftora:currency-change";

export function getCurrency(code: string | undefined | null): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

/** Convert a USD amount into the target currency (simulated rates for now). */
export function convertFromUsd(usd: number, code: CurrencyCode): number {
  const c = getCurrency(code);
  const raw = usd * c.rate;
  return Math.max(c.step, Math.round(raw / c.step) * c.step);
}

export function formatAmount(amount: number, code: CurrencyCode): string {
  const c = getCurrency(code);
  return `${c.symbol}${Math.round(amount).toLocaleString("en-US")}`;
}

/** Format a USD amount directly in the selected currency. */
export function formatFromUsd(usd: number, code: CurrencyCode): string {
  return formatAmount(convertFromUsd(usd, code), code);
}

function readStored(): CurrencyCode {
  if (typeof window === "undefined") return DEFAULT_CURRENCY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && CURRENCIES.some((c) => c.code === raw)) return raw as CurrencyCode;
  } catch {
    // ignore
  }
  return DEFAULT_CURRENCY;
}

export function setStoredCurrency(code: CurrencyCode) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, code);
    window.dispatchEvent(new CustomEvent(EVENT));
  } catch {
    // ignore
  }
}

/** Shared currency preference, persisted in Local Storage and synced across components/tabs. */
export function useCurrency() {
  const [code, setCode] = useState<CurrencyCode>(() => readStored());

  useEffect(() => {
    const sync = () => setCode(readStored());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const update = useCallback((next: CurrencyCode) => {
    setCode(next);
    setStoredCurrency(next);
  }, []);

  return { code, currency: getCurrency(code), setCurrency: update };
}

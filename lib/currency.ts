// Shared money formatting for every market's currency. One place to add a
// locale when a new market is added, instead of updating formatMoney/money
// helpers duplicated across admin pages and lib/email.ts.

const CURRENCY_LOCALES: Record<string, string> = {
  USD: "en-US",
  IDR: "id-ID",
  BRL: "pt-BR",
  MMK: "my-MM",
};

// Currencies conventionally shown as whole units (no cents/centavos).
const ZERO_DECIMAL_CURRENCIES = new Set(["IDR", "MMK"]);

// Fallback symbol for currencies Intl.NumberFormat may not render nicely in
// every environment (e.g. MMK support varies by ICU data).
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  IDR: "Rp",
  BRL: "R$",
  MMK: "K",
};

export function formatMoney(amount: number, currency: string = "USD"): string {
  const locale = CURRENCY_LOCALES[currency] ?? "en-US";
  const maximumFractionDigits = ZERO_DECIMAL_CURRENCIES.has(currency) ? 0 : 2;
  try {
    return amount.toLocaleString(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits,
    });
  } catch {
    // Unknown/unsupported currency code — fall back to a manual symbol.
    const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
    return `${symbol} ${amount.toLocaleString("en-US", { maximumFractionDigits })}`;
  }
}

export function currencySymbol(currency: string = "USD"): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}

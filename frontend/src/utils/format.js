export function formatCurrency(value, currency = "USD", locale) {
  const amount = Number(value || 0);
  const resolvedLocale =
    locale || (typeof document !== "undefined" ? document.documentElement.lang || "en-US" : "en-US");
  try {
    return new Intl.NumberFormat(resolvedLocale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}

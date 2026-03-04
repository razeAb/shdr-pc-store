import { useEffect, useState } from "react";

const STORAGE_KEY = "shdr-banner-dismissed";

export default function PromoBanner() {
  const [isDismissed, setIsDismissed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isDismissed));
  }, [isDismissed]);

  if (isDismissed) return null;

  return (
    <div className="promo-banner" role="region" aria-label="Store promotion">
      <p>Free Israel shipping over ILS 200 - Same-day pickup available</p>
      <button
        type="button"
        className="icon-button"
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss promotion"
      >
        x
      </button>
    </div>
  );
}

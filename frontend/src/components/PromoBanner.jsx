import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext.jsx";

const STORAGE_KEY = "shdr-banner-dismissed";

export default function PromoBanner() {
  const { t } = useLang();
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
    <div className="promo-banner" role="region" aria-label={t({ en: "Store promotion", he: "מבצע בחנות" })}>
      <p>{t({ en: "Free Israel shipping over ILS 200 - Same-day pickup available", he: "משלוח חינם בישראל מעל ₪200 - איסוף באותו היום זמין" })}</p>
      <button
        type="button"
        className="icon-button"
        onClick={() => setIsDismissed(true)}
        aria-label={t({ en: "Dismiss promotion", he: "סגירת מבצע" })}
      >
        x
      </button>
    </div>
  );
}

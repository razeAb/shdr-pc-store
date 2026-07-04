import { useEffect } from "react";
import { SlidersHorizontal } from "lucide-react";
import FilterSidebar from "./FilterSidebar.jsx";
import { useLang } from "../context/LangContext.jsx";

export default function FilterDrawer({
  isOpen,
  onOpen,
  onClose,
  groups,
  onToggle,
  onClear,
  hasActiveFilters,
  resultCount
}) {
  const { t } = useLang();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <>
      <button type="button" className="secondary-button filter-drawer__trigger" onClick={onOpen}>
        <SlidersHorizontal size={16} aria-hidden="true" />
        {t({ en: "Filters", he: "סינון" })}
        {hasActiveFilters ? <span className="filter-drawer__trigger-badge" aria-hidden="true" /> : null}
      </button>
      {isOpen ? (
        <div className="cart-drawer__overlay filter-drawer__overlay" onClick={onClose} role="presentation">
          <div
            className="cart-drawer__panel filter-drawer__panel"
            role="dialog"
            aria-modal="true"
            aria-label={t({ en: "Filters", he: "סינון" })}
            onClick={(event) => event.stopPropagation()}
          >
            <header className="cart-drawer__header">
              <h2 className="cart-drawer__title">{t({ en: "Filters", he: "סינון" })}</h2>
              <button
                className="cart-drawer__close"
                type="button"
                onClick={onClose}
                aria-label={t({ en: "Close filters", he: "סגור סינון" })}
              >
                ×
              </button>
            </header>
            <div className="cart-drawer__body filter-drawer__body">
              <FilterSidebar
                groups={groups}
                onToggle={onToggle}
                onClear={onClear}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
            <footer className="cart-drawer__footer">
              <button type="button" className="cart-drawer__primary" onClick={onClose}>
                {t({ en: `Show ${resultCount} results`, he: `הצג ${resultCount} תוצאות` })}
              </button>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

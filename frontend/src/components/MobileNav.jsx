import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, ChevronDown } from "lucide-react";
import {
  CATEGORY_LABELS,
  OTHER_CATEGORIES,
  PRIMARY_CATEGORIES,
  PRODUCT_TYPE_LABELS,
  getProductTypesByCategory
} from "../utils/products.js";
import { useProducts } from "../context/ProductsContext.jsx";
import { useLang } from "../context/LangContext.jsx";

export default function MobileNav() {
  const { t } = useLang();
  const { products } = useProducts();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const productTypesByCategory = useMemo(() => getProductTypesByCategory(products), [products]);
  const allCategories = [...PRIMARY_CATEGORIES, ...OTHER_CATEGORIES];

  useEffect(() => {
    setIsOpen(false);
  }, [location.search, location.pathname]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="icon-button mobile-nav__trigger"
        onClick={() => setIsOpen(true)}
        aria-label={t({ en: "Open menu", he: "פתיחת תפריט" })}
        aria-expanded={isOpen}
      >
        <Menu size={20} aria-hidden="true" />
      </button>
      {isOpen
        ? createPortal(
            <div className="mobile-nav__overlay" onClick={() => setIsOpen(false)} role="presentation">
              <nav
                className="mobile-nav__panel"
                aria-label={t({ en: "Shop by category", he: "קנייה לפי קטגוריה" })}
                onClick={(event) => event.stopPropagation()}
              >
                <header className="mobile-nav__header">
                  <h2>{t({ en: "Categories", he: "קטגוריות" })}</h2>
                  <button
                    type="button"
                    className="mobile-nav__close"
                    onClick={() => setIsOpen(false)}
                    aria-label={t({ en: "Close menu", he: "סגור תפריט" })}
                  >
                    ×
                  </button>
                </header>
                <div className="mobile-nav__body">
                  {allCategories.map((name) => {
                    const subTypes = productTypesByCategory[name] || [];
                    const isExpanded = expandedCategory === name;
                    return (
                      <div key={name} className="mobile-nav__group">
                        <div className="mobile-nav__group-row">
                          <Link className="mobile-nav__category-link" to={`/search?category=${encodeURIComponent(name)}`}>
                            {t(CATEGORY_LABELS[name] || name)}
                          </Link>
                          {subTypes.length > 0 ? (
                            <button
                              type="button"
                              className="mobile-nav__expand"
                              onClick={() => setExpandedCategory(isExpanded ? null : name)}
                              aria-expanded={isExpanded}
                              aria-label={t({ en: `Toggle ${name} types`, he: `הצג/הסתר סוגי מוצר ב-${name}` })}
                            >
                              <ChevronDown size={16} className={isExpanded ? "is-open" : ""} aria-hidden="true" />
                            </button>
                          ) : null}
                        </div>
                        {isExpanded ? (
                          <div className="mobile-nav__subitems">
                            {subTypes.map((productType) => (
                              <Link
                                key={productType}
                                className="mobile-nav__subitem"
                                to={`/search?category=${encodeURIComponent(name)}&type=${encodeURIComponent(productType)}`}
                              >
                                {t(PRODUCT_TYPE_LABELS[productType] || productType)}
                              </Link>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </nav>
            </div>,
            document.body
          )
        : null}
    </>
  );
}

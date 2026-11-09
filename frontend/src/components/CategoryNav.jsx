import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Wrench } from "lucide-react";
import {
  CATEGORY_LABELS,
  OTHER_CATEGORIES,
  PRIMARY_CATEGORIES,
  PRODUCT_TYPE_LABELS,
  getProductTypesByCategory
} from "../utils/products.js";
import { useProducts } from "../context/ProductsContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const OTHER_KEY = "__other__";
const CLOSE_DELAY = 150;

export default function CategoryNav() {
  const location = useLocation();
  const { t } = useLang();
  const { products } = useProducts();
  const [openKey, setOpenKey] = useState(null);
  const wrapperRef = useRef(null);
  const closeTimerRef = useRef(null);

  const productTypesByCategory = useMemo(() => getProductTypesByCategory(products), [products]);

  const activeCategory = new URLSearchParams(location.search).get("category") || "";
  const isOtherActive = OTHER_CATEGORIES.includes(activeCategory);

  useEffect(() => {
    const handleOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpenKey(null);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  useEffect(() => {
    setOpenKey(null);
  }, [location.search]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  const openNow = (key) => {
    window.clearTimeout(closeTimerRef.current);
    setOpenKey(key);
  };

  const scheduleClose = () => {
    closeTimerRef.current = window.setTimeout(() => setOpenKey(null), CLOSE_DELAY);
  };

  return (
    <nav
      className="primary-nav"
      aria-label={t({ en: "Shop by category", he: "קנייה לפי קטגוריה" })}
      ref={wrapperRef}
    >
      <Link
        className={`nav-link nav-link--builder ${location.pathname === "/build" ? "active" : ""}`}
        to="/build"
      >
        <Wrench size={14} aria-hidden="true" />
        {t({ en: "Build a PC", he: "בנה מחשב" })}
      </Link>
      {PRIMARY_CATEGORIES.map((name) => {
        const subTypes = productTypesByCategory[name] || [];
        return (
          <div
            key={name}
            className="nav-dropdown"
            onMouseEnter={() => openNow(name)}
            onMouseLeave={scheduleClose}
          >
            <Link
              className={`nav-link nav-dropdown__trigger ${activeCategory === name ? "active" : ""}`}
              to={`/search?category=${encodeURIComponent(name)}`}
              aria-expanded={openKey === name}
              aria-haspopup={subTypes.length > 0}
              onFocus={() => openNow(name)}
            >
              {t(CATEGORY_LABELS[name] || name)}
              {subTypes.length > 0 ? <ChevronDown size={14} aria-hidden="true" /> : null}
            </Link>
            {openKey === name && subTypes.length > 0 ? (
              <div className="nav-dropdown__menu" role="menu">
                {subTypes.map((productType) => (
                  <Link
                    key={productType}
                    className="nav-dropdown__item"
                    to={`/search?category=${encodeURIComponent(name)}&type=${encodeURIComponent(productType)}`}
                    role="menuitem"
                  >
                    {t(PRODUCT_TYPE_LABELS[productType] || productType)}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        );
      })}
      <div
        className="nav-dropdown"
        onMouseEnter={() => openNow(OTHER_KEY)}
        onMouseLeave={scheduleClose}
      >
        <button
          type="button"
          className={`nav-link nav-dropdown__trigger ${isOtherActive ? "active" : ""}`}
          onClick={() => setOpenKey((key) => (key === OTHER_KEY ? null : OTHER_KEY))}
          aria-expanded={openKey === OTHER_KEY}
          aria-haspopup="true"
        >
          {t({ en: "Other Electronics", he: "אלקטרוניקה נוספת" })}
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        {openKey === OTHER_KEY ? (
          <div className="nav-dropdown__menu" role="menu">
            {OTHER_CATEGORIES.map((name) => (
              <Link
                key={name}
                className={`nav-dropdown__item ${activeCategory === name ? "active" : ""}`}
                to={`/search?category=${encodeURIComponent(name)}`}
                role="menuitem"
              >
                {t(CATEGORY_LABELS[name] || name)}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </nav>
  );
}

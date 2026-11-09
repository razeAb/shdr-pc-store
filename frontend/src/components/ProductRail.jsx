import { useMemo, useState } from "react";
import { useProducts } from "../context/ProductsContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { getDefaultBadge } from "../utils/products.js";
import ProductCard from "./ProductCard.jsx";

/**
 * Generic tabbed horizontal product rail. Reusable anywhere a set of
 * {label, getItems} tabs need to render a swipeable row of ProductCards
 * against the already-loaded catalog — not just the homepage.
 *
 * tabs: [{ key, label: {en,he}, getItems: (products) => Product[], getBadge?: (product) => string }]
 */
export default function ProductRail({ title, tabs, onAdd, showDetails = false }) {
  const { products, loading, error, refresh } = useProducts();
  const { t } = useLang();
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);

  const activeTab = tabs.find((tab) => tab.key === activeKey) || tabs[0];

  const items = useMemo(() => {
    if (!activeTab) return [];
    return activeTab.getItems(products) || [];
  }, [products, activeTab]);

  if (loading) return <section className="product-rail" aria-busy="true" aria-label={title}><h2>{title}</h2><div className="product-loading">{[0, 1, 2, 3].map((item) => <div key={item} />)}</div></section>;

  return (
    <section className="product-rail" aria-labelledby={`rail-${title.replace(/\s+/g, "-")}`}>
      <div className="product-rail__header">
        <h2 id={`rail-${title.replace(/\s+/g, "-")}`}>{title}</h2>
        <div className="product-rail__tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={tab.key === activeTab?.key}
              className={`product-rail__tab ${tab.key === activeTab?.key ? "active" : ""}`}
              onClick={() => setActiveKey(tab.key)}
            >
              {t(tab.label)}
            </button>
          ))}
        </div>
      </div>
      {error ? (
        <div className="catalog-error"><p>{t({ en: "We couldn’t load the products. Please try again.", he: "לא הצלחנו לטעון את המוצרים. אפשר לנסות שוב." })}</p><button type="button" className="secondary-button" onClick={() => refresh()}>{t({ en: "Try again", he: "ניסיון נוסף" })}</button></div>
      ) : items.length === 0 ? (
        <p className="filter-empty">{t({ en: "No products yet.", he: "אין מוצרים עדיין." })}</p>
      ) : (
        <div className="product-rail__track">
          {items.map((product) => (
            <div className="product-rail__item" key={product.id}>
              <ProductCard
                showDetails={showDetails}
                product={product}
                onAdd={onAdd}
                badge={activeTab.getBadge ? activeTab.getBadge(product) : getDefaultBadge(product, t)}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

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
export default function ProductRail({ title, tabs, onAdd }) {
  const { products, loading } = useProducts();
  const { t } = useLang();
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);

  const activeTab = tabs.find((tab) => tab.key === activeKey) || tabs[0];

  const items = useMemo(() => {
    if (!activeTab) return [];
    return activeTab.getItems(products) || [];
  }, [products, activeTab]);

  if (loading) return null;

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
      {items.length === 0 ? (
        <p className="filter-empty">{t({ en: "No products yet.", he: "אין מוצרים עדיין." })}</p>
      ) : (
        <div className="product-rail__track">
          {items.map((product) => (
            <div className="product-rail__item" key={product.id}>
              <ProductCard
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

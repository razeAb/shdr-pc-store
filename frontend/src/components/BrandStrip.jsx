import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useProducts } from "../context/ProductsContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { getBrandCounts } from "../utils/products.js";

export default function BrandStrip() {
  const { products, loading } = useProducts();
  const { t } = useLang();
  const brands = useMemo(() => getBrandCounts(products), [products]);

  if (loading || brands.length === 0) return null;

  return (
    <section className="brand-strip" aria-labelledby="brand-strip-title">
      <div className="section-heading">
        <h2 id="brand-strip-title">{t({ en: "Shop by Brand", he: "קנייה לפי מותג" })}</h2>
      </div>
      <div className="brand-strip__track">
        {brands.map(({ brand, count }) => (
          <Link
            key={brand}
            className="brand-tile"
            to={`/search?brand=${encodeURIComponent(brand)}`}
          >
            <span className="brand-tile__name">{brand}</span>
            <span className="brand-tile__count">
              {t({ en: `${count} products`, he: `${count} מוצרים` })}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

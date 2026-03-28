import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format.js";
import { useLang } from "../context/LangContext.jsx";

export default function ProductCard({ product, onAdd }) {
  const hasDiscount = Number.isFinite(product.salePrice);
  const { t } = useLang();
  return (
    <article className="product-card">
      <Link className="product-image" to={`/product/${product.slug}`}>
        {hasDiscount && <span className="badge">{t({ en: "On sale", he: "בהנחה" })}</span>}
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>
      <div className="product-body">
        <h3>{product.title}</h3>
        <p className="product-description">{product.description}</p>
        <p className="product-meta">{product.platform}</p>
        <div className="product-price">
          {hasDiscount ? (
            <>
              <span className="price-now">{formatCurrency(product.salePrice, "ILS")}</span>
              <span className="price-was">{formatCurrency(product.price, "ILS")}</span>
            </>
          ) : (
            <span className="price-now">{formatCurrency(product.price, "ILS")}</span>
          )}
        </div>
        {product.rating ? (
          <p className="product-rating">
            {t({ en: `Rated ${product.rating} out of 5`, he: `דירוג ${product.rating} מתוך 5` })}
          </p>
        ) : null}
        <button
          type="button"
          className="secondary-button"
          onClick={() => onAdd(product)}
        >
          {t({ en: "Add to cart", he: "הוסף לעגלה" })}
        </button>
      </div>
    </article>
  );
}

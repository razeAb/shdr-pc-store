import { ShoppingBag, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format.js";
import { useLang } from "../context/LangContext.jsx";
import { ATTRIBUTE_GROUPS, ATTRIBUTE_VALUE_LABELS, PRICE_COMING_SOON, getProductLabel, getShortTitle, hasPrice } from "../utils/products.js";

export default function ProductCard({ product, onAdd, badge, showDetails = false }) {
  const hasDiscount = Number.isFinite(product.salePrice) && product.salePrice < product.price;
  const { t } = useLang();
  const shortTitle = getShortTitle(product.title);
  const isPriced = hasPrice(product);
  const specLabels = { cpu: { en: "CPU", he: "מעבד" }, gpu: { en: "GPU", he: "כרטיס מסך" }, ram: { en: "RAM", he: "זיכרון" }, storage: { en: "Storage", he: "אחסון" } };
  const details = showDetails ? [
    ...Object.entries(specLabels).map(([key, label]) => ({ key, label, value: product.specs?.[key] })),
    ...ATTRIBUTE_GROUPS.map(({ key, title }) => ({ key, label: title, value: product.attributes?.find((attribute) => attribute.key === key)?.value }))
  ].filter(({ value }) => typeof value === "string" && value.trim()).slice(0, 4) : [];
  return (
    <article className="product-card">
      <Link className="product-image" to={`/product/${product.slug}`}>
        {hasDiscount ? (
          <span className="badge">{t({ en: "On sale", he: "בהנחה" })}</span>
        ) : badge ? (
          <span className="badge badge--info">{badge}</span>
        ) : null}
        <img src={product.image} alt={product.title} loading="lazy" />
      </Link>
      <div className="product-body">
        <p className="product-meta">{getProductLabel(product, t)}</p>
        <h3><Link to={`/product/${product.slug}`} title={product.title}>{shortTitle}</Link></h3>
        {details.length > 0 && <dl className="product-card__specs">{details.map(({ key, label, value }) => <div key={key}><dt>{t(label)}</dt><dd>{t(ATTRIBUTE_VALUE_LABELS[value] || value)}</dd></div>)}</dl>}
        <div className="product-price">
          {!isPriced ? (
            <span className="price-pending">{t(PRICE_COMING_SOON)}</span>
          ) : hasDiscount ? (
            <>
              <span className="price-now">{formatCurrency(product.salePrice, "ILS")}</span>
              <span className="price-was">{formatCurrency(product.price, "ILS")}</span>
            </>
          ) : (
            <span className="price-now">{formatCurrency(product.price, "ILS")}</span>
          )}
        </div>
        {showDetails && isPriced && hasDiscount && <p className="product-card__saving">{t({ en: "Save", he: "חיסכון של" })} {formatCurrency(product.price - product.salePrice, "ILS")}</p>}
        {product.rating ? (
          <p className="product-rating"><Star size={13} fill="currentColor" aria-hidden="true" />
            {t({ en: `Rated ${product.rating} out of 5`, he: `דירוג ${product.rating} מתוך 5` })}
          </p>
        ) : null}
        <button
          type="button"
          className="secondary-button"
          onClick={() => onAdd(product)}
          disabled={!isPriced}
        >
          <ShoppingBag size={16} aria-hidden="true" />{t({ en: "Add to cart", he: "הוסף לעגלה" })}
        </button>
      </div>
    </article>
  );
}

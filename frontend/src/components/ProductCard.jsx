import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/format.js";

export default function ProductCard({ product, onAdd }) {
  const hasDiscount = Number.isFinite(product.salePrice);
  return (
    <article className="product-card">
      <Link className="product-image" to={`/product/${product.slug}`}>
        {hasDiscount && <span className="badge">On sale</span>}
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
          <p className="product-rating">Rated {product.rating} out of 5</p>
        ) : null}
        <button
          type="button"
          className="secondary-button"
          onClick={() => onAdd(product)}
        >
          Add to cart
        </button>
      </div>
    </article>
  );
}

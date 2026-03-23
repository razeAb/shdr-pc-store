import { useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useProducts } from "../context/ProductsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/format.js";

export default function Product() {
  const { slug } = useParams();
  const { onToast } = useOutletContext();
  const { addItem } = useCart();
  const { products, loading, error } = useProducts();
  const product = products.find((item) => item.slug === slug);

  if (loading) {
    return (
      <section className="product-detail">
        <h1>Loading product…</h1>
      </section>
    );
  }

  if (error) {
    return (
      <section className="product-detail">
        <h1>Product not available</h1>
        <p>Try again later.</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail">
        <h1>Product not found</h1>
        <p>Try searching for another title.</p>
      </section>
    );
  }

  const handleAdd = () => {
    addItem(product);
    onToast("Added to cart");
  };

  return (
    <section className="product-detail" aria-labelledby="product-title">
      <img src={product.image} alt={product.title} loading="lazy" />
      <div>
        <p className="eyebrow">{product.platform}</p>
        <h1 id="product-title">{product.title}</h1>
        <p className="product-sku">מק"ט: {product.sku}</p>
        <p className="product-description">{product.description}</p>
        <p className="product-price">
          {formatCurrency(product.salePrice ?? product.price, "ILS")}
        </p>
        <button type="button" className="primary-button" onClick={handleAdd}>
          Add to cart
        </button>
      </div>
    </section>
  );
}

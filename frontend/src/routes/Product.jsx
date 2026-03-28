import { useParams } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { useProducts } from "../context/ProductsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/format.js";
import { useLang } from "../context/LangContext.jsx";

export default function Product() {
  const { slug } = useParams();
  const { onToast } = useOutletContext();
  const { addItem } = useCart();
  const { products, loading, error } = useProducts();
  const { t } = useLang();
  const product = products.find((item) => item.slug === slug);

  if (loading) {
    return (
      <section className="product-detail">
        <h1>{t({ en: "Loading product…", he: "טוען מוצר…" })}</h1>
      </section>
    );
  }

  if (error) {
    return (
      <section className="product-detail">
        <h1>{t({ en: "Product not available", he: "המוצר לא זמין" })}</h1>
        <p>{t({ en: "Try again later.", he: "נסו שוב מאוחר יותר." })}</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-detail">
        <h1>{t({ en: "Product not found", he: "המוצר לא נמצא" })}</h1>
        <p>{t({ en: "Try searching for another title.", he: "נסו לחפש כותר אחר." })}</p>
      </section>
    );
  }

  const handleAdd = () => {
    addItem(product);
    onToast(t({ en: "Added to cart", he: "נוסף לעגלה" }));
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
          {t({ en: "Add to cart", he: "הוסף לעגלה" })}
        </button>
      </div>
    </section>
  );
}

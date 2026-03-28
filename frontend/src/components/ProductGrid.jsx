import { useProducts } from "../context/ProductsContext.jsx";
import ProductCard from "./ProductCard.jsx";
import { useLang } from "../context/LangContext.jsx";

export default function ProductGrid({ onAdd }) {
  const { products, loading, error } = useProducts();
  const { t } = useLang();

  if (loading) {
    return (
      <section className="product-section" aria-labelledby="featured-products">
        <div className="section-heading">
          <h2 id="featured-products">{t({ en: "Featured products", he: "מוצרים מומלצים" })}</h2>
          <p>{t({ en: "Loading products…", he: "טוען מוצרים…" })}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="product-section" aria-labelledby="featured-products">
        <div className="section-heading">
          <h2 id="featured-products">{t({ en: "Featured products", he: "מוצרים מומלצים" })}</h2>
          <p>{t({ en: "Could not load products.", he: "לא ניתן לטעון מוצרים." })}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-section" aria-labelledby="featured-products">
      <div className="section-heading">
        <h2 id="featured-products">{t({ en: "Featured products", he: "מוצרים מומלצים" })}</h2>
        <p>{t({ en: "Handpicked new releases and pre-owned gems.", he: "חדשים נבחרים ומציאות יד שנייה." })}</p>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

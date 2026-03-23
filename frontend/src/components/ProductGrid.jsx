import { useProducts } from "../context/ProductsContext.jsx";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ onAdd }) {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <section className="product-section" aria-labelledby="featured-products">
        <div className="section-heading">
          <h2 id="featured-products">Featured products</h2>
          <p>Loading products…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="product-section" aria-labelledby="featured-products">
        <div className="section-heading">
          <h2 id="featured-products">Featured products</h2>
          <p>Could not load products.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="product-section" aria-labelledby="featured-products">
      <div className="section-heading">
        <h2 id="featured-products">Featured products</h2>
        <p>Handpicked new releases and pre-owned gems.</p>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} onAdd={onAdd} />
        ))}
      </div>
    </section>
  );
}

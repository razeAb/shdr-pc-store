import products from "../data/products.json";
import ProductCard from "./ProductCard.jsx";

export default function ProductGrid({ onAdd }) {
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

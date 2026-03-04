import { useLocation, Link } from "react-router-dom";
import products from "../data/products.json";
import { formatCurrency } from "../utils/format.js";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function Search() {
  const query = useQuery();
  const term = query.get("q")?.trim().toLowerCase() || "";

  const results = products.filter((product) => {
    if (!term) return true;
    const inTitle = product.title.toLowerCase().includes(term);
    const inTags = (product.tags || []).some((tag) => tag.toLowerCase().includes(term));
    const inSku = product.sku?.toLowerCase().includes(term);
    return inTitle || inTags || inSku || product.platform.toLowerCase().includes(term);
  });

  return (
    <section className="search-results" aria-labelledby="search-results-title">
      <div className="section-heading">
        <h1 id="search-results-title">Search results</h1>
        <p>
          Showing {results.length} result{results.length === 1 ? "" : "s"}
          {term ? ` for "${term}"` : "."}
        </p>
      </div>
      <div className="results-list">
        {results.map((product) => (
          <article key={product.id} className="result-row">
            <img src={product.image} alt={product.title} loading="lazy" />
            <div>
              <h2>
                <Link to={`/product/${product.slug}`}>{product.title}</Link>
              </h2>
              <p>{product.platform}</p>
            </div>
            <p className="price-now">
              {formatCurrency(product.salePrice ?? product.price, "ILS")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

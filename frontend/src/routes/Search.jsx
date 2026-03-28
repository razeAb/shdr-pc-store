import { useLocation, Link, useOutletContext } from "react-router-dom";
import { useProducts } from "../context/ProductsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/format.js";
import {
  CATEGORY_LABELS,
  CATEGORY_SUBCATEGORIES,
  SPEC_LABELS,
  SUBCATEGORY_LABELS,
  categorizeProduct,
  extractBrand,
  extractSpecs
} from "../utils/products.js";
import { useLang } from "../context/LangContext.jsx";

const useQuery = () => new URLSearchParams(useLocation().search);

export default function Search() {
  const location = useLocation();
  const { onToast } = useOutletContext();
  const query = useQuery();
  const term = query.get("q")?.trim().toLowerCase() || "";
  const category = query.get("category")?.trim() || "";
  const subcategory = query.get("subcategory")?.trim() || "";
  const brand = query.get("brand")?.trim() || "";
  const { t } = useLang();
  const { addItem } = useCart();
  const specs = query
    .get("specs")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean) || [];
  const { products, loading, error } = useProducts();

  const buildLink = (updates) => {
    const params = new URLSearchParams(location.search);
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    const qs = params.toString();
    return `/search${qs ? `?${qs}` : ""}`;
  };

  const enriched = products.map((product) => {
    const { mainCategory, subCategory } = categorizeProduct(product);
    return {
      ...product,
      mainCategory,
      subCategory,
      brand: extractBrand(product),
      specs: extractSpecs(product)
    };
  });

  const matchesCategory = (product, value) =>
    product.mainCategory === value || (product.categories || []).includes(value);
  const matchesSubcategory = (product, value) =>
    product.subCategory === value || (product.subCategories || []).includes(value);

  const categoryProducts = category ? enriched.filter((product) => matchesCategory(product, category)) : enriched;
  const availableSubcategories = category ? CATEGORY_SUBCATEGORIES[category] || [] : [];
  const availableBrands = category
    ? Array.from(new Set(categoryProducts.map((product) => product.brand))).sort()
    : [];
  const availableSpecs = category
    ? Array.from(new Set(categoryProducts.flatMap((product) => product.specs))).sort()
    : [];
  const categoryLabel = category ? t(CATEGORY_LABELS[category] || category) : "";
  const resultsLabel =
    term && category
      ? t({ en: ` for "${term}" in ${categoryLabel}.`, he: ` עבור "${term}" בקטגוריית ${categoryLabel}.` })
      : term
        ? t({ en: ` for "${term}".`, he: ` עבור "${term}".` })
        : category
          ? t({ en: ` in ${categoryLabel}.`, he: ` בקטגוריית ${categoryLabel}.` })
          : ".";

  const results = enriched.filter((product) => {
    if (category && !matchesCategory(product, category)) return false;
    if (subcategory && !matchesSubcategory(product, subcategory)) return false;
    if (brand && product.brand !== brand) return false;
    if (specs.length && !specs.every((spec) => product.specs.includes(spec))) return false;
    if (!term) return true;
    const inTitle = product.title.toLowerCase().includes(term);
    const inTags = (product.tags || []).some((tag) => tag.toLowerCase().includes(term));
    const inSku = product.sku?.toLowerCase().includes(term);
    const inCategory = product.mainCategory?.toLowerCase().includes(term) || product.subCategory?.toLowerCase().includes(term);
    return (
      inTitle ||
      inTags ||
      inSku ||
      product.platform.toLowerCase().includes(term) ||
      inCategory
    );
  });

  if (loading) {
    return (
      <section className="search-results" aria-labelledby="search-results-title">
        <div className="section-heading">
          <h1 id="search-results-title">{t({ en: "Search results", he: "תוצאות חיפוש" })}</h1>
          <p>{t({ en: "Loading products…", he: "טוען מוצרים…" })}</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="search-results" aria-labelledby="search-results-title">
        <div className="section-heading">
          <h1 id="search-results-title">{t({ en: "Search results", he: "תוצאות חיפוש" })}</h1>
          <p>{t({ en: "Could not load products.", he: "לא ניתן לטעון מוצרים." })}</p>
        </div>
      </section>
    );
  }

  const resultsCountLabel = t({
    en: `Showing ${results.length} result${results.length === 1 ? "" : "s"}`,
    he: `מציג ${results.length} תוצאה${results.length === 1 ? "" : "ות"}`
  });

  const handleAdd = (product) => {
    addItem(product);
    onToast(t({ en: "Added to cart", he: "נוסף לעגלה" }));
  };

  return (
    <section className="search-results" aria-labelledby="search-results-title">
      <div className="section-heading">
        <h1 id="search-results-title">{t({ en: "Search results", he: "תוצאות חיפוש" })}</h1>
        <p>
          {resultsCountLabel}
          {resultsLabel}
        </p>
      </div>
      {category ? (
        <div className="category-filters">
          <div className="filter-group">
            <h2>{t({ en: "Subcategories", he: "תתי קטגוריות" })}</h2>
            <div className="filter-chips">
              <Link className={`filter-chip ${subcategory ? "" : "active"}`} to={buildLink({ subcategory: "" })}>
                {t({ en: "All", he: "הכל" })}
              </Link>
              {availableSubcategories.map((name) => (
                <Link
                  key={name}
                  className={`filter-chip ${subcategory === name ? "active" : ""}`}
                  to={buildLink({ subcategory: name })}
                >
                  {t(SUBCATEGORY_LABELS[name] || name)}
                </Link>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h2>{t({ en: "Brands", he: "מותגים" })}</h2>
            <div className="filter-chips">
              <Link className={`filter-chip ${brand ? "" : "active"}`} to={buildLink({ brand: "" })}>
                {t({ en: "All Brands", he: "כל המותגים" })}
              </Link>
              {availableBrands.map((name) => (
                <Link
                  key={name}
                  className={`filter-chip ${brand === name ? "active" : ""}`}
                  to={buildLink({ brand: name })}
                >
                  {name}
                </Link>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <h2>{t({ en: "Specs", he: "מפרט" })}</h2>
            <div className="filter-chips">
              {availableSpecs.length === 0 ? (
                <span className="filter-empty">{t({ en: "No spec filters yet.", he: "אין מסנני מפרט כרגע." })}</span>
              ) : (
                availableSpecs.map((name) => {
                  const isActive = specs.includes(name);
                  const nextSpecs = isActive
                    ? specs.filter((spec) => spec !== name)
                    : [...specs, name];
                  return (
                    <Link
                      key={name}
                      className={`filter-chip ${isActive ? "active" : ""}`}
                      to={buildLink({ specs: nextSpecs.join(",") })}
                    >
                      {t(SPEC_LABELS[name] || name)}
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
      <div className="results-list">
        {results.map((product) => (
          <article key={product.id} className="result-row">
            <img src={product.image} alt={product.title} loading="lazy" />
            <div>
              <h2>
                <Link to={`/product/${product.slug}`}>{product.title}</Link>
              </h2>
              <p>
                {[
                  product.mainCategory ? t(CATEGORY_LABELS[product.mainCategory] || product.mainCategory) : "",
                  product.subCategory ? t(SUBCATEGORY_LABELS[product.subCategory] || product.subCategory) : ""
                ]
                  .filter(Boolean)
                  .join(" • ") || product.platform}
              </p>
            </div>
            <div className="result-row__actions">
              <p className="price-now">
                {formatCurrency(product.salePrice ?? product.price, "ILS")}
              </p>
              <button type="button" className="primary-button" onClick={() => handleAdd(product)}>
                {t({ en: "Add to cart", he: "הוסף לעגלה" })}
              </button>
              <Link className="secondary-button" to={`/product/${product.slug}`}>
                {t({ en: "More details", he: "פרטים נוספים" })}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

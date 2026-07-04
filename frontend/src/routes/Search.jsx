import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import api from "../api.js";
import ProductCard from "../components/ProductCard.jsx";
import FilterSidebar from "../components/FilterSidebar.jsx";
import FilterDrawer from "../components/FilterDrawer.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import {
  CATEGORY_LABELS,
  CONNECTIVITY_LABELS,
  PRICE_RANGE_LABELS,
  PRICE_RANGE_ORDER,
  PRODUCT_TYPE_LABELS,
  SORT_OPTIONS,
  normalizeProduct
} from "../utils/products.js";

const FILTER_PARAM_BY_GROUP = {
  type: "type",
  brand: "brand",
  connectivity: "connectivity",
  price: "price"
};

const useQuery = () => new URLSearchParams(useLocation().search);

const parseListParam = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

// Combines the live facet counts with any currently-selected values so a
// checked box never disappears just because it would now yield 0 results.
const mergeOptions = (facetList, selected, labelMap, order, t) => {
  const counts = new Map((facetList || []).map((item) => [item.value, item.count]));
  selected.forEach((value) => {
    if (!counts.has(value)) counts.set(value, 0);
  });
  const options = Array.from(counts.entries()).map(([value, count]) => ({
    value,
    count,
    label: labelMap ? t(labelMap[value] || { en: value, he: value }) : value
  }));
  if (order) {
    options.sort((a, b) => order.indexOf(a.value) - order.indexOf(b.value));
  }
  return options;
};

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();
  const { onToast } = useOutletContext();
  const query = useQuery();
  const { t } = useLang();
  const { addItem } = useCart();

  const term = query.get("q")?.trim() || "";
  const category = query.get("category")?.trim() || "";
  const selected = useMemo(
    () => ({
      type: parseListParam(query.get("type")),
      brand: parseListParam(query.get("brand")),
      connectivity: parseListParam(query.get("connectivity")),
      price: parseListParam(query.get("price"))
    }),
    [location.search]
  );
  const sort = query.get("sort") || "newest";

  const [products, setProducts] = useState([]);
  const [facets, setFacets] = useState({ productType: [], brand: [], connectivity: [], priceRange: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(location.search);
    params.delete("q");
    if (term) params.set("q", term);

    setLoading(true);
    setError("");
    Promise.all([
      api.get("/api/products", { params, signal: controller.signal }),
      api.get("/api/products/facets", { params, signal: controller.signal })
    ])
      .then(([productsRes, facetsRes]) => {
        const list = Array.isArray(productsRes.data) ? productsRes.data : [];
        setProducts(list.map((item) => normalizeProduct(item)));
        setFacets(
          facetsRes.data || { productType: [], brand: [], connectivity: [], priceRange: [] }
        );
      })
      .catch((err) => {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        setError(err?.message || "Failed to load products.");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const updateParams = (updater) => {
    const params = new URLSearchParams(location.search);
    updater(params);
    navigate(`/search${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleToggleFilter = (groupKey, value) => {
    const paramName = FILTER_PARAM_BY_GROUP[groupKey];
    updateParams((params) => {
      const list = parseListParam(params.get(paramName));
      const next = list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
      if (next.length) params.set(paramName, next.join(","));
      else params.delete(paramName);
    });
  };

  const handleClearFilters = () => {
    updateParams((params) => {
      params.delete("type");
      params.delete("brand");
      params.delete("connectivity");
      params.delete("price");
    });
  };

  const handleSortChange = (event) => {
    const value = event.target.value;
    updateParams((params) => {
      if (value === "newest") params.delete("sort");
      else params.set("sort", value);
    });
  };

  const hasActiveFilters =
    selected.type.length > 0 ||
    selected.brand.length > 0 ||
    selected.connectivity.length > 0 ||
    selected.price.length > 0;

  const filterGroups = [
    {
      key: "type",
      title: t({ en: "Product Type", he: "סוג מוצר" }),
      selected: selected.type,
      options: mergeOptions(facets.productType, selected.type, PRODUCT_TYPE_LABELS, null, t)
    },
    {
      key: "brand",
      title: t({ en: "Brand", he: "מותג" }),
      selected: selected.brand,
      options: mergeOptions(facets.brand, selected.brand, null, null, t)
    },
    {
      key: "connectivity",
      title: t({ en: "Connectivity", he: "קישוריות" }),
      selected: selected.connectivity,
      options: mergeOptions(facets.connectivity, selected.connectivity, CONNECTIVITY_LABELS, null, t)
    },
    {
      key: "price",
      title: t({ en: "Price", he: "מחיר" }),
      selected: selected.price,
      options: mergeOptions(facets.priceRange, selected.price, PRICE_RANGE_LABELS, PRICE_RANGE_ORDER, t)
    }
  ];

  const categoryLabel = category ? t(CATEGORY_LABELS[category] || category) : "";
  const heading = category
    ? categoryLabel
    : term
      ? t({ en: "Search results", he: "תוצאות חיפוש" })
      : t({ en: "All products", he: "כל המוצרים" });
  const resultsLabel = term
    ? t({ en: ` for "${term}"${category ? ` in ${categoryLabel}` : ""}.`, he: ` עבור "${term}"${category ? ` בקטגוריית ${categoryLabel}` : ""}.` })
    : ".";

  const handleAdd = (product) => {
    addItem(product);
    onToast(t({ en: "Added to cart", he: "נוסף לעגלה" }));
  };

  const resultsCountLabel = t({
    en: `Showing ${products.length} result${products.length === 1 ? "" : "s"}`,
    he: `מציג ${products.length} תוצאה${products.length === 1 ? "" : "ות"}`
  });

  return (
    <section className="search-results" aria-labelledby="search-results-title">
      <div className="section-heading">
        <h1 id="search-results-title">{heading}</h1>
        <p>
          {resultsCountLabel}
          {resultsLabel}
        </p>
      </div>

      <div className="listing-toolbar">
        <FilterDrawer
          isOpen={isFilterDrawerOpen}
          onOpen={() => setIsFilterDrawerOpen(true)}
          onClose={() => setIsFilterDrawerOpen(false)}
          groups={filterGroups}
          onToggle={handleToggleFilter}
          onClear={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          resultCount={products.length}
        />
        <label className="sort-select">
          <span className="visually-hidden">{t({ en: "Sort by", he: "מיין לפי" })}</span>
          <select value={sort} onChange={handleSortChange}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {t(option.label)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="listing-layout">
        <aside className="listing-layout__sidebar">
          <FilterSidebar
            groups={filterGroups}
            onToggle={handleToggleFilter}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </aside>
        <div className="listing-layout__results">
          {loading ? (
            <p>{t({ en: "Loading products…", he: "טוען מוצרים…" })}</p>
          ) : error ? (
            <p>{t({ en: "Could not load products.", he: "לא ניתן לטעון מוצרים." })}</p>
          ) : products.length === 0 ? (
            <p>{t({ en: "No products match these filters.", he: "אין מוצרים התואמים לסינון זה." })}</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={handleAdd} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

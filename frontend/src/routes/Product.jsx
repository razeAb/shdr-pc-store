import { Link, useParams, useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ShoppingBag, Store, Truck } from "lucide-react";
import { useProducts } from "../context/ProductsContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/format.js";
import { useLang } from "../context/LangContext.jsx";
import ProductCard from "../components/ProductCard.jsx";
import OwnerPurchaseCost from "../components/OwnerPurchaseCost.jsx";
import {
  PRICE_COMING_SOON,
  PRODUCT_TYPE_LABELS,
  getCategoryLabel,
  getProductLabel,
  getSimilarProducts,
  hasPrice,
  parseSpecSheet
} from "../utils/products.js";

const getMediaItems = (product) => {
  if (!product) return [];
  const images = product.images.length > 0 ? product.images : product.image ? [product.image] : [];
  return [
    ...images.map((src) => ({ type: "image", src })),
    ...product.videos.map((src) => ({ type: "video", src }))
  ];
};

export default function Product() {
  const { slug } = useParams();
  const { onToast } = useOutletContext();
  const { addItem } = useCart();
  const { products, loading, error } = useProducts();
  const { t } = useLang();
  // Slugs embed the title, so fall back to the id suffix when a title was
  // renamed after the link was shared.
  const idSuffix = slug?.split("-").pop();
  const product =
    products.find((item) => item.slug === slug) ||
    products.find((item) => idSuffix && item.id.endsWith(idSuffix));

  // All hooks run before the early returns below so their order never changes.
  const mediaItems = useMemo(() => getMediaItems(product), [product]);
  const similarProducts = useMemo(
    () => (product ? getSimilarProducts(products, product) : []),
    [products, product]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [product?.id]);

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

  const handleAdd = (item = product) => {
    addItem(item);
    onToast(t({ en: "Added to cart", he: "נוסף לעגלה" }));
  };

  const activeMedia = mediaItems[activeIndex];
  const categoryLabel = getCategoryLabel(product.category, t);
  const hasDiscount = Number.isFinite(product.salePrice);
  const isPriced = hasPrice(product);
  const { intro: rawIntro, rows: specRows } = parseSpecSheet(product.description);
  // Imported descriptions open by repeating the title; don't show it twice.
  const intro = rawIntro.replace(/\s+/g, " ") === product.title.replace(/\s+/g, " ") ? "" : rawIntro;

  return (
    <>
      <nav className="breadcrumbs" aria-label={t({ en: "Breadcrumbs", he: "ניווט" })}>
        <Link to="/">{t({ en: "Home", he: "דף הבית" })}</Link>
        {categoryLabel && (
          <>
            <ChevronLeft size={14} aria-hidden="true" />
            <Link to={`/search?category=${encodeURIComponent(product.category)}`}>{categoryLabel}</Link>
          </>
        )}
        {categoryLabel && PRODUCT_TYPE_LABELS[product.productType] && (
          <>
            <ChevronLeft size={14} aria-hidden="true" />
            <Link
              to={`/search?category=${encodeURIComponent(product.category)}&type=${encodeURIComponent(product.productType)}`}
            >
              {t(PRODUCT_TYPE_LABELS[product.productType])}
            </Link>
          </>
        )}
      </nav>

      <section className="product-detail" aria-labelledby="product-title">
        <div className="product-media">
          <div className="product-media__stage">
            {activeMedia?.type === "video" ? (
              <video
                key={activeMedia.src}
                className="product-media__asset"
                src={activeMedia.src}
                controls
                preload="metadata"
              />
            ) : (
              <img
                key={activeMedia?.src}
                className="product-media__asset"
                src={activeMedia?.src || product.image}
                alt={product.title}
              />
            )}
          </div>
          {mediaItems.length > 1 && (
            <div className="product-media__thumbs">
              {mediaItems.map((item, index) => (
                <button
                  key={`${item.type}-${item.src}`}
                  type="button"
                  className={index === activeIndex ? "product-media__thumb is-active" : "product-media__thumb"}
                  onClick={() => setActiveIndex(index)}
                  aria-label={t({ en: `Show media ${index + 1}`, he: `הצגת מדיה ${index + 1}` })}
                  aria-pressed={index === activeIndex}
                >
                  {item.type === "video" ? (
                    <span className="product-media__thumb-video">▶</span>
                  ) : (
                    <img src={item.src} alt="" loading="lazy" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-panel">
          <p className="product-detail__brand">{getProductLabel(product, t)}</p>
          <h1 id="product-title">{product.title}</h1>
          {product.sku && <p className="product-sku">מק"ט: {product.sku}</p>}

          <div className="product-detail__price">
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

          <OwnerPurchaseCost productId={product.id} />
          <button type="button" className="primary-button product-detail__add" onClick={() => handleAdd()} disabled={!isPriced || product.inStock === false}>
            <ShoppingBag size={18} aria-hidden="true" />
            {t(product.inStock === false ? { en: "Out of stock", he: "אזל מהמלאי" } : { en: "Add to cart", he: "הוסף לעגלה" })}
          </button>

          <ul className="product-trust">
            <li><Truck size={18} aria-hidden="true" />{t({ en: "Free Israel shipping over ₪200", he: "משלוח חינם בישראל מעל ₪200" })}</li>
            <li><Store size={18} aria-hidden="true" />{t({ en: "Same-day pickup available", he: "איסוף עצמי באותו היום" })}</li>
          </ul>

          {intro && (
            <div className="product-detail__description">
              <h2>{t({ en: "Description", he: "תיאור המוצר" })}</h2>
              <p className="product-description">{intro}</p>
            </div>
          )}

          {specRows.length > 0 && (
            <div className="product-detail__description">
              <h2>{t({ en: "Specifications", he: "מפרט טכני" })}</h2>
              <table className="product-specs">
                <tbody>
                  {specRows.map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      <td>{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {similarProducts.length > 0 && (
        <section className="product-similar" aria-labelledby="similar-title">
          <div className="section-heading">
            <h2 id="similar-title">{t({ en: "Similar products", he: "מוצרים דומים" })}</h2>
          </div>
          <div className="product-grid">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} onAdd={handleAdd} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

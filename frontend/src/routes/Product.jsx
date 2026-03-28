import { useParams, useOutletContext } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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

  const mediaItems = useMemo(() => {
    const images = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.image
        ? [product.image]
        : [];
    const videos = Array.isArray(product.videos) ? product.videos : [];
    return [
      ...images.map((src) => ({ type: "image", src })),
      ...videos.map((src) => ({ type: "video", src }))
    ];
  }, [product.image, product.images, product.videos]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [mediaItems.length]);

  useEffect(() => {
    if (mediaItems.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % mediaItems.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [mediaItems.length]);

  const activeMedia = mediaItems[activeIndex];

  return (
    <section className="product-detail" aria-labelledby="product-title">
      <div className="product-media">
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
            loading="lazy"
          />
        )}
        {mediaItems.length > 1 && (
          <div className="product-media__dots" aria-hidden="true">
            {mediaItems.map((item, index) => (
              <span
                key={`${item.type}-${item.src}`}
                className={index === activeIndex ? "dot is-active" : "dot"}
              />
            ))}
          </div>
        )}
      </div>
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

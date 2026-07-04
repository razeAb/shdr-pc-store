import { Link, useOutletContext } from "react-router-dom";
import { useMemo } from "react";
import { Baby, Gamepad2, Laptop, Monitor, Smartphone, Tablet, Watch, Wifi } from "lucide-react";
import {
  CATEGORY_LABELS,
  HOMEPAGE_CATEGORIES,
  PRODUCT_TYPE_LABELS,
  getBestSellers,
  getByCategorySortedByPrice,
  getByProductType,
  getCheapestByProductType,
  getDeals,
  getFeaturedByCategory,
  getNewArrivals
} from "../utils/products.js";
import PromoBanner from "../components/PromoBanner.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import ProductRail from "../components/ProductRail.jsx";
import BrandStrip from "../components/BrandStrip.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";

const PLATFORM_TABS = [
  { key: "PC Gaming", label: { en: "PC Gaming", he: "גיימינג למחשב" } },
  { key: "PlayStation", label: { en: "PlayStation", he: "פלייסטיישן" } },
  { key: "Xbox", label: { en: "Xbox", he: "אקסבוקס" } },
  { key: "Nintendo", label: { en: "Nintendo", he: "נינטנדו" } }
].map((tab) => ({
  key: tab.key,
  label: tab.label,
  getItems: (products) => getByCategorySortedByPrice(products, tab.key)
}));

const GEAR_TABS = [
  { key: "Keyboard", label: { en: "Keyboards", he: "מקלדות" } },
  { key: "Mouse", label: { en: "Mice", he: "עכברים" } },
  { key: "Headset", label: { en: "Headsets", he: "אוזניות" } },
  { key: "Controller", label: { en: "Controllers", he: "שלטים" } }
].map((tab) => ({
  key: tab.key,
  label: tab.label,
  getItems: (products) => getByProductType(products, tab.key)
}));

const FEATURED_TABS = [
  { key: "bestsellers", label: { en: "Best Sellers", he: "הנמכרים ביותר" }, getItems: getBestSellers },
  { key: "new", label: { en: "New Arrivals", he: "חדש במלאי" }, getItems: getNewArrivals },
  { key: "deals", label: { en: "Deals", he: "מבצעים" }, getItems: getDeals }
];

// Hero banner spotlights the best-selling item per platform, in this order.
const HERO_CATEGORIES = ["PlayStation", "Xbox", "Nintendo"];

export default function Home() {
  const { onToast } = useOutletContext();
  const { addItem } = useCart();
  const { t } = useLang();
  const { products } = useProducts();
  const categoryIcons = {
    "PC Gaming": Gamepad2,
    PlayStation: "/svg/playstation-svgrepo-com.svg",
    Xbox: "/svg/Xbox_logo_2012_cropped.svg.png",
    Nintendo: "/svg/nintendo-2.svg",
    "Networking Equipment": Wifi,
    "Mobile Phones": Smartphone,
    Tablets: Tablet,
    "Wearables & Accessories": Watch,
    "Monitors & Desk Setup": Monitor,
    "Kids Electronics": Baby,
    Laptops: Laptop
  };
  const handleAdd = (product) => {
    addItem(product);
    onToast(t({ en: "Added to cart", he: "נוסף לעגלה" }));
  };

  const categoryTiles = getCheapestByProductType(products);

  const heroSlides = useMemo(
    () =>
      getFeaturedByCategory(products, HERO_CATEGORIES).map(({ category, product }) => ({
        id: product.id,
        image: product.image,
        link: `/product/${product.slug}`,
        alt: { en: product.title, he: product.title },
        eyebrow: CATEGORY_LABELS[category] || category,
        title: product.title,
        price: product.price
      })),
    [products]
  );

  return (
    <>
      <PromoBanner />
      <section className="hero-section">
        <HeroCarousel slides={heroSlides} />
        <div className="promo-tiles" aria-label={t({ en: "Promotions", he: "מבצעים" })}>
          <Link className="promo-tile" to="/search?q=gift%20cards">
            <div className="promo-icon" aria-hidden="true">
              GC
            </div>
            <div>
              <h3>{t({ en: "Gift cards", he: "כרטיסי מתנה" })}</h3>
              <p>{t({ en: "Send digital codes in minutes.", he: "שליחת קודים דיגיטליים תוך דקות." })}</p>
            </div>
          </Link>
          <Link className="promo-tile" to="/search?q=clearance">
            <div className="promo-icon" aria-hidden="true">
              CL
            </div>
            <div>
              <h3>{t({ en: "Clearance", he: "חיסול מלאי" })}</h3>
              <p>{t({ en: "Last chance deals while stocks last.", he: "הזדמנות אחרונה עד גמר המלאי." })}</p>
            </div>
          </Link>
        </div>
        <section className="category-section" aria-labelledby="category-title">
          <div className="section-heading">
            <h2 id="category-title">{t({ en: "Shop by category", he: "קנייה לפי קטגוריה" })}</h2>
            <p>{t({ en: "Explore store departments inspired by top tech retailers.", he: "מחלקות מרכזיות בהשראת חנויות טכנולוגיה מובילות." })}</p>
          </div>
          <div className="category-grid">
            {HOMEPAGE_CATEGORIES.map((name) => {
              const icon = categoryIcons[name];
              const label = t(CATEGORY_LABELS[name] || name);
              return (
                <Link key={name} className="category-card" to={`/search?category=${encodeURIComponent(name)}`}>
                  {typeof icon === "string" ? (
                    <img className="category-icon-img" src={icon} alt="" aria-hidden="true" />
                  ) : icon ? (
                    (() => {
                      const Icon = icon;
                      return <Icon className="category-icon" size={22} aria-hidden="true" />;
                    })()
                  ) : null}
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </section>

      <ProductRail title={t({ en: "Featured Products", he: "מוצרים מומלצים" })} tabs={FEATURED_TABS} onAdd={handleAdd} />
      <ProductRail title={t({ en: "Shop By Platform", he: "קנייה לפי פלטפורמה" })} tabs={PLATFORM_TABS} onAdd={handleAdd} />
      <ProductRail title={t({ en: "Gaming Gear", he: "ציוד גיימינג" })} tabs={GEAR_TABS} onAdd={handleAdd} />

      <BrandStrip />

      <section className="category-tile-section" aria-labelledby="browse-category-title">
        <div className="section-heading">
          <h2 id="browse-category-title">{t({ en: "Browse By Category", he: "עיון לפי קטגוריה" })}</h2>
        </div>
        <div className="category-tile-grid">
          {categoryTiles.map(({ productType, product }) => (
            <Link
              key={productType}
              className="category-tile"
              to={`/search?type=${encodeURIComponent(productType)}`}
            >
              <img className="category-tile__image" src={product.image} alt="" loading="lazy" />
              <span className="category-tile__label">{t(PRODUCT_TYPE_LABELS[productType] || productType)}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

import { Link, useOutletContext } from "react-router-dom";
import { Gamepad2, Headphones, Monitor, Smartphone, Users, Wifi } from "lucide-react";
import { CATEGORY_LABELS, HOMEPAGE_CATEGORIES } from "../utils/products.js";
import PromoBanner from "../components/PromoBanner.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLang } from "../context/LangContext.jsx";

export default function Home() {
  const { onToast } = useOutletContext();
  const { addItem } = useCart();
  const { t } = useLang();
  const categoryIcons = {
    "Gaming Gear": Headphones,
    PlayStation: "/svg/playstation-svgrepo-com.svg",
    Xbox: "/svg/Xbox_logo_2012_cropped.svg.png",
    Nintendo: "/svg/nintendo-2.svg",
    "PC & Office": Monitor,
    Networking: Wifi,
    "Mobile & Tablets": Smartphone,
    "Kids Tech": Users
  };
  const handleAdd = (product) => {
    addItem(product);
    onToast(t({ en: "Added to cart", he: "נוסף לעגלה" }));
  };

  return (
    <>
      <PromoBanner />
      <section className="hero-section">
        <HeroCarousel />
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
      <ProductGrid onAdd={handleAdd} />
    </>
  );
}

import { Link, useOutletContext } from "react-router-dom";

import { ArrowUpLeft, Baby, Gamepad2, Headphones, Laptop, Monitor, PcCase, Smartphone, Tablet, Watch, Wifi, Zap } from "lucide-react";
import {
  CATEGORY_LABELS,
  HOMEPAGE_CATEGORIES,
  getBestSellers,
  getByProductType,
  getDeals,
  getNewArrivals
} from "../utils/products.js";
import PromoBanner from "../components/PromoBanner.jsx";

import ProductRail from "../components/ProductRail.jsx";
import BrandStrip from "../components/BrandStrip.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLang } from "../context/LangContext.jsx";

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


export default function Home() {
  const { onToast } = useOutletContext();
  const { addItem } = useCart();
  const { t } = useLang();
  const categoryIcons = {
    "Gaming PCs": PcCase,
    "PC Gaming": Gamepad2,
    PlayStation: "/svg/playstation-svgrepo-com.svg",
    Xbox: "/svg/Xbox_logo_2012_cropped.svg.png",
    Nintendo: Gamepad2,
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




  return (
    <>
      <PromoBanner />
      <section className="hero-section">
        <div className="store-hero">
          <div className="store-hero__copy">
            <p className="hero-kicker"><span /> SHDR / NEXT LEVEL TECH</p>
            <h1>{t({ en: "Your next level.", he: "הרמה הבאה שלך." })}<br /><em>{t({ en: "Starts here.", he: "מתחילה כאן." })}</em></h1>
            <p className="hero-description">{t({ en: "The consoles, gear and everyday tech that make your setup yours. Find your next upgrade.", he: "הקונסולות, הציוד והטכנולוגיה שהופכים כל סטאפ לשלך. זה הזמן לשדרוג הבא." })}</p>
            <div className="hero-actions">
              <Link className="primary-button" to="/search">{t({ en: "Explore the store", he: "לכל המוצרים" })}<ArrowUpLeft size={18} /></Link>
              <Link className="hero-secondary" to="/search?category=Gaming%20PCs">{t({ en: "Gaming PCs", he: "למחשבי הגיימינג" })}<span aria-hidden="true">↗</span></Link>
            </div>
            <div className="hero-platforms"><span>PLAYSTATION</span><span>XBOX</span><span>NINTENDO</span><span>PC GAMING</span></div>
          </div>
          <div className="hero-scene" aria-hidden="true">
            <img className="hero-photo" src="/images/hero-pc.jpg" alt="" fetchpriority="high" />
            <div className="scene-tag"><span className="scene-tag__icon"><Zap size={20} /></span><div><strong>{t({ en: "Made for your next move", he: "מוכנים למהלך הבא שלך" })}</strong><small>PLAY. CREATE. REPEAT.</small></div></div>
          </div>
        </div>
        <section className="category-section" aria-labelledby="category-title">
          <div className="section-heading">
            <h2 id="category-title">{t({ en: "Shop by category", he: "קנייה לפי קטגוריה" })}</h2>
            <p>{t({ en: "Find your next upgrade.", he: "כל מה שצריך, בדיוק במקום הנכון." })}</p>
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
      <section className="setup-banner">
        <div className="setup-banner__icon" aria-hidden="true"><Headphones size={72} strokeWidth={1} /></div>
        <div><p className="eyebrow">FIND YOUR EDGE</p><h2>{t({ en: "Small upgrades. Big difference.", he: "שדרוג קטן. הבדל גדול." })}</h2><p>{t({ en: "Make every click, every sound and every session count.", he: "כל קליק, כל צליל, כל משחק. הציוד שעושה את ההבדל." })}</p></div>
        <Link className="secondary-button" to="/search?type=Headset">{t({ en: "Explore headsets", he: "לכל האוזניות" })}<ArrowUpLeft size={18} /></Link>
      </section>
      <ProductRail title={t({ en: "Gaming Gear", he: "ציוד גיימינג" })} tabs={GEAR_TABS} onAdd={handleAdd} />

      <BrandStrip />


    </>
  );
}

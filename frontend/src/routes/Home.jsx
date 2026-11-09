import { Link, useOutletContext } from "react-router-dom";

import { ArrowUpLeft, Cpu, Gamepad2, PackageCheck, PcCase, Truck, Zap } from "lucide-react";
import {
  CATEGORY_LABELS,
  PRIMARY_CATEGORIES,
  getBestSellers,
  getByProductType,
  getDeals,
  getNewArrivals
} from "../utils/products.js";

import ProductRail from "../components/ProductRail.jsx";
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
    "PC Components": Cpu,
    "PC Gaming": Gamepad2,
    PlayStation: "/svg/playstation-svgrepo-com.svg",
    Xbox: "/svg/Xbox_logo_2012_cropped.svg.png",
    Nintendo: Gamepad2
  };
  const handleAdd = (product) => {
    addItem(product);
    onToast(t({ en: "Added to cart", he: "נוסף לעגלה" }));
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="store-hero">
          <div className="store-hero__copy">
            <p className="hero-kicker"><span /> SHDR / NEXT LEVEL TECH</p>
            <h1>{t({ en: "Your next setup.", he: "הסטאפ הבא שלך." })}<br /><em>{t({ en: "Starts here.", he: "מתחיל כאן." })}</em></h1>
            <p className="hero-description">{t({ en: "Gaming PCs, consoles and gear. Find the right upgrade, or build a PC that’s made for you.", he: "מחשבי גיימינג, קונסולות וציוד. מצאו את השדרוג הבא, או בנו מחשב שמתאים בדיוק לכם." })}</p>
            <div className="hero-actions">
              <Link className="primary-button" to="/search">{t({ en: "Explore the store", he: "לכל המוצרים" })}<ArrowUpLeft size={18} /></Link>
              <Link className="hero-secondary" to="/build">{t({ en: "Build your PC", he: "לבניית מחשב אישי" })}<span aria-hidden="true">↗</span></Link>
            </div>
            <div className="hero-platforms"><span>PLAYSTATION</span><span>XBOX</span><span>NINTENDO</span><span>PC GAMING</span></div>
          </div>
          <div className="hero-scene" aria-hidden="true">
            <img className="hero-photo" src="/images/hero-pc.jpg" alt="" fetchpriority="high" />
            <div className="scene-tag"><span className="scene-tag__icon"><Zap size={20} /></span><div><strong>{t({ en: "Made for your next move", he: "מוכנים למהלך הבא שלך" })}</strong><small>PLAY. CREATE. REPEAT.</small></div></div>
          </div>
        </div>
        <div className="home-benefits">
          <p><Truck size={20} aria-hidden="true" /><span>{t({ en: "Free Israel shipping over ₪200", he: "משלוח חינם בישראל מעל ₪200" })}</span></p>
          <p><PackageCheck size={20} aria-hidden="true" /><span>{t({ en: "Same-day pickup available", he: "איסוף באותו היום זמין" })}</span></p>
        </div>
        <section className="category-section" aria-labelledby="category-title">
          <div className="section-heading home-category-heading">
            <div>
              <h2 id="category-title">{t({ en: "Shop by category", he: "קנייה לפי קטגוריה" })}</h2>
              <p>{t({ en: "Find your next upgrade.", he: "כל מה שצריך, בדיוק במקום הנכון." })}</p>
            </div>
            <Link className="home-view-all" to="/search">{t({ en: "View all categories", he: "לכל הקטגוריות" })}<ArrowUpLeft size={16} aria-hidden="true" /></Link>
          </div>
          <div className="category-grid">
            {PRIMARY_CATEGORIES.map((name) => {
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

      <ProductRail title={t({ en: "Featured Products", he: "מוצרים מומלצים" })} tabs={FEATURED_TABS} onAdd={handleAdd} showDetails />

      <section className="home-pc-paths" aria-labelledby="pc-paths-title">
        <div className="section-heading">
          <h2 id="pc-paths-title">{t({ en: "Your PC. Your way.", he: "המחשב שלכם. בדרך שלכם." })}</h2>
          <p>{t({ en: "Choose a complete system or make every part your own.", he: "בחרו מחשב מוכן או התאימו כל רכיב בעצמכם." })}</p>
        </div>
        <div className="home-pc-paths__grid">
          <Link className="pc-path pc-path--ready" to="/search?category=Gaming%20PCs">
            <div className="pc-path__visual" aria-hidden="true">
              <img src="/images/hero-pc.jpg" alt="" loading="lazy" />
              <span className="pc-path__label">{t({ en: "PREBUILT GAMING PCS", he: "מחשבי גיימינג מוכנים" })}</span>
            </div>
            <div className="pc-path__copy">
              <h3>{t({ en: "Ready to play", he: "מוכנים למשחק" })}</h3>
              <p>{t({ en: "Explore complete gaming PCs. Compare the specs and find your next setup.", he: "גלו מחשבי גיימינג מוכנים. השוו מפרטים ומצאו את הסטאפ הבא שלכם." })}</p>
              <span className="pc-path__action">{t({ en: "Explore gaming PCs", he: "למחשבי הגיימינג" })}<ArrowUpLeft size={18} /></span>
            </div>
          </Link>
          <Link className="pc-path pc-path--custom" to="/build">
            <div className="pc-path__visual pc-path__parts" aria-hidden="true">
              <span className="pc-part pc-part--case"><PcCase size={100} strokeWidth={1} /></span>
              <span className="pc-part pc-part--cpu"><Cpu size={48} strokeWidth={1.2} /></span>
              <span className="pc-part pc-part--gpu"><Zap size={36} strokeWidth={1.2} /></span>
              <span className="pc-path__label">{t({ en: "CUSTOM PC BUILDER", he: "בונה המחשבים" })}</span>
            </div>
            <div className="pc-path__copy">
              <h3>{t({ en: "Build your own", he: "בנו בדרך שלכם" })}</h3>
              <p>{t({ en: "Start with AMD or Intel. Choose compatible components, one step at a time.", he: "התחילו עם AMD או Intel. בחרו רכיבים תואמים, צעד אחר צעד." })}</p>
              <span className="pc-path__action">{t({ en: "Start your build", he: "מתחילים לבנות" })}<ArrowUpLeft size={18} /></span>
            </div>
          </Link>
        </div>
      </section>
      <ProductRail title={t({ en: "Gaming Gear", he: "ציוד גיימינג" })} tabs={GEAR_TABS} onAdd={handleAdd} showDetails />

      <section className="home-why" aria-labelledby="why-shdr-title">
        <div className="section-heading">
          <h2 id="why-shdr-title">{t({ en: "Why SHDR?", he: "למה SHDR?" })}</h2>
          <p>{t({ en: "From your next upgrade to your next complete build.", he: "מהשדרוג הבא ועד למחשב הבא שלכם." })}</p>
        </div>
        <div className="home-why__grid">
          <article><Truck size={26} aria-hidden="true" /><h3>{t({ en: "Delivered to you", he: "עד אליכם" })}</h3><p>{t({ en: "Free shipping in Israel on orders over ₪200.", he: "משלוח חינם בישראל בהזמנות מעל ₪200." })}</p></article>
          <article><PackageCheck size={26} aria-hidden="true" /><h3>{t({ en: "Prefer to pick up?", he: "מעדיפים לאסוף?" })}</h3><p>{t({ en: "Same-day pickup is available.", he: "אפשרות לאיסוף באותו היום." })}</p></article>
          <article><Cpu size={26} aria-hidden="true" /><h3>{t({ en: "A build that fits", he: "רכיבים שמתאימים יחד" })}</h3><p>{t({ en: "Our PC builder guides you through compatible components.", he: "בונה המחשבים מדריך אתכם בבחירת רכיבים תואמים." })}</p><Link className="home-view-all" to="/build">{t({ en: "Try the PC builder", he: "לבונה המחשבים" })}<ArrowUpLeft size={16} aria-hidden="true" /></Link></article>
        </div>
      </section>
    </div>
  );
}

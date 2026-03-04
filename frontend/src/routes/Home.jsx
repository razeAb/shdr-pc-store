import { Link, useOutletContext } from "react-router-dom";
import PromoBanner from "../components/PromoBanner.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Home() {
  const { onToast } = useOutletContext();
  const { addItem } = useCart();

  const handleAdd = (product) => {
    addItem(product);
    onToast("Added to cart");
  };

  return (
    <>
      <PromoBanner />
      <section className="hero-section">
        <HeroCarousel />
        <div className="promo-tiles" aria-label="Promotions">
          <Link className="promo-tile" to="/search?q=gift%20cards">
            <div className="promo-icon" aria-hidden="true">
              GC
            </div>
            <div>
              <h3>Gift cards</h3>
              <p>Send digital codes in minutes.</p>
            </div>
          </Link>
          <Link className="promo-tile" to="/search?q=clearance">
            <div className="promo-icon" aria-hidden="true">
              CL
            </div>
            <div>
              <h3>Clearance</h3>
              <p>Last chance deals while stocks last.</p>
            </div>
          </Link>
        </div>
        <section className="category-section" aria-labelledby="category-title">
          <div className="section-heading">
            <h2 id="category-title">Shop by category</h2>
            <p>Gear up with peripherals and PC essentials.</p>
          </div>
          <div className="category-grid">
            <Link className="category-card" to="/search?q=headphones">
              <span>Headphones</span>
            </Link>
            <Link className="category-card" to="/search?q=keyboards">
              <span>Keyboards</span>
            </Link>
            <Link className="category-card" to="/search?q=mouse">
              <span>Mouse</span>
            </Link>
            <Link className="category-card" to="/search?q=pc%20screens">
              <span>PC Screens</span>
            </Link>
            <Link className="category-card" to="/search?q=controllers">
              <span>Controllers</span>
            </Link>
            <Link className="category-card" to="/search?q=storage">
              <span>Storage</span>
            </Link>
          </div>
        </section>
      </section>
      <ProductGrid onAdd={handleAdd} />
    </>
  );
}

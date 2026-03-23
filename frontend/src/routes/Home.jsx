import { Link, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import PromoBanner from "../components/PromoBanner.jsx";
import HeroCarousel from "../components/HeroCarousel.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import { useCart } from "../context/CartContext.jsx";
import api from "../api";

export default function Home() {
  const { onToast } = useOutletContext();
  const { addItem } = useCart();
  const [categories, setCategories] = useState([]);
  const [categoriesError, setCategoriesError] = useState("");

  const handleAdd = (product) => {
    addItem(product);
    onToast("Added to cart");
  };

  useEffect(() => {
    const controller = new AbortController();
    const fetchCategories = async () => {
      try {
        const res = await api.get("/api/categories", { signal: controller.signal });
        const list = Array.isArray(res.data) ? res.data : [];
        setCategories(list.map((item) => item.name).filter(Boolean));
        setCategoriesError("");
      } catch (err) {
        if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
        setCategoriesError(err?.message || "Failed to load categories.");
      }
    };
    fetchCategories();
    return () => controller.abort();
  }, []);

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
            {categories.length > 0 ? (
              categories.map((name) => (
                <Link key={name} className="category-card" to={`/search?category=${encodeURIComponent(name)}`}>
                  <span>{name}</span>
                </Link>
              ))
            ) : (
              <div className="category-card">
                <span>{categoriesError || "No categories yet."}</span>
              </div>
            )}
          </div>
        </section>
      </section>
      <ProductGrid onAdd={handleAdd} />
    </>
  );
}

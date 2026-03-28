import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "./SearchBar.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { useLang } from "../context/LangContext.jsx";

export default function Header() {
  const { items } = useCart();
  const { products } = useProducts();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLang();
  const cartCount = items.reduce((total, item) => total + item.qty, 0);

  const handleAccountClick = () => {
    const token = localStorage.getItem("shdr-token");
    const role = localStorage.getItem("shdr-role");
    const authTime = Number(localStorage.getItem("shdr-auth-time") || 0);
    const isExpired = authTime && Date.now() - authTime > 60 * 60 * 1000;

    if (isExpired) {
      localStorage.removeItem("shdr-token");
      localStorage.removeItem("token");
      localStorage.removeItem("shdr-role");
      localStorage.removeItem("shdr-auth-time");
      navigate("/login");
      return;
    }

    if (token && role === "admin") {
      navigate("/admin");
      return;
    }

    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="logo" to="/" aria-label={t({ en: "SHDR Game Store home", he: "דף הבית של SHDR" })}>
          <span aria-hidden="true" className="logo-mark">
            <img className="logo-image" src="/logo.jpeg" alt="" />
          </span>
          <span className="logo-text">SHDR</span>
        </Link>
        <div className="header-actions">
          <button
            className="icon-button mobile-search-toggle"
            type="button"
            onClick={() => setIsSearchOpen((open) => !open)}
            aria-expanded={isSearchOpen}
            aria-controls="header-search"
          >
            <span className="visually-hidden">{t({ en: "Toggle search", he: "פתיחת חיפוש" })}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M15.5 15.5L21 21M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <SearchBar
            id="header-search"
            products={products}
            isOpen={isSearchOpen}
            onRequestClose={() => setIsSearchOpen(false)}
          />
          <button
            className="icon-button"
            type="button"
            onClick={handleAccountClick}
            aria-label={t({ en: "Login", he: "התחברות" })}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm7 9a7 7 0 0 0-14 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <Link className="icon-button cart-button" to="/cart" aria-label={t({ en: "Cart", he: "עגלה" })}>
            <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M6 6h15l-1.6 8.5a2 2 0 0 1-2 1.5H9.4a2 2 0 0 1-2-1.6L5 3H2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="20" r="1.4" />
              <circle cx="18" cy="20" r="1.4" />
            </svg>
            <span className="cart-count" aria-live="polite">
              {cartCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

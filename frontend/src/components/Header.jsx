import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchBar from "./SearchBar.jsx";
import CategoryNav from "./CategoryNav.jsx";
import MobileNav from "./MobileNav.jsx";
import { useProducts } from "../context/ProductsContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import CartIcon from "./CartIcon.jsx";
import { OwnerCostToggle } from "./OwnerPurchaseCost.jsx";

export default function Header({ cartCount = 0, onCartOpen }) {
  const { products } = useProducts();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();
  const { t, lang, setLang } = useLang();

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
      window.dispatchEvent(new Event("shdr-auth-changed"));
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
        <MobileNav />
        <Link className="logo" to="/" aria-label={t({ en: "SHDR Game Store home", he: "דף הבית של SHDR" })}>
          <span aria-hidden="true" className="logo-mark">
            <img className="logo-image" src="/logo.jpeg" alt="" />
          </span>
          <span className="logo-text">SHDR<span className="logo-caption">TECH & GAMING</span></span>
        </Link>
        <div className="header-actions">
          <button className="language-toggle" type="button" onClick={() => setLang(lang === "he" ? "en" : "he")} aria-label={lang === "he" ? "Switch to English" : "מעבר לעברית"}>{lang === "he" ? "EN" : "עב"}</button>
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
          <CartIcon onOpen={onCartOpen} count={cartCount} />
        </div>
      </div>
      <div className="header-nav-row">
        <OwnerCostToggle />
        <CategoryNav />
      </div>
    </header>
  );
}

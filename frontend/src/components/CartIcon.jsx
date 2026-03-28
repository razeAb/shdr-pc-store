import React from "react";
import { useLang } from "../context/LangContext.jsx";
import "./cart-drawer.css";

export default function CartIcon({ onOpen, count = 0 }) {
  const { t } = useLang();

  return (
    <button
      className="cart-icon"
      type="button"
      onClick={onOpen}
      aria-label={t({ en: "Open cart", he: "פתח עגלה" })}
    >
      <span className="cart-icon__glyph">🛒</span>
      {count > 0 && <span className="cart-icon__badge">{count}</span>}
    </button>
  );
}

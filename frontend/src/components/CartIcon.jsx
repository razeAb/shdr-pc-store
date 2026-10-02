import React from "react";
import { ShoppingBag } from "lucide-react";
import { useLang } from "../context/LangContext.jsx";
import "./cart-drawer.css";

export default function CartIcon({ onOpen, count = 0 }) {
  const { t } = useLang();

  return (
    <button
      className="icon-button cart-icon"
      type="button"
      onClick={onOpen}
      aria-label={t({ en: `Open cart (${count} items)`, he: `פתח עגלה (${count} פריטים)` })}
    >
      <ShoppingBag size={20} strokeWidth={1.6} aria-hidden="true" />
      {count > 0 && <span className="cart-icon__badge">{count}</span>}
    </button>
  );
}

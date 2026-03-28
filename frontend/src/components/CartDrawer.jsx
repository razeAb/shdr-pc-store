import React, { useEffect } from "react";
import { useLang } from "../context/LangContext.jsx";
import { formatCurrency } from "../utils/format.js";
import "./cart-drawer.css";

export default function CartDrawer({ isOpen, onClose, items = [] }) {
  const { t } = useLang();

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const itemCount = items.reduce((total, item) => total + item.qty, 0);

  return (
    <div className="cart-drawer__overlay" onClick={onClose} role="presentation">
      <div
        className="cart-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={t({ en: "Your cart", he: "העגלה שלך" })}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="cart-drawer__header">
          <div>
            <h2 className="cart-drawer__title">{t({ en: "Your Cart", he: "העגלה שלך" })}</h2>
            <p className="cart-drawer__subtitle">
              {t({
                en: `${itemCount} items`,
                he: `${itemCount} פריטים`
              })}
            </p>
          </div>
          <button
            className="cart-drawer__close"
            type="button"
            onClick={onClose}
            aria-label={t({ en: "Close cart", he: "סגור עגלה" })}
          >
            ×
          </button>
        </header>

        <div className="cart-drawer__body">
          {items.length === 0 ? (
            <div className="cart-drawer__empty">
              {t({ en: "Your cart is empty.", he: "העגלה שלך ריקה." })}
            </div>
          ) : (
            <ul className="cart-list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <img className="cart-item__img" src={item.image} alt={item.title} />
                  <div className="cart-item__info">
                    <div className="cart-item__title">{item.title}</div>
                    <div className="cart-item__meta">
                      {item.qty} × {formatCurrency(item.price, "ILS")}
                    </div>
                  </div>
                  <div className="cart-item__total">
                    {formatCurrency(item.qty * item.price, "ILS")}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="cart-drawer__footer">
          <button className="cart-drawer__primary" type="button">
            {t({ en: "Checkout", he: "לקופה" })}
          </button>
        </footer>
      </div>
    </div>
  );
}

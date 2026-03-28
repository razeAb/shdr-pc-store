import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/format.js";
import { useLang } from "../context/LangContext.jsx";

export default function Cart() {
  const { items, updateQty, removeItem, clearCart } = useCart();
  const { t } = useLang();
  const [coupon, setCoupon] = useState("");
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (items.length === 0) {
    return (
      <section className="cart">
        <h1>{t({ en: "Your cart is empty", he: "העגלה שלך ריקה" })}</h1>
        <p>{t({ en: "Browse our latest releases and deals.", he: "גלו את החדשים והמבצעים שלנו." })}</p>
        <Link to="/" className="primary-button">
          {t({ en: "Return home", he: "חזרה לדף הבית" })}
        </Link>
      </section>
    );
  }

  return (
    <section className="cart">
      <div className="section-heading">
        <h1>{t({ en: "Your cart", he: "העגלה שלך" })}</h1>
        <button type="button" className="text-button" onClick={clearCart}>
          {t({ en: "Clear cart", he: "נקה עגלה" })}
        </button>
      </div>
      <div className="cart-list">
        {items.map((item) => (
          <article key={item.id} className="cart-item-row">
            <img src={item.image} alt={item.title} loading="lazy" />
            <div className="cart-item-row__info">
              <h2>{item.title}</h2>
              <p className="cart-item-row__price">{formatCurrency(item.price, "ILS")}</p>
            </div>
            <div className="qty-controls" role="group" aria-label={t({ en: "Quantity", he: "כמות" })}>
              <button
                type="button"
                onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}
                aria-label={t({ en: "Decrease quantity", he: "הפחת כמות" })}
                disabled={item.qty <= 1}
              >
                -
              </button>
              <span className="qty" aria-live="polite">
                {item.qty}
              </span>
              <button
                type="button"
                onClick={() => updateQty(item.id, Math.min(99, item.qty + 1))}
                aria-label={t({ en: "Increase quantity", he: "הגדל כמות" })}
              >
                +
              </button>
            </div>
            <p className="price-now">{formatCurrency(item.price * item.qty, "ILS")}</p>
            <button
              type="button"
              className="delete-btn"
              onClick={() => removeItem(item.id)}
              aria-label={t({ en: "Remove item", he: "הסר פריט" })}
            >
              🗑
            </button>
          </article>
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-summary__details">
          <div className="cart-coupon">
            <label htmlFor="coupon-input">{t({ en: "Coupon code", he: "קוד קופון" })}</label>
            <div className="cart-coupon__field">
              <input
                id="coupon-input"
                type="text"
                value={coupon}
                onChange={(event) => setCoupon(event.target.value)}
                placeholder={t({ en: "Enter code", he: "הכנס קוד" })}
              />
              <button type="button" className="secondary-button">
                {t({ en: "Apply", he: "החל" })}
              </button>
            </div>
          </div>
          <div className="cart-total">
            <p>{t({ en: "Total", he: "סה״כ" })}</p>
            <h2>{formatCurrency(total, "ILS")}</h2>
          </div>
        </div>
        <button type="button" className="primary-button">
          {t({ en: "Checkout", he: "לקופה" })}
        </button>
      </div>
    </section>
  );
}

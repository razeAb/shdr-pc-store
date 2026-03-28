import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/format.js";
import { useLang } from "../context/LangContext.jsx";

export default function Cart() {
  const { items, updateQty, removeItem, clearCart } = useCart();
  const { t } = useLang();
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
          <article key={item.id} className="cart-row">
            <img src={item.image} alt={item.title} loading="lazy" />
            <div>
              <h2>{item.title}</h2>
              <p>{formatCurrency(item.price, "ILS")}</p>
              <div className="cart-actions">
                <label>
                  <span className="visually-hidden">{t({ en: "Quantity", he: "כמות" })}</span>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(event) => updateQty(item.id, event.target.value)}
                  />
                </label>
                <button
                  type="button"
                  className="text-button"
                  onClick={() => removeItem(item.id)}
                >
                  {t({ en: "Remove", he: "הסר" })}
                </button>
              </div>
            </div>
            <p className="price-now">
              {formatCurrency(item.price * item.qty, "ILS")}
            </p>
          </article>
        ))}
      </div>
      <div className="cart-summary">
        <div>
          <p>{t({ en: "Total", he: "סה״כ" })}</p>
          <h2>{formatCurrency(total, "ILS")}</h2>
        </div>
        <button type="button" className="primary-button">
          {t({ en: "Checkout", he: "לקופה" })}
        </button>
      </div>
    </section>
  );
}

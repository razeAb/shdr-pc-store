import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { formatCurrency } from "../utils/format.js";

export default function Cart() {
  const { items, updateQty, removeItem, clearCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (items.length === 0) {
    return (
      <section className="cart">
        <h1>Your cart is empty</h1>
        <p>Browse our latest releases and deals.</p>
        <Link to="/" className="primary-button">
          Return home
        </Link>
      </section>
    );
  }

  return (
    <section className="cart">
      <div className="section-heading">
        <h1>Your cart</h1>
        <button type="button" className="text-button" onClick={clearCart}>
          Clear cart
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
                  <span className="visually-hidden">Quantity</span>
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
                  Remove
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
          <p>Total</p>
          <h2>{formatCurrency(total, "ILS")}</h2>
        </div>
        <button type="button" className="primary-button">
          Checkout
        </button>
      </div>
    </section>
  );
}

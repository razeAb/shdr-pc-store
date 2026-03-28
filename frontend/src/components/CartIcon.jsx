import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useLang } from "../context/LangContext.jsx";

export default function CartIcon() {
  const { items } = useCart();
  const { t } = useLang();
  const location = useLocation();
  const totalItems = items.reduce((total, item) => total + item.qty, 0);

  if (location.pathname !== "/") return null;

  return (
    <Link className="floating-cart" to="/cart" aria-label={t({ en: "Open cart", he: "פתח עגלה" })}>
      <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22">
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
      {totalItems > 0 ? <span className="floating-cart-count">{totalItems}</span> : null}
    </Link>
  );
}

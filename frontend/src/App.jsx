import { Routes, Route, Outlet } from "react-router-dom";
import { useRef, useState } from "react";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Toast from "./components/Toast.jsx";
import Home from "./routes/Home.jsx";
import Search from "./routes/Search.jsx";
import Product from "./routes/Product.jsx";
import Cart from "./routes/Cart.jsx";
import Account from "./routes/Account.jsx";
import Login from "./routes/Login.jsx";
import Signup from "./routes/Signup.jsx";
import AdminApp from "./admin/AdminApp.jsx";
import { ProductsProvider } from "./context/ProductsContext.jsx";
import { useLang } from "./context/LangContext.jsx";
import CartIcon from "./components/CartIcon.jsx";

function AppLayout({ onToast }) {
  const { t } = useLang();
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        {t({ en: "Skip to content", he: "דלג לתוכן" })}
      </a>
      <Header />
      <main id="main" className="main-content" tabIndex={-1}>
        <Outlet context={{ onToast }} />
      </main>
      <CartIcon />
      <Footer />
    </div>
  );
}

export default function App() {
  const [toast, setToast] = useState({ message: "", isVisible: false });
  const toastTimer = useRef(null);

  const showToast = (message) => {
    setToast({ message, isVisible: true });
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast({ message: "", isVisible: false });
    }, 2200);
  };

  return (
    <>
      <ProductsProvider>
        <Routes>
          <Route element={<AppLayout onToast={showToast} />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/account" element={<Account />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </ProductsProvider>
      <Toast message={toast.message} isVisible={toast.isVisible} />
    </>
  );
}

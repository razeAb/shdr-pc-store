import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLang } from "../context/LangContext.jsx";

export default function Login() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();
  const { t } = useLang();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    const formData = new FormData(form);
    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    };

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || t({ en: "Login failed", he: "ההתחברות נכשלה" }));
      }
      localStorage.setItem("shdr-token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("shdr-role", data?.user?.role || "user");
      localStorage.setItem("shdr-auth-time", String(Date.now()));
      window.dispatchEvent(new Event("shdr-auth-changed"));
      setStatus({ type: "success", message: t({ en: "Signed in successfully.", he: "התחברת בהצלחה." }) });
      form?.reset();
      if (data?.user?.role === "admin") {
        navigate("/admin", { replace: true });
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth" aria-labelledby="login-title">
      <div className="auth-card">
        <h1 id="login-title">{t({ en: "Sign in", he: "התחברות" })}</h1>
        <p className="auth-subtitle">{t({ en: "Access orders, wishlists, and exclusive drops.", he: "גישה להזמנות, רשימות משאלות ומבצעים בלעדיים." })}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>{t({ en: "Email", he: "אימייל" })}</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            <span>{t({ en: "Password", he: "סיסמה" })}</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="primary-button">
            {isSubmitting ? t({ en: "Signing in...", he: "מתחבר..." }) : t({ en: "Sign in", he: "התחבר" })}
          </button>
        </form>
        {status.message ? (
          <p className={`auth-status ${status.type}`} role="status">
            {status.message}
          </p>
        ) : null}
        <div className="auth-links">
          <button type="button" className="text-button">
            {t({ en: "Forgot password?", he: "שכחת סיסמה?" })}
          </button>
          <p>
            {t({ en: "New here?", he: "חדש כאן?" })} <Link to="/signup">{t({ en: "Create an account", he: "פתח חשבון" })}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { useState } from "react";
import { useLang } from "../context/LangContext.jsx";

export default function Signup() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { t } = useLang();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    const formData = new FormData(form);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: t({ en: "Passwords do not match.", he: "הסיסמאות אינן תואמות." }) });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      email: String(formData.get("email") || ""),
      password
    };

    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || t({ en: "Signup failed", he: "ההרשמה נכשלה" }));
      }
      localStorage.setItem("shdr-token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("shdr-role", data?.user?.role || "user");
      localStorage.setItem("shdr-auth-time", String(Date.now()));
      window.dispatchEvent(new Event("shdr-auth-changed"));
      setStatus({ type: "success", message: t({ en: "Account created successfully.", he: "החשבון נוצר בהצלחה." }) });
      form?.reset();
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth" aria-labelledby="signup-title">
      <div className="auth-card">
        <h1 id="signup-title">{t({ en: "Create account", he: "יצירת חשבון" })}</h1>
        <p className="auth-subtitle">{t({ en: "Join SHDR to track orders and member deals.", he: "הצטרפו ל-SHDR למעקב הזמנות ומבצעים לחברים." })}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>{t({ en: "Full name", he: "שם מלא" })}</span>
            <input type="text" name="name" placeholder={t({ en: "Your name", he: "השם שלך" })} autoComplete="name" required />
          </label>
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
              placeholder={t({ en: "Create a password", he: "בחר סיסמה" })}
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            <span>{t({ en: "Confirm password", he: "אימות סיסמה" })}</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder={t({ en: "Repeat password", he: "חזור על הסיסמה" })}
              autoComplete="new-password"
              required
            />
          </label>
          <button type="submit" className="primary-button">
            {isSubmitting ? t({ en: "Creating...", he: "יוצר..." }) : t({ en: "Create account", he: "צור חשבון" })}
          </button>
        </form>
        {status.message ? (
          <p className={`auth-status ${status.type}`} role="status">
            {status.message}
          </p>
        ) : null}
        <div className="auth-links">
          <p>
            {t({ en: "Already have an account?", he: "כבר יש לך חשבון?" })} <Link to="/login">{t({ en: "Sign in", he: "התחבר" })}</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

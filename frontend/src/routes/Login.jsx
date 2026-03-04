import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const navigate = useNavigate();

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
        throw new Error(data?.message || "Login failed");
      }
      localStorage.setItem("shdr-token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("shdr-role", data?.user?.role || "user");
      localStorage.setItem("shdr-auth-time", String(Date.now()));
      setStatus({ type: "success", message: "Signed in successfully." });
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
        <h1 id="login-title">Sign in</h1>
        <p className="auth-subtitle">Access orders, wishlists, and exclusive drops.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email</span>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </label>
          <button type="submit" className="primary-button">
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
        {status.message ? (
          <p className={`auth-status ${status.type}`} role="status">
            {status.message}
          </p>
        ) : null}
        <div className="auth-links">
          <button type="button" className="text-button">
            Forgot password?
          </button>
          <p>
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

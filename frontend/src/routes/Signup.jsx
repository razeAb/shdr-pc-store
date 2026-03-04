import { Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus({ type: "", message: "" });
    setIsSubmitting(true);

    const formData = new FormData(form);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
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
        throw new Error(data?.message || "Signup failed");
      }
      localStorage.setItem("shdr-token", data.token);
      localStorage.setItem("token", data.token);
      localStorage.setItem("shdr-role", data?.user?.role || "user");
      localStorage.setItem("shdr-auth-time", String(Date.now()));
      setStatus({ type: "success", message: "Account created successfully." });
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
        <h1 id="signup-title">Create account</h1>
        <p className="auth-subtitle">Join SHDR to track orders and member deals.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Full name</span>
            <input type="text" name="name" placeholder="Your name" autoComplete="name" required />
          </label>
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
              placeholder="Create a password"
              autoComplete="new-password"
              required
            />
          </label>
          <label>
            <span>Confirm password</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Repeat password"
              autoComplete="new-password"
              required
            />
          </label>
          <button type="submit" className="primary-button">
            {isSubmitting ? "Creating..." : "Create account"}
          </button>
        </form>
        {status.message ? (
          <p className={`auth-status ${status.type}`} role="status">
            {status.message}
          </p>
        ) : null}
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

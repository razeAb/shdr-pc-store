import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext.jsx";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand"><Link to="/"><strong>SHDR<span style={{ color: "var(--color-accent)" }}>.</span></strong></Link><p>{t({ en: "Your next level starts here. Discover technology for the way you play, work and create.", he: "הרמה הבאה שלך מתחילה כאן. טכנולוגיה לדרך שבה משחקים, עובדים ויוצרים." })}</p></div>
        <div><h3>{t({ en: "Explore", he: "מגלים יותר" })}</h3><ul>
          <li><Link to="/search">{t({ en: "All products", he: "כל המוצרים" })}</Link></li>
          <li><Link to="/search?category=Gaming%20PCs">{t({ en: "Gaming PCs", he: "מחשבי גיימינג" })}</Link></li>
          <li><Link to="/search?category=PC%20Gaming">{t({ en: "PC Gaming", he: "גיימינג למחשב" })}</Link></li>
          <li><Link to="/search?category=Laptops">{t({ en: "Laptops", he: "מחשבים ניידים" })}</Link></li>
        </ul></div>
        <div><h3>{t({ en: "Your platform", he: "הפלטפורמה שלך" })}</h3><ul>
          {["PlayStation", "Xbox", "Nintendo"].map((name) => <li key={name}><Link to={`/search?category=${name}`}>{name}</Link></li>)}
        </ul></div>
        <div><h3>{t({ en: "Your space", he: "האזור שלך" })}</h3><ul>
          <li><Link to="/login">{t({ en: "Sign in", he: "התחברות" })}</Link></li>
          <li><Link to="/signup">{t({ en: "Create an account", he: "יצירת חשבון" })}</Link></li>
          <li><Link to="/cart">{t({ en: "Shopping bag", he: "סל הקניות" })}</Link></li>
        </ul></div>
      </div>
      <p className="footer-note">{t({ en: "Made by raze. All rights reserved.", he: "נבנה על ידי raze. כל הזכויות שמורות." })}</p>
    </footer>
  );
}

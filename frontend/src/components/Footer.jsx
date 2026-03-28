import { useLang } from "../context/LangContext.jsx";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <h3>{t({ en: "Customer Service", he: "שירות לקוחות" })}</h3>
          <ul>
            <li>
              <a href="#">{t({ en: "Help Centre", he: "מרכז עזרה" })}</a>
            </li>
            <li>
              <a href="#">{t({ en: "Returns", he: "החזרות" })}</a>
            </li>
            <li>
              <a href="#">{t({ en: "Shipping", he: "משלוחים" })}</a>
            </li>
          </ul>
        </div>
        <div>
          <h3>{t({ en: "About", he: "אודות" })}</h3>
          <ul>
            <li>
              <a href="#">{t({ en: "Company", he: "החברה" })}</a>
            </li>
            <li>
              <a href="#">{t({ en: "Careers", he: "קריירה" })}</a>
            </li>
            <li>
              <a href="#">{t({ en: "Press", he: "תקשורת" })}</a>
            </li>
          </ul>
        </div>
        <div>
          <h3>{t({ en: "Store Locator", he: "איתור סניפים" })}</h3>
          <ul>
            <li>
              <a href="#">{t({ en: "Find a store", he: "מצא סניף" })}</a>
            </li>
            <li>
              <a href="#">{t({ en: "Click & Collect", he: "איסוף מהיר" })}</a>
            </li>
            <li>
              <a href="#">{t({ en: "Accessibility statement", he: "הצהרת נגישות" })}</a>
            </li>
          </ul>
        </div>
        <div>
          <h3>{t({ en: "Social", he: "רשתות חברתיות" })}</h3>
          <ul>
            <li>
              <a href="#">Instagram</a>
            </li>
            <li>
              <a href="#">X / Twitter</a>
            </li>
            <li>
              <a href="#">YouTube</a>
            </li>
          </ul>
        </div>
      </div>
      <p className="footer-note">{t({ en: "Made by raze. All rights reserved.", he: "נבנה על ידי raze. כל הזכויות שמורות." })}</p>
    </footer>
  );
}

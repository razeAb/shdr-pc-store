import { useLang } from "../context/LangContext.jsx";

export default function Account() {
  const { t } = useLang();
  return (
    <section className="account">
      <h1>{t({ en: "Account", he: "חשבון" })}</h1>
      <p>{t({ en: "This is a placeholder account page for future sign-in features.", he: "זהו דף חשבון זמני לתכונות התחברות עתידיות." })}</p>
    </section>
  );
}

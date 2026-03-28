import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const LangContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (value) => value
});

export function LangProvider({ children, initialLang = "en" }) {
  const [lang, setLang] = useState(initialLang);

  const t = useMemo(() => {
    return (value) => {
      if (!value) return "";
      if (typeof value === "string") return value;
      if (typeof value === "object") {
        return value[lang] || value.en || value.he || value.ar || Object.values(value)[0] || "";
      }
      return String(value);
    };
  }, [lang]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "he" ? "rtl" : "ltr";
  }, [lang]);

  const contextValue = useMemo(() => ({ lang, setLang, t }), [lang, t]);

  return <LangContext.Provider value={contextValue}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

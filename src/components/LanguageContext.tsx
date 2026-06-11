import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { tr, type DictKey } from "@/lib/i18n";

type Lang = "en" | "ta";
const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (k: DictKey) => string }>({
  lang: "en",
  setLang: () => {},
  t: (k) => tr(k, "en"),
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("kt_lang") : null;
    if (stored === "en" || stored === "ta") setLangState(stored);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    try { window.localStorage.setItem("kt_lang", l); } catch { /* ignore */ }
  };
  return (
    <Ctx.Provider value={{ lang, setLang, t: (k) => tr(k, lang) }}>{children}</Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);
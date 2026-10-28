"use client";
import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react";
import { translate, type Language } from "@/lib/translations";

const Context = createContext<Language>("es");
const readLanguage = (): Language => document.cookie.split("; ").includes("language=en") ? "en" : "es";
const subscribe = (listener: () => void) => {
  window.addEventListener("foodshare-language", listener);
  return () => window.removeEventListener("foodshare-language", listener);
};
export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore<Language>(subscribe, readLanguage, () => "es");
  useEffect(() => { document.documentElement.lang = language; }, [language]);
  return <Context.Provider value={language}>{children}</Context.Provider>;
}
export function useLanguage() {
  const language = useContext(Context);
  return { language, t: (text: string) => translate(text, language) };
}
export function Text({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return typeof children === "string" ? t(children) : children;
}
export function LanguageSelect() {
  const { language } = useLanguage();
  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-900">
      <span className="sr-only">Language / Idioma</span>
      <select aria-label="Language / Idioma" value={language} onChange={(e) => {
        document.cookie = `language=${e.target.value}; Path=/; Max-Age=31536000; SameSite=Lax`;
        window.dispatchEvent(new Event("foodshare-language"));
      }} className="rounded border border-gray-300 bg-white px-2 py-1">
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "./i18n/language-provider";

export default function ExpirationLabel({ date }: { date: string }) {
  const { language } = useLanguage();
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    function update() {
      const expires = new Date(date);
      const now = new Date();
      if (expires <= now) { setDays(-1); return; }
      // Compare local calendar days, using UTC only to avoid daylight-saving day lengths.
      const expiryDay = Date.UTC(expires.getFullYear(), expires.getMonth(), expires.getDate());
      const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      setDays(Math.round((expiryDay - today) / 86400000));
    }
    const timeout = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 60000);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, [date]);
  if (days === null) return <span aria-live="polite">—</span>;
  const text = language === "en"
    ? days < 0 ? "Expired" : days === 0 ? "Expires today" : `Expires in ${days} day${days === 1 ? "" : "s"}`
    : days < 0 ? "Vencido" : days === 0 ? "Vence hoy" : `Vence en ${days} día${days === 1 ? "" : "s"}`;
  return <span className={`block text-xs ${days <= 7 ? "text-orange-800" : "text-gray-600"}`} aria-live="polite">{text}</span>;
}

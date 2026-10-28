"use client";
import { useState } from "react";
import { useLanguage } from "./i18n/language-provider";

export default function LogoutButton() {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      window.location.assign(new URL("/login", window.location.origin).href);
    } catch { setError("No se pudo completar la operación"); setBusy(false); }
  }
  return (
  <span>
    <button disabled={busy} onClick={logout} className="rounded border border-gray-400 bg-white px-3 py-1 text-sm text-gray-900 disabled:opacity-50">{t("Cerrar sesión")}
      </button>{error && <span role="alert" className="block text-red-700">{t(error)}
        </span>}
  </span>)
}

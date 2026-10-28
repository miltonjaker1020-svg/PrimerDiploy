"use client";

import { Text } from "@/components/i18n/language-provider";
import LocalizedInput from "@/components/i18n/localized-input";


import { useState } from "react";
import Link from "next/link";
import { safeReturnPath } from "@/lib/access-rules";

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        const destination = new URLSearchParams(window.location.search).get("next") ?? "";
        // Only the known internal request form may be a login return target.
        // Route handlers set cookies without invalidating previously prefetched pages.
        // A fresh navigation avoids reusing a private redirect rendered before login.
        window.location.assign(safeReturnPath(destination));
      }
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900"><Text>{"Iniciar Sesión"}</Text></h2>
        <p className="mt-2 text-center text-sm text-gray-600"><Text>{"O"}</Text>{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500"><Text>{"regístrate aquí"}</Text></Link>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <div className="text-red-600 text-sm text-center"><Text>{error}</Text></div>}
        <div className="rounded-md shadow-sm -space-y-px">
          <div>
            <LocalizedInput
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <LocalizedInput
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Contraseña"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <Text>{"Iniciando sesión..."}</Text> : <Text>{"Iniciar Sesión"}</Text>}
          </button>
        </div>
      </form>
    </div>
  );
}

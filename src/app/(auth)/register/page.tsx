"use client";

import { Text } from "@/components/i18n/language-provider";
import LocalizedInput from "@/components/i18n/localized-input";


import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "", name: "", alias: "" , role: ""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar");
      } else {
        router.push("/login");
      }
    } catch {
      setError("Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900"><Text>{"Crear Cuenta"}</Text></h2>
        <p className="mt-2 text-center text-sm text-gray-600"><Text>{"O"}</Text>{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500"><Text>{"inicia sesión"}</Text></Link>
        </p>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && <div className="text-red-600 text-sm text-center"><Text>{error}</Text></div>}
        <div className="rounded-md shadow-sm space-y-2">
          <LocalizedInput
            type="email"
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            aria-label="Correo electrónico"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <LocalizedInput
            type="password"
            minLength={8}
            required
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            aria-label="Contraseña (mínimo 8 caracteres)"
            placeholder="Contraseña (mínimo 8 caracteres)"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <label htmlFor="role" className="block pt-3 text-sm font-medium text-gray-900"><Text>{"Tipo de cuenta"}</Text></label>
          <select required id="role" name="role" value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900">
            <option value="" disabled><Text>{"Selecciona tu tipo de cuenta"}</Text></option>
            <option value="BENEFICIARIO"><Text>{"Beneficiario — solicitar alimentos"}</Text></option>
            <option value="DONANTE"><Text>{"Donante — donar alimentos"}</Text></option>
          </select>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? <Text>{"Registrando..."}</Text> : <Text>{"Registrarse"}</Text>}
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { Text, useLanguage } from "@/components/i18n/language-provider";
import LocalizedInput from "@/components/i18n/localized-input";

import { useState, type FormEvent } from "react";
import { clientApi } from "@/lib/client-api";
import type { Category } from "@/types/dashboard";
import type { PublicProduct } from "@/types/products";

const blank = { name: "", catalogId: "", description: "", unit: "" };
export default function ProductManager({ categories, products, reload }: { categories: Category[]; products: PublicProduct[]; reload: () => Promise<void> }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      await clientApi(editing ? `/api/products/${editing}` : "/api/products", { method: editing ? "PATCH" : "POST", body: JSON.stringify(form) });
      setForm(blank); setEditing(""); await reload();
    } catch (error) { setError(error instanceof Error ? error.message : "Error al guardar"); }
    finally { setBusy(false); }
  }
  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try { await clientApi("/api/categories", { method: "POST", body: JSON.stringify({ name: categoryName }) }); setCategoryName(""); await reload(); }
    catch (error) { setError(error instanceof Error ? error.message : "Error al crear categoría"); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    if (!window.confirm(t("¿Eliminar este producto sin movimientos asociados?"))) return;
    setBusy(true); setError("");
    try { await clientApi(`/api/products/${id}`, { method: "DELETE" }); await reload(); }
    catch (error) { setError(error instanceof Error ? error.message : "Error al eliminar"); }
    finally { setBusy(false); }
  }
  return (
    <section className="space-y-5">
      <h2 className="text-xl font-semibold">
        <Text>{"Productos y categorías"}</Text>
        </h2>
      {error && <p role="alert" className="text-red-700">
        <Text>{error}</Text>
      </p>}
      <form onSubmit={createCategory} className="flex flex-wrap items-end gap-3 rounded border bg-white p-4">
        <label>
          <Text>{"Nueva categoría"}</Text>
          <LocalizedInput required maxLength={200} value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="ml-3 rounded border p-2" />
        </label>
        <button disabled={busy} className="rounded border border-blue-700 px-4 py-2 text-blue-700">
          <Text>{"Crear categoría"}</Text>
          </button>
      </form>
      <form onSubmit={save} className="grid gap-4 rounded border bg-white p-4 sm:grid-cols-2">
        <h3 className="font-semibold sm:col-span-2">
          {editing ? <Text>{"Editar producto"}</Text> 
          : <Text>{"Crear producto"}</Text>}
          </h3>
        <label>
          <Text>{"Nombre"}</Text>
          <LocalizedInput required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded border p-2" />

        </label>
        <label>
          <Text>{"Categoría"}</Text>
          <select required value={form.catalogId} onChange={(e) => setForm({ ...form, catalogId: e.target.value })} className="mt-1 w-full rounded border p-2">
          <option value=""><Text>{"Selecciona una categoría"}</Text>
          </option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select></label>
        <label>
          <Text>{"Unidad"}</Text>
          <LocalizedInput maxLength={50} placeholder="kg, litros, paquetes…" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="mt-1 w-full rounded border p-2" />

          </label>
        <label>
          <Text>{"Descripción"}</Text>
          <LocalizedInput maxLength={1000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 w-full rounded border p-2" />

          </label>
        <div className="flex gap-3">
          <button disabled={busy} className="rounded bg-blue-700 px-4 py-2 text-white">
            <Text>{"Guardar producto"}</Text>
            </button>{editing && <button type="button" onClick={() => { setEditing(""); setForm(blank); }} className="rounded-md border border-gray-400 bg-white px-4 py-2 text-gray-800 hover:bg-gray-100">
              <Text>{"Cancelar edición"}</Text>
              </button>}
        </div>
      </form>
      <ul className="divide-y rounded border bg-white">{products.map((p) => 
        <li key={p.id} className="flex flex-wrap justify-between gap-3 p-4">
        <span>{p.name} · {p.catalog.name} · {p.availableStock} {p.unit ?? 
          <Text>{"unidades"}</Text>}
        </span>
        <div className="flex gap-4">

          <button disabled={busy} onClick={() => { setEditing(p.id); setForm({ name: p.name, catalogId: p.catalog.id, description: p.description ?? "", unit: p.unit ?? "" }); }} className="rounded-md border border-blue-700 bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Text>{"Editar"}</Text>
          </button>

            <button disabled={busy} onClick={() => remove(p.id)} className="rounded-md border border-red-700 bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Text>{"Eliminar"}</Text>
            </button>
         </div>
        </li>)}
      </ul>
    </section>
  );
}

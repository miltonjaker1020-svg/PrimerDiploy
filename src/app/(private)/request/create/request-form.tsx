"use client";

import { Text } from "@/components/i18n/language-provider";
import LocalizedInput from "@/components/i18n/localized-input";


import Link from "next/link";
import { sessionFetch } from "@/lib/client-api";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { RequestProductOption } from "@/types/requests";

export default function RequestForm({ products, initialProductId = "" }: { products: RequestProductOption[]; initialProductId?: string }) {
  const router = useRouter();
  const submitting = useRef(false);
  const [productId, setProductId] = useState(() => products.some((product) => product.id === initialProductId) ? initialProductId : "");
  const [quantity, setQuantity] = useState("1");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);
  const selected = products.find((product) => product.id === productId);
  const maxQuantity = selected ? Math.min(selected.availableStock, selected.remainingQuota) : 0;
  const hasAvailableProducts = products.some((product) => product.availableStock > 0 && product.remainingQuota > 0);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    const amount = Number(quantity);
    if (!selected || !Number.isInteger(amount) || amount <= 0 || amount > maxQuantity) {
      setError("Selecciona un producto y una cantidad entera dentro del stock y tu cupo disponible");
      return;
    }
    submitting.current = true;
    setPending(true);
    try {
      const response = await sessionFetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: amount }),
      });
      if (response.status === 201) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      const data = await response.json().catch(() => null);
      const message = data && typeof data.error === "string" ? data.error : "No se pudo crear la solicitud";
      setError(message);
      if (response.status === 401) setSessionExpired(true);
      if (response.status === 409) router.refresh();
    } catch {
      setError("No se pudo confirmar el envío. Revisa tu dashboard antes de volver a intentar");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  if (products.length === 0) {
    return <p className="mt-8 rounded-lg border border-gray-200 bg-white p-6"><Text>{"Todavía no hay productos en el catálogo."}</Text></p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6 rounded-lg border border-gray-200 bg-white p-6" aria-busy={pending}>
      {!hasAvailableProducts && (
        <p role="status" className="text-gray-600"><Text>{"No hay productos con stock y cupo disponibles para solicitar en este momento."}</Text></p>
      )}
      {error && (
        <div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">
          <p><Text>{error}</Text></p>
          {sessionExpired && <Link href="/login" className="font-medium underline"><Text>{"Volver a iniciar sesión"}</Text></Link>}
        </div>
      )}
      <div>
        <label htmlFor="product" className="mb-2 block font-medium"><Text>{"Producto"}</Text></label>
        <select
          id="product" name="productId" required value={productId} disabled={pending || sessionExpired}
          onChange={(event) => { setProductId(event.target.value); setError(""); }}
          className="w-full rounded border border-gray-300 p-3 disabled:opacity-60"
          aria-describedby="product-details"
        >
          <option value=""><Text>{"Selecciona un producto"}</Text></option>
          {products.map((product) => (
            <option key={product.id} value={product.id} disabled={product.availableStock <= 0 || product.remainingQuota <= 0}>
              {product.catalogName} · {product.name}{product.unit ? ` (${product.unit})` : ""}
              {product.availableStock <= 0 ? <Text>{" — Sin stock"}</Text> : product.remainingQuota <= 0 ? <Text>{" — Sin cupo"}</Text> : ""}
            </option>
          ))}
        </select>
        <p id="product-details" aria-live="polite" className="mt-2 text-sm text-gray-600">
          {selected
            ? <><Text>{"Stock"}</Text>: {selected.availableStock} {selected.unit ?? <Text>{"unidades"}</Text>}. <Text>{"Tu cupo global restante"}</Text>: {selected.remainingQuota}.</>
            : <Text>{"Elige un producto para ver su disponibilidad y tu cupo restante."}</Text>}
        </p>
      </div>
      <div>
        <label htmlFor="quantity" className="mb-2 block font-medium"><Text>{"Cantidad"}</Text>{selected?.unit ? ` (${selected.unit})` : ""}</label>
        <LocalizedInput
          id="quantity" name="quantity" type="number" required min={1} max={maxQuantity || undefined} step={1}
          value={quantity} onChange={(event) => setQuantity(event.target.value)}
          disabled={pending || !selected || maxQuantity === 0 || sessionExpired}
          className="w-full rounded border border-gray-300 p-3 disabled:opacity-60"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending || !selected || maxQuantity === 0 || sessionExpired}
          className="rounded bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800 disabled:opacity-50">
          {pending ? <Text>{"Enviando solicitud…"}</Text> : <Text>{"Crear solicitud"}</Text>}
        </button>
        <Link href="/dashboard" className="text-blue-700 hover:underline"><Text>{"Cancelar"}</Text></Link>
      </div>
    </form>
  );
}

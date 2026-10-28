"use client";

import { Text } from "@/components/i18n/language-provider";
import LocalizedInput from "@/components/i18n/localized-input";


import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { clientApi } from "@/lib/client-api";

type ProductOption = { id: string; name: string; unit: string | null };
type InitialDonation = { id: string; productId: string; quantity: number; expirationDate: string };

export default function DonationForm({ products, initial }: { products: ProductOption[]; initial?: InitialDonation }) {
  const router = useRouter();
  const [productId, setProductId] = useState(initial?.productId ?? "");
  const [quantity, setQuantity] = useState(String(initial?.quantity ?? 1));
  // A full ISO string keeps server/client output identical; date conversion happens on submit.
  const [expirationDate, setExpirationDate] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError("");
    try {
      await clientApi(initial ? `/api/donations/${initial.id}` : "/api/donations", {
        method: initial ? "PATCH" : "POST",
        body: JSON.stringify({ productId, quantity: Number(quantity), expirationDate: expirationDate ? new Date(expirationDate).toISOString() : initial?.expirationDate }),
      });
      router.push("/dashboard"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Error al guardar"); }
    finally { setPending(false); }
  }
  if (!products.length) return <p><Text>{"No hay productos en el catálogo. Pide al administrador que registre uno."}</Text></p>;
  return (
    <form onSubmit={submit} className="mt-6 space-y-5 rounded-lg border bg-white p-6">
      {error && <p role="alert" className="text-red-700"><Text>{error}</Text></p>}

      <label className="block">
        <Text>{"Producto"}</Text>
        <select required value={productId} onChange={(e) => setProductId(e.target.value)} className="mt-2 w-full rounded border p-2">
          <option value="">
            <Text>{"Selecciona un alimento"}</Text>
            </option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name} {p.unit ? `(${p.unit})` : ""}</option>)}
        </select>
      </label>
      <label className="block">
        <Text>{"Cantidad"}</Text>
        <LocalizedInput required type="number" min={1} max={2147483647} step={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="mt-2 w-full rounded border p-2" />
      </label>
      <label className="block">
        <Text>{"Fecha y hora de vencimiento"}</Text>
        <LocalizedInput required={!initial} type="datetime-local" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="mt-2 w-full rounded border p-2" />
      </label>
      <p className="text-sm text-gray-600"><Text>{"Debe ser al menos 3 días posterior al registro."}
      </Text>{initial && <> 
      <Text>{"Vencimiento actual"}</Text>
      : {initial.expirationDate}. 
      <Text>{"Deja el campo vacío para conservarlo."}</Text>
      </>}</p>
      <button disabled={pending} className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-50">{pending ? 
        <Text>{"Guardando…"}</Text> 
        : <Text>{"Guardar donación"}</Text>}
        </button>
      <Link href="/dashboard" className="ml-4 text-blue-700">
      <Text>{"Cancelar"}</Text>
      </Link>
    </form>
  );
}

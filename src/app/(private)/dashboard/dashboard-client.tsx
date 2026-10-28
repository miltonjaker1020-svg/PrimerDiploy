"use client";

import { Text, useLanguage } from "@/components/i18n/language-provider";


import Link from "next/link";
import ExpirationLabel from "@/components/expiration-label";
import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import type { DashboardRecord } from "@/types/dashboard";

export default function DashboardClient({ role }: { role: "DONANTE" | "BENEFICIARIO" }) {
  const { language, t } = useLanguage();
  const [records, setRecords] = useState<DashboardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const donor = role === "DONANTE";
  const endpoint = donor ? "/api/donations" : "/api/requests";
  useEffect(() => {
    let active = true;
    clientApi<DashboardRecord[]>(endpoint)
      .then((data) => { if (active) setRecords(data); })
      .catch((error: Error) => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);
  async function cancel(id: string) {
    if (!window.confirm(t("¿Cancelar este registro pendiente?"))) return;
    setBusy(id); setError("");
    try {
      await clientApi(`${endpoint}/${id}`, { method: "PATCH", body: JSON.stringify({ status: "CANCELADA" }) });
      setRecords(await clientApi<DashboardRecord[]>(endpoint));
    } catch (error) { setError(error instanceof Error ? error.message : "Error al cancelar"); }
    finally { setBusy(""); }
  }
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold"><Text>{"Dashboard"}</Text></h1>
        <Link href={donor ? "/donation/create" : "/request/create"} className="rounded bg-blue-700 px-4 py-2 text-white">
        {donor ? <Text>{"Nueva donación"}</Text> : <Text>{"Solicitar alimentos"}</Text>}
        </Link>
      </div>

      <h2 className="mb-4 text-xl font-semibold">
        {donor ? <Text>{"Mis donaciones"}</Text> 
        : <Text>{"Mis solicitudes"}</Text>}
        </h2>

      {error && <p role="alert" className="mb-4 text-red-700"><Text>{error}</Text></p>}

      {loading ? <p role="status">
        <Text>{"Cargando tus registros…"}</Text>
          </p> : !records.length ? <p><Text>{"Todavía no tienes registros."}</Text></p> : (
            <div className="overflow-x-auto rounded border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                    <th className="p-3"><Text>{"Producto"}</Text>
                  </th>
                    <th className="p-3"><Text>{"Cantidad"}</Text>
                  </th>
                    <th className="p-3"><Text>{"Estado"}</Text>
                  </th>
                  {donor && <>
                    <th className="p-3"><Text>{"Entregadas"}</Text>
                  </th>
                    <th className="p-3"><Text>{"Vencimiento"}</Text>
                  </th>
                    </>}
                    <th className="p-3"><Text>{"Motivo de rechazo"}</Text>
                  </th>
                    <th className="p-3"><Text>{"Acciones"}</Text>
                </th>
                </tr>
              </thead>
              <tbody>{records.map((record) => (
                <tr key={record.id} className="border-t">
                  <td className="p-3">{record.product.name}</td>
                  <td className="p-3">{record.quantity} {record.product.unit ?? <Text>{"unidades"}</Text>}</td>
                  <td className="p-3"><Text>{record.status}</Text></td>
                  {donor && <><td className="p-3">{record.deliveredQuantity ?? 0}</td><td className="p-3">{record.expirationDate ? <>{new Date(record.expirationDate).toLocaleDateString(language === "en" ? "en-US" : "es-CO")}
                  <ExpirationLabel date={record.expirationDate} /></> : "—"}
                  </td>
                  </>}

                  <td className="p-3">{record.rejectionReason ?? "—"}</td>
                  <td className="p-3">{record.status === "PENDIENTE" && <div className="flex gap-3">
                    {donor && <Link href={`/donation/${record.id}/edit`} className="text-blue-700 underline"><Text>{"Editar"}</Text></Link>}
                    <button disabled={!!busy} onClick={() => cancel(record.id)} className="text-red-700 underline disabled:opacity-50">{busy === record.id ? <Text>{"Cancelando…"}</Text> : <Text>{"Cancelar"}</Text>}</button>
                  </div>}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
      )}
    </main>
  );
}

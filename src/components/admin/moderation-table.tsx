"use client";

import { Text } from "@/components/i18n/language-provider";
import LocalizedInput from "@/components/i18n/localized-input";

import { useState } from "react";
import { clientApi } from "@/lib/client-api";
import type { AdminRecord } from "@/types/dashboard";

export default function ModerationTable({ kind, records, reload }: { kind: "donations" | "requests"; records: AdminRecord[]; reload: () => Promise<void> }) {
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  async function moderate(id: string, status: string) {
    setBusy(id); setError("");
    try {
      await clientApi(`/api/admin/${kind}/${id}`, { method: "PATCH", body: JSON.stringify({ status, rejectionReason: reasons[id] ?? "" }) });
      await reload();
    } catch (error) { setError(error instanceof Error ? error.message : "Error al actualizar"); }
    finally { setBusy(""); }
  }
  return (
    <section>
      <h2 className="mb-4 text-xl font-semibold">{kind === "donations" ? 
          <Text>{"Revisión de donaciones"}</Text> : <Text>{"Gestión de solicitudes"}</Text>}
        </h2>
      {error && <p role="alert" className="mb-3 text-red-700">
        <Text>{error}</Text></p>}

      {!records.length ? <p><Text>{"No hay registros."}</Text></p> 
      : <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-left text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3"><Text>{"Usuario"}</Text></th>
            <th className="p-3"><Text>{"Producto"}</Text></th>
            <th className="p-3"><Text>{"Cantidad"}</Text></th>
            <th className="p-3"><Text>{"Estado"}</Text></th>
            <th className="p-3"><Text>{"Acciones"}</Text></th>
            </tr>
            </thead>
        <tbody>{records.map((r) => <tr key={r.id} className="border-t">
          <td className="p-3">{r.donor?.email ?? r.beneficiary?.email}</td>
          <td className="p-3">{r.product.name}</td><td className="p-3">{r.quantity}</td>
          <td className="p-3"><Text>{r.status}</Text>{r.rejectionReason && <p>{r.rejectionReason}</p>}</td>
          <td className="p-3">{r.status === "PENDIENTE" && <div className="flex flex-wrap items-center gap-3">
            <button disabled={!!busy} onClick={() => moderate(r.id, kind === "donations" ? "APROBADA" : "ENTREGADA")} className="rounded-md border border-green-700 bg-green-700 px-4 py-2 font-medium text-white hover:bg-green-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700 disabled:cursor-not-allowed disabled:opacity-50">{kind === "donations" ? 
                <Text>{"Aprobar"}</Text> : <Text>{"Entregar"}</Text>}
              </button> 

            <LocalizedInput aria-label={`Motivo de rechazo de ${r.product.name}`} placeholder="Motivo de rechazo" maxLength={1000} value={reasons[r.id] ?? ""} onChange={(e) => setReasons({ ...reasons, [r.id]: e.target.value })} className="rounded border p-2" />
              <button disabled={!!busy || !reasons[r.id]?.trim()} onClick={() => moderate(r.id, "RECHAZADA")} className="rounded-md border border-red-700 bg-red-700 px-4 py-2 font-medium text-white hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-not-allowed disabled:opacity-50"><Text>{"Rechazar"}</Text>
            </button>

          </div>}
          </td>
        </tr>)}
        </tbody>
      </table>
      </div>}
    </section>
  );
}

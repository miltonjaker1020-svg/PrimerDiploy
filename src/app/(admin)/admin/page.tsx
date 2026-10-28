"use client";

import { Text } from "@/components/i18n/language-provider";

import { useCallback, useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import type { Category, AdminRecord, InventoryRow } from "@/types/dashboard";
import type { PublicProduct } from "@/types/products";
import ProductManager from "@/components/admin/product-manager";
import ModerationTable from "@/components/admin/moderation-table";

async function loadAdminData() {
  return Promise.all([
    clientApi<Category[]>("/api/categories"), clientApi<PublicProduct[]>("/api/products"),
    clientApi<AdminRecord[]>("/api/admin/donations"), clientApi<AdminRecord[]>("/api/admin/requests"),
    clientApi<InventoryRow[]>("/api/admin/inventory"),
  ]);
}

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [donations, setDonations] = useState<AdminRecord[]>([]);
  const [requests, setRequests] = useState<AdminRecord[]>([]);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const applyData = useCallback(([cat, prod, don, req, inv]: Awaited<ReturnType<typeof loadAdminData>>) => {
    setCategories(cat); setProducts(prod); setDonations(don); setRequests(req); setInventory(inv);
  }, []);
  const reload = useCallback(async () => { applyData(await loadAdminData()); }, [applyData]);
  useEffect(() => {
    loadAdminData().then(applyData).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  }, [applyData]);
  if (loading) return <p role="status" className="p-8"><Text>{"Cargando panel…"}</Text></p>;
  return (
    <main className="space-y-9 p-4 text-gray-900 sm:p-8">
      <h1 className="text-3xl font-bold">
        <Text>{"Panel de administración"}</Text>
        </h1>
      {error ? 
      <div role="alert">
        <p className="text-red-700"><Text>{error}</Text></p>

        <button onClick={() => { setError(""); reload().catch((e: Error) => setError(e.message)); }} className="text-blue-700 underline"><Text>{"Reintentar"}</Text>
        </button>
      </div> : <>
        <section>
          <h2 className="mb-4 text-xl font-semibold"><Text>{"Resumen de inventario"}</Text></h2>

          <div className="overflow-x-auto rounded border bg-white">
            <table className="w-full text-left text-sm">
            <thead className="bg-gray-100"><tr><th className="p-3"><Text>{"Producto"}</Text>
            </th>
            <th className="p-3"><Text>{"Categoría"}</Text>
            </th>
            <th className="p-3"><Text>{"Stock"}</Text>
            </th>
            <th className="p-3"><Text>{"Vence en 7 días"}</Text>
            </th>
            </tr>
            </thead>
            <tbody>{inventory.map((r) => <tr key={r.productId} className="border-t">
              <td className="p-3">{r.productName}</td>
              <td className="p-3">{r.catalogName}</td>
              <td className="p-3">{r.availableStock} {r.unit}</td>
              <td className="p-3">{r.expiringSoonStock} {r.unit}</td>
              </tr>)}</tbody>
          </table></div>
        </section>
        <ProductManager categories={categories} products={products} reload={reload} />
        <ModerationTable kind="donations" records={donations} reload={reload} />
        <ModerationTable kind="requests" records={requests} reload={reload} />
      </>}
    </main>
  );
}

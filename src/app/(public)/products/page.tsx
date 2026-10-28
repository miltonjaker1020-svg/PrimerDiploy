import { Text } from "@/components/i18n/language-provider";
import LocalizedInput from "@/components/i18n/localized-input";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import ProductCard from "@/components/public/product-card";
import { getPublicProducts, parseProductFilters, ProductFilterError } from "@/lib/products";
import PublicLoading from "../loading";

async function ProductCatalog({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await connection();
  const query = await searchParams;
  const params = new URLSearchParams();
  for (const key of ["search", "available"]) {
    if (typeof query[key] === "string") params.set(key, query[key]);
  }
  let filters;
  try {
    filters = parseProductFilters(params);
  } catch (error) {
    if (!(error instanceof ProductFilterError)) throw error;
    return <p role="alert" className="mt-6 text-red-800">{error.message}. <Link href="/products" className="underline"><Text>{"Limpiar filtros"}</Text></Link></p>;
  }
  const products = await getPublicProducts(filters);
  return (
    <>
      <form action="/products" method="get" className="my-7 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
        <div className="min-w-0 flex-1 basis-64">
          <label htmlFor="search" className="mb-2 block text-sm font-medium"><Text>{"Buscar por nombre"}</Text></label>
          <LocalizedInput id="search" name="search" type="search" maxLength={200} defaultValue={filters.search} placeholder="Ej. arroz" className="w-full rounded border border-gray-300 px-3 py-2" />
        </div>
        <label className="flex items-center gap-2 py-2"><LocalizedInput type="checkbox" name="available" value="true" defaultChecked={filters.available} /><Text>{"Solo con stock"}</Text></label>
        <button type="submit" className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"><Text>{"Buscar"}</Text></button>
        <Link href="/products" className="py-2 text-blue-700 hover:underline"><Text>{"Limpiar"}</Text></Link>
      </form>
      <p role="status" className="mb-5 text-sm text-gray-600">{products.length} {products.length === 1 ? <Text>{"producto encontrado"}</Text> : <Text>{"productos encontrados"}</Text>}<Text>{". Las imágenes son ilustrativas."}</Text></p>
      {products.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600"><Text>{"No hay productos que mostrar con estos filtros. Puedes limpiar la búsqueda o volver más tarde."}</Text></p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product, index) => <ProductCard key={product.id} product={product} eager={index === 0} />)}</div>
      )}
    </>
  );
}

export default function ProductsPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold"><Text>{"Catálogo de alimentos"}</Text></h1>
      <p className="mt-3 text-gray-600"><Text>{"Disponibilidad calculada con donaciones aprobadas y no vencidas, descontando las unidades reservadas y entregadas."}</Text></p>
      <Suspense fallback={<PublicLoading />}><ProductCatalog {...props} /></Suspense>
    </main>
  );
}

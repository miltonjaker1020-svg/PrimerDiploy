import { Text } from "@/components/i18n/language-provider";
import Link from "next/link";

// No request-time data or session: this Home can be statically generated.
export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold"><Text>{"Alimentos"}</Text></h1>
      <p className="mt-3 text-gray-600"><Text>{"Consulta el catálogo y la disponibilidad antes de hacer tu solicitud."}</Text></p>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Link href="/products" className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-700">
          <h2 className="text-xl font-semibold text-blue-800"><Text>{"Catálogo completo"}</Text></h2>
          <p className="mt-3 text-gray-600"><Text>{"Consulta productos, categorías, unidades y stock."}</Text></p>
          <span className="mt-5 inline-block font-medium text-blue-700"><Text>{"Explorar productos →"}</Text></span>
        </Link>
        <Link href="/products?available=true" className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-700">
          <h2 className="text-xl font-semibold text-blue-800"><Text>{"Alimentos disponibles"}</Text></h2>
          <p className="mt-3 text-gray-600"><Text>{"Muestra únicamente los productos que tienen unidades disponibles."}</Text></p>
          <span className="mt-5 inline-block font-medium text-blue-700"><Text>{"Consultar disponibilidad →"}</Text></span>
        </Link>
        <Link href="/dashboard" className="rounded-lg border border-gray-200 bg-white p-6 hover:border-blue-700">
          <h2 className="text-xl font-semibold text-blue-800"><Text>{"Mis solicitudes o donaciones"}</Text></h2>
          <p className="mt-3 text-gray-600"><Text>{"Ingresa a tu cuenta para consultar tus registros y su estado."}</Text></p>
          <span className="mt-5 inline-block font-medium text-blue-700"><Text>{"Ir a mi cuenta →"}</Text></span>
        </Link>
      </div>
    </main>
  );
}

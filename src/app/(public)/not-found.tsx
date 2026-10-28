import { Text } from "@/components/i18n/language-provider";
import Link from "next/link";

export default function PublicNotFound() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <h1 className="text-3xl font-bold"><Text>{"Producto no encontrado"}</Text></h1>
      <p className="mt-3 text-gray-600"><Text>{"El producto que buscas no existe o ya no está en el catálogo."}</Text></p>
      <Link href="/products" className="mt-6 inline-block text-blue-700 underline"><Text>{"Volver al catálogo"}</Text></Link>
    </main>
  );
}

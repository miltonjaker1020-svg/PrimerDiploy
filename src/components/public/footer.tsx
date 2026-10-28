import { Text } from "@/components/i18n/language-provider";
import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-gray-600 sm:px-6">
        <p className="font-semibold text-gray-900">
          <Text>{"FoodShare · Banco de alimentos"}</Text>
        </p>
        <nav aria-label="Footer / Pie de página" className="flex gap-5">
          <Link href="/products" className="hover:text-blue-700"><Text>{"Catálogo"}</Text></Link>
          <Link href="/login" className="hover:text-blue-700"><Text>{"Ingresar"}</Text></Link>
          <Link href="/register" className="hover:text-blue-700"><Text>{"Crear cuenta"}</Text></Link>
        </nav>
      </div>
    </footer>
  );
}

import AccountMenu from "./account-menu";
import { Suspense } from "react";
import { LanguageSelect } from "@/components/i18n/language-provider";
import { Text } from "@/components/i18n/language-provider";
import Link from "next/link";

export default function PublicNavbar() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <nav aria-label="Main navigation / Navegación principal" className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link href="/" className="text-xl font-bold text-blue-800"><Text>{"FoodShare"}</Text></Link>
        <Link href="/products" className="text-sm font-medium hover:text-blue-700"><Text>{"Catálogo"}</Text></Link>
        <Link href="/dashboard" className="text-sm font-medium hover:text-blue-700"><Text>{"Mi cuenta"}</Text></Link>
        <div className="ml-auto flex flex-wrap items-center gap-4 text-sm"><LanguageSelect />
          <Suspense fallback={<span className="text-gray-500">…</span>}><AccountMenu /></Suspense>
        </div>
      </nav>
    </header>
  );
}

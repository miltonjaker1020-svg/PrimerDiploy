import { LanguageSelect } from "@/components/i18n/language-provider";
import { Text } from "@/components/i18n/language-provider";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { Suspense } from "react";
import { getSession } from "@/lib/auth-helpers";

async function PrivateNavigation() {
  const session = await getSession();
  // Pages enforce authorization themselves; do not race their return-to-login redirect.
  if (!session) return null;

  return (
    <nav aria-label="Account navigation / Cuenta" className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 py-4">
        <Link href="/dashboard" className="font-bold"><Text>{"FoodShare"}</Text></Link>
        <Link href="/dashboard" className="text-sm text-blue-700"><Text>{"Dashboard"}</Text></Link>
        
        {session.role === "BENEFICIARIO" && (
          <Link href="/request/create" className="text-sm text-blue-700"><Text>{"Solicitar alimentos"}</Text></Link>
        )}
        {session.role === "DONANTE" && <Link href="/donation/create" className="text-sm text-blue-700"><Text>{"Nueva donación"}</Text></Link>}
        <Link href="/products" className="text-sm text-blue-700"><Text>{"Catálogo"}</Text></Link>
        {session.role === "ADMINISTRADOR" && (
          <Link href="/admin" className="text-sm text-blue-700"><Text>{"Administración"}</Text></Link>
        )}
        <LanguageSelect /><span className="ml-auto text-sm text-gray-600">{session.email}</span><LogoutButton />
      </div>
    </nav>
  );
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Suspense fallback={<div className="border-b bg-white px-4 py-4 font-bold"><Text>{"FoodShare"}</Text></div>}>
        <PrivateNavigation />
      </Suspense>
      {children}
    </div>
  );
}

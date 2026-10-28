import { LanguageSelect } from "@/components/i18n/language-provider";
import { Text } from "@/components/i18n/language-provider";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";

async function AdminAccess({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMINISTRADOR") redirect("/dashboard");
  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="w-full bg-gray-800 text-white md:w-56 md:shrink-0">
        <div className="p-4">
          <h2 className="text-xl font-bold"><Text>{"Panel Admin"}</Text></h2>
        </div>
        <div className="px-4"><LanguageSelect /><div className="mt-3"><LogoutButton /></div></div><nav className="mt-8">
          <Link href="/admin" className="block px-4 py-2 hover:bg-gray-700"><Text>{"Dashboard"}</Text></Link>
          <Link href="/" className="block px-4 py-2 hover:bg-gray-700"><Text>{"Volver al sitio"}</Text></Link>
        </nav>
      </div>
      <div className="min-w-0 flex-1 bg-gray-50"><Suspense fallback={<p className="p-8"><Text>{"Verificando acceso…"}</Text></p>}><AdminAccess>{children}</AdminAccess></Suspense></div>
    </div>
  );
}

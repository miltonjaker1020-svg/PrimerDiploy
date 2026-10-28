"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { sessionFetch } from "@/lib/client-api";
import { Text } from "@/components/i18n/language-provider";
import LogoutButton from "@/components/logout-button";

type Account = { email: string; role: string };

export default function AccountMenu() {
  const pathname = usePathname();
  const [account, setAccount] = useState<Account | null | undefined>(undefined);
  useEffect(() => {
    let active = true;
    sessionFetch("/api/auth/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok && response.status !== 401) throw new Error();
        return response.ok ? (await response.json()).user as Account : null;
      })
      .then((user) => { if (active) setAccount(user); })
      .catch(() => { if (active) setAccount(undefined); });
    return () => { active = false; };
  }, [pathname]);

  // Keep the static Home stable without briefly suggesting that a user signed out.
  if (account === undefined) return <span role="status" className="text-gray-500">…</span>;
  if (account) return <>
    <Link href={account.role === "ADMINISTRADOR" ? "/admin" : "/dashboard"} className="max-w-48 truncate text-sm text-gray-700" title={account.email}>{account.email}</Link>
    <LogoutButton />
  </>;
  return <>
    <Link href="/login" className="font-medium text-blue-700 hover:underline"><Text>{"Ingresar"}</Text></Link>
    <Link href="/register" className="rounded bg-blue-700 px-4 py-2 font-medium text-white hover:bg-blue-800"><Text>{"Registrarse"}</Text></Link>
  </>;
}

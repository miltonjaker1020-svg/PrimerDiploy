"use client";

import { Text } from "@/components/i18n/language-provider";


import Link from "next/link";

export default function PrivateError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold"><Text>{"No pudimos cargar la información"}</Text></h1>
      <p className="mt-3 text-gray-600"><Text>{"Intenta de nuevo en unos momentos."}</Text></p>
      <div className="mt-6 flex gap-4">
        <button onClick={reset} className="rounded bg-blue-700 px-4 py-2 text-white"><Text>{"Reintentar"}</Text></button>
        <Link href="/dashboard" className="px-4 py-2 text-blue-700"><Text>{"Volver al dashboard"}</Text></Link>
      </div>
    </main>
  );
}

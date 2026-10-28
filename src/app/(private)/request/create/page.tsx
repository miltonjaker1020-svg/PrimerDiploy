import { Text } from "@/components/i18n/language-provider";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import { getRequestProductOptions } from "@/lib/requests";
import RequestForm from "./request-form";
import PrivateLoading from "../../loading";

type CreateRequestProps = { searchParams: Promise<{ productId?: string | string[] }> };

async function CreateRequestContent({ searchParams }: CreateRequestProps) {
  const query = await searchParams;
  const productId = typeof query.productId === "string" ? query.productId : "";
  const session = await getSession();
  if (!session) {
    const destination = `/request/create?productId=${encodeURIComponent(productId)}`;
    redirect(productId ? `/login?next=${encodeURIComponent(destination)}` : "/login");
  }
  if (session.role !== "BENEFICIARIO") redirect("/dashboard");

  const products = await getRequestProductOptions(session.userId);
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/dashboard" className="text-sm text-blue-700 hover:underline"><Text>{"Volver al dashboard"}</Text></Link>
      <h1 className="mt-6 text-3xl font-bold">
        <Text>{"Solicitar alimentos"}</Text>
        </h1>
      <p className="mt-3 text-gray-600"><Text>{"Puedes solicitar hasta 20 unidades en total en un período de 7 días. Las solicitudes pendientes y entregadas cuentan para este límite."}</Text></p>
      <RequestForm products={products} initialProductId={productId} />
    </main>
  );
}

export default function CreateRequestPage(props: CreateRequestProps) {
  return <Suspense fallback={<PrivateLoading />}><CreateRequestContent {...props} /></Suspense>;
}

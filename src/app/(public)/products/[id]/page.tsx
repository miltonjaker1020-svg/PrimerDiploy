import { Text } from "@/components/i18n/language-provider";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getPublicProduct } from "@/lib/products";
import PublicLoading from "../../loading";

async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const product = await getPublicProduct(id);
  if (!product) notFound();

  return (
    <article className="mt-6 grid gap-8 rounded-lg border border-gray-200 bg-white p-5 md:grid-cols-2 md:p-8">
      <figure>
        <Image src="/images/food-placeholder.svg" alt="Food basket / Canasta de alimentos" width={640} height={400} loading="eager" className="w-full rounded-lg" />
        <figcaption className="mt-2 text-sm text-gray-500"><Text>{"Imagen ilustrativa."}</Text></figcaption>
      </figure>
      <div>
        <p className="text-sm font-medium text-gray-600">{product.catalog.name}</p>
        <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
        <p className="mt-5 text-gray-600">{product.description || <Text>{"Este producto no tiene una descripción adicional."}</Text>}</p>
        <dl className="mt-6 space-y-3">
          <div><dt className="inline font-semibold"><Text>{"Unidad:"}</Text></dt><dd className="inline">{product.unit ?? <Text>{"unidades"}</Text>}</dd></div>
          <div><dt className="inline font-semibold"><Text>{"Stock disponible:"}</Text></dt><dd className="inline">{product.availableStock} {product.unit ?? <Text>{"unidades"}</Text>}</dd></div>
        </dl>
        {product.availableStock > 0 ? (
          <>
            <Link href={`/request/create?productId=${encodeURIComponent(product.id)}`} className="mt-7 inline-block rounded bg-blue-700 px-5 py-3 font-medium text-white hover:bg-blue-800"><Text>{"Solicitar este alimento"}</Text></Link>
            <p className="mt-3 text-sm text-gray-600"><Text>{"Necesitas una cuenta de beneficiario para solicitar. La disponibilidad se verifica al enviar."}</Text></p>
          </>
        ) : <p role="status" className="mt-7 rounded bg-gray-100 p-4 text-gray-700"><Text>{"Este producto no tiene stock disponible por el momento."}</Text></p>}
      </div>
    </article>
  );
}

export default function ProductDetailPage(props: { params: Promise<{ id: string }> }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <Link href="/products" className="text-blue-700 hover:underline"><Text>{"← Volver al catálogo"}</Text></Link>
      <Suspense fallback={<PublicLoading />}><ProductDetail {...props} /></Suspense>
    </main>
  );
}

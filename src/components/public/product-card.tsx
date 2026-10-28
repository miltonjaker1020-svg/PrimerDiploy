import { Text } from "@/components/i18n/language-provider";
import Image from "next/image";
import Link from "next/link";
import type { PublicProduct } from "@/types/products";

export default function ProductCard({ product, eager = false }: { product: PublicProduct; eager?: boolean }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Image src="/images/food-placeholder.svg" alt="" width={640} height={400} loading={eager ? "eager" : "lazy"} className="aspect-[8/5] w-full object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="text-sm text-gray-600">{product.catalog.name}</p>
        <h2 className="text-xl font-semibold">
          <Link href={`/products/${product.id}`} className="hover:text-blue-700 hover:underline">{product.name}</Link>
          </h2>
        <p className="text-sm text-gray-600">{product.description || <Text>{"Consulta el detalle de este alimento."}</Text>}</p>
        <p className={`mt-auto font-medium ${product.availableStock > 0 ? "text-green-800" : "text-gray-600"}`}>
          {product.availableStock > 0 ? <>{product.availableStock} {product.unit ?? <Text>{"unidades"}</Text>} <Text>{"disponibles"}</Text></> : <Text>{"Sin stock disponible"}</Text>}
        </p>
        <Link href={`/products/${product.id}`} className="mt-1 rounded border border-blue-700 px-4 py-2 text-center font-medium text-blue-700 hover:bg-blue-50"><Text>{"Ver detalle"}</Text><span className="sr-only"><Text>{"de"}</Text>{product.name}</span></Link>
      </div>
    </article>
  );
}

import type { PrismaClient } from "@prisma/client";
import { prisma } from "./prisma";
import { getProductAvailableStock, getProductsAvailableStock } from "./inventory";
import type { ProductFilters, PublicProduct } from "@/types/products";

const publicSelect = {
  id: true, name: true, description: true, unit: true,
  catalog: { select: { id: true, name: true } },
} as const;

type QueryOptions = { db?: PrismaClient; now?: Date };

export class ProductFilterError extends Error {}

export function parseProductFilters(params: URLSearchParams): ProductFilters {
  const search = (params.get("search") ?? "").trim();
  const available = params.get("available");
  if (search.length > 200) throw new ProductFilterError("La búsqueda no puede superar 200 caracteres");
  if (available !== null && available !== "true" && available !== "false") {
    throw new ProductFilterError("El filtro de disponibilidad debe ser true o false");
  }
  return { search, available: available === "true" };
}

export async function getPublicProducts(filters: ProductFilters = {}, options: QueryOptions = {}): Promise<PublicProduct[]> {
  const db = options.db ?? prisma;
  const now = options.now ?? new Date();
  const products = await db.product.findMany({
    where: filters.search ? { name: { contains: filters.search, mode: "insensitive" } } : {},
    select: publicSelect,
    orderBy: [{ name: "asc" }, { id: "asc" }],
  });
  const stock = await getProductsAvailableStock(products.map((product) => product.id), { db, now });
  const result = products.map((product) => ({ ...product, availableStock: stock.get(product.id) ?? 0 }));
  return filters.available ? result.filter((product) => product.availableStock > 0) : result;
}

export async function getPublicProduct(id: string, options: QueryOptions = {}): Promise<PublicProduct | null> {
  const db = options.db ?? prisma;
  const product = await db.product.findUnique({ where: { id }, select: publicSelect });
  if (!product) return null;
  return { ...product, availableStock: await getProductAvailableStock(id, { db, now: options.now }) };
}

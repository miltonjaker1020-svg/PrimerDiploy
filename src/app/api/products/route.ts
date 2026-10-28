import { prisma } from "@/lib/prisma";
import { apiSession, apiError, readBody } from "@/lib/api";
import { productInput } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";
import { getPublicProducts, parseProductFilters, ProductFilterError } from "@/lib/products";

export async function GET(request: Request) {
  try {
    const filters = parseProductFilters(new URL(request.url).searchParams);
    const products = await getPublicProducts(filters);
    return Response.json(products, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ProductFilterError) return Response.json({ error: error.message }, { status: 400 });
    console.error("Public products error:", error);
    return Response.json({ error: "No se pudo cargar el catálogo" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await apiSession("ADMINISTRADOR");
    const input = productInput(await readBody(request));
    if (!await prisma.catalog.findUnique({ where: { id: input.catalogId }, select: { id: true } })) throw new RequestError("Categoría no encontrada", 404);
    return Response.json(await prisma.product.create({ data: input }), { status: 201 });
  } catch (error) { return apiError(error); }
}

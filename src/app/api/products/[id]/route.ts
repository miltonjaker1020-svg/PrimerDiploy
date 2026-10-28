import { prisma } from "@/lib/prisma";
import { apiSession, apiError, readBody } from "@/lib/api";
import { productInput } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";
import { getPublicProduct } from "@/lib/products";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await getPublicProduct(id);
    if (!product) return Response.json({ error: "Producto no encontrado" }, { status: 404 });
    return Response.json(product, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Public product error:", error);
    return Response.json({ error: "No se pudo cargar el producto" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await apiSession("ADMINISTRADOR");
    const { id } = await params;
    const input = productInput(await readBody(request));
    if (!await prisma.catalog.findUnique({ where: { id: input.catalogId }, select: { id: true } })) throw new RequestError("Categoría no encontrada", 404);
    return Response.json(await prisma.product.update({ where: { id }, data: input }));
  } catch (error) { return apiError(error); }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await apiSession("ADMINISTRADOR");
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id }, select: { _count: { select: { donations: true, requests: true } } } });
    if (!product) throw new RequestError("Producto no encontrado", 404);
    if (product._count.donations || product._count.requests) throw new RequestError("No puedes eliminar un producto con donaciones o solicitudes", 409);
    await prisma.product.delete({ where: { id } });
    return Response.json({ message: "Producto eliminado" });
  } catch (error) { return apiError(error); }
}

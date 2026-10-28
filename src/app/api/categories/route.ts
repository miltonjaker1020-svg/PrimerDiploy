import { prisma } from "@/lib/prisma";
import { apiSession, apiError, readBody } from "@/lib/api";
import { requiredText } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";

export async function GET() {
  try { return Response.json(await prisma.catalog.findMany({ orderBy: { name: "asc" } })); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    await apiSession("ADMINISTRADOR");
    const body = await readBody(request);
    const name = requiredText(body.name, "Nombre");
    const description = body.description ? requiredText(body.description, "Descripción", 1000) : null;
    if (await prisma.catalog.findFirst({ where: { name: { equals: name, mode: "insensitive" } } })) throw new RequestError("La categoría ya existe", 409);
    return Response.json(await prisma.catalog.create({ data: { name, description } }), { status: 201 });
  } catch (error) { return apiError(error); }
}

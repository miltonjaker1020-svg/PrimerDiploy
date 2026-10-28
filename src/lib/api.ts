import { Prisma, type Role } from "@prisma/client";
import { getSession } from "./auth-helpers";
import { RequestError } from "./request-rules";

export async function apiSession(role?: Role) {
  const session = await getSession();
  if (!session) throw new RequestError("Inicia sesión para continuar", 401);
  if (role && session.role !== role) throw new RequestError("No tienes permiso para esta operación", 403);
  return session;
}

export async function readBody(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return body;
  } catch {
    throw new RequestError("El cuerpo debe ser un objeto JSON válido", 400);
  }
}

export function apiError(error: unknown) {
  if (error instanceof RequestError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") return Response.json({ error: "El registro ya existe" }, { status: 409 });
    if (error.code === "P2003") return Response.json({ error: "El registro tiene relaciones que impiden esta operación" }, { status: 409 });
    if (error.code === "P2025") return Response.json({ error: "Registro no encontrado" }, { status: 404 });
  }
  console.error("API error:", error);
  return Response.json({ error: "No se pudo completar la operación" }, { status: 500 });
}

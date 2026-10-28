import { prisma } from "@/lib/prisma";
import { apiSession, apiError, readBody } from "@/lib/api";
import { moderationInput } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";
import type { RequestStatus } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await apiSession("ADMINISTRADOR");
    const { id } = await params;
    const input = moderationInput(await readBody(request), ["ENTREGADA", "RECHAZADA"]);
    if (!await prisma.request.findUnique({ where: { id }, select: { id: true } })) throw new RequestError("Solicitud no encontrada", 404);
    const result = await prisma.request.updateMany({
      where: { id, status: "PENDIENTE" }, data: { status: input.status as RequestStatus, rejectionReason: input.rejectionReason },
    });
    if (!result.count) throw new RequestError("La solicitud ya tiene un estado final", 409);
    return Response.json({ message: "Solicitud actualizada" });
  } catch (error) { return apiError(error); }
}

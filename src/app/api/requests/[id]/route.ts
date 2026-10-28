import { prisma } from "@/lib/prisma";
import { apiSession, apiError, readBody } from "@/lib/api";
import { RequestError } from "@/lib/request-rules";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await apiSession("BENEFICIARIO");
    const { id } = await params;
    const body = await readBody(request);
    if (body.status !== "CANCELADA") throw new RequestError("Solo puedes cancelar tu solicitud", 400);
    const record = await prisma.request.findFirst({ where: { id, beneficiaryId: session.userId }, select: { id: true } });
    if (!record) throw new RequestError("Solicitud no encontrada", 404);
    const result = await prisma.request.updateMany({
      where: { id, beneficiaryId: session.userId, status: "PENDIENTE" }, data: { status: "CANCELADA" },
    });
    if (!result.count) throw new RequestError("Solo puedes cancelar solicitudes pendientes", 409);
    return Response.json({ message: "Solicitud cancelada" });
  } catch (error) { return apiError(error); }
}

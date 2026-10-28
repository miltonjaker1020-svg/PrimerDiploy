import { prisma } from "@/lib/prisma";
import { apiSession, apiError, readBody } from "@/lib/api";
import { donationInput } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await apiSession("DONANTE");
    const { id } = await params;
    const record = await prisma.donation.findFirst({ where: { id, donorId: session.userId } });
    if (!record) throw new RequestError("Donación no encontrada", 404);
    if (record.status !== "PENDIENTE") throw new RequestError("Solo puedes modificar donaciones pendientes", 409);
    const body = await readBody(request);
    let data;
    if (body.status === "CANCELADA") {
      data = { status: "CANCELADA" as const };
    } else {
      if (body.status !== undefined) throw new RequestError("Solo puedes cancelar o editar una donación pendiente", 400);
      data = donationInput(body, record.createdAt);
      if (!await prisma.product.findUnique({ where: { id: data.productId }, select: { id: true } })) throw new RequestError("Producto no encontrado", 404);
    }
    const updated = await prisma.donation.updateMany({ where: { id, donorId: session.userId, status: "PENDIENTE" }, data });
    if (!updated.count) throw new RequestError("Solo puedes modificar donaciones pendientes", 409);
    return Response.json({ message: "Donación actualizada" });
  } catch (error) { return apiError(error); }
}

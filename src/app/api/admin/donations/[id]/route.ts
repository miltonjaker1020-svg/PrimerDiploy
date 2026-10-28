import { prisma } from "@/lib/prisma";
import { apiSession, apiError, readBody } from "@/lib/api";
import { moderationInput } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";
import type { DonationStatus } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await apiSession("ADMINISTRADOR");
    const { id } = await params;
    const input = moderationInput(await readBody(request), ["APROBADA", "RECHAZADA"]);
    if (!await prisma.donation.findUnique({ where: { id }, select: { id: true } })) throw new RequestError("Donación no encontrada", 404);
    const result = await prisma.donation.updateMany({
      where: { id, status: "PENDIENTE" }, data: { status: input.status as DonationStatus, rejectionReason: input.rejectionReason },
    });
    if (!result.count) throw new RequestError("La donación ya tiene un estado final", 409);
    return Response.json({ message: "Donación actualizada" });
  } catch (error) { return apiError(error); }
}

import { prisma } from "@/lib/prisma";
import { apiSession, apiError, readBody } from "@/lib/api";
import { donationInput } from "@/lib/business-rules";
import { RequestError } from "@/lib/request-rules";

export async function POST(request: Request) {
  try {
    const session = await apiSession("DONANTE");
    const now = new Date();
    const input = donationInput(await readBody(request), now);
    if (!await prisma.product.findUnique({ where: { id: input.productId }, select: { id: true } })) throw new RequestError("Producto no encontrado", 404);
    const donation = await prisma.donation.create({ data: { ...input, donorId: session.userId, createdAt: now, status: "PENDIENTE" } });
    return Response.json(donation, { status: 201 });
  } catch (error) { return apiError(error); }
}

export async function GET() {
  try {
    const session = await apiSession("DONANTE");
    const donations = await prisma.donation.findMany({
      where: { donorId: session.userId }, orderBy: { createdAt: "desc" },
      select: {
        id: true, productId: true, quantity: true, status: true, expirationDate: true, createdAt: true, rejectionReason: true,
        product: { select: { name: true, unit: true } },
        requestDonations: { where: { request: { status: "ENTREGADA" } }, select: { quantity: true } },
      },
    });
    return Response.json(donations.map(({ requestDonations, ...donation }) => ({
      ...donation, deliveredQuantity: requestDonations.reduce((sum, allocation) => sum + allocation.quantity, 0),
    })), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}

import { Prisma, type PrismaClient, type RequestStatus } from "@prisma/client";
import { prisma } from "./prisma";
import { getProductAvailableStock } from "./inventory";
import {
  buildReservationPlan, parseCreateRequestInput, WEEKLY_LIMIT,
  RequestError, WEEK_MS,
} from "./request-rules";
import type { CreateRequestInput, RequestDTO, RequestProductOption } from "@/types/requests";

const countedStatuses: RequestStatus[] = ["PENDIENTE", "ENTREGADA"];

export async function getRequestProductOptions(beneficiaryId: string): Promise<RequestProductOption[]> {
  const now = new Date();
  const [products, used] = await Promise.all([
    prisma.product.findMany({ include: { catalog: true }, orderBy: { name: "asc" } }),
    prisma.request.aggregate({
      where: {
        beneficiaryId, status: { in: ["PENDIENTE", "ENTREGADA"] },
        createdAt: { gte: new Date(now.getTime() - WEEK_MS) },
      },
      _sum: { quantity: true },
    }),
  ]);
  const remainingQuota = Math.max(0, WEEKLY_LIMIT - (used._sum.quantity ?? 0));
  return Promise.all(products.map(async (product) => ({
    id: product.id,
    name: product.name,
    catalogName: product.catalog.name,
    unit: product.unit,
    availableStock: await getProductAvailableStock(product.id),
    remainingQuota,
  })));
}

export async function createBeneficiaryRequest(
  beneficiaryId: string,
  input: CreateRequestInput,
  options: { db?: PrismaClient; now?: () => Date } = {},
): Promise<RequestDTO> {
  const { productId, quantity } = parseCreateRequestInput(input);
  const db = options.db ?? prisma;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await db.$transaction(async (tx) => {
        // Re-read time and all constraints inside every serializable attempt.
        const now = options.now?.() ?? new Date();
        const user = await tx.user.findUnique({ where: { id: beneficiaryId }, select: { role: true } });
        if (!user) throw new RequestError("La sesión ya no es válida", 401);
        if (user.role !== "BENEFICIARIO") throw new RequestError("Solo los beneficiarios pueden crear solicitudes", 403);

        const product = await tx.product.findUnique({ where: { id: productId }, select: { id: true } });
        if (!product) throw new RequestError("El producto no existe", 404);

        const used = await tx.request.aggregate({
          where: {
            beneficiaryId, status: { in: countedStatuses },
            createdAt: { gte: new Date(now.getTime() - WEEK_MS) },
          },
          _sum: { quantity: true },
        });
        if ((used._sum.quantity ?? 0) + quantity > WEEKLY_LIMIT) {
          throw new RequestError("El límite es de 20 unidades en total en los últimos 7 días", 409);
        }

        const lots = await tx.donation.findMany({
          where: { productId, status: "APROBADA", expirationDate: { gt: now } },
          include: { requestDonations: { include: { request: { select: { status: true } } } } },
        });
        const allocations = buildReservationPlan(lots, quantity, now);
        const created = await tx.request.create({
          data: {
            beneficiaryId, productId, quantity, status: "PENDIENTE", createdAt: now,
            requestDonations: { create: allocations },
          },
          select: {
            id: true, productId: true, quantity: true, status: true,
            createdAt: true, rejectionReason: true,
            product: { select: { name: true, unit: true } },
          },
        });
        return { ...created, createdAt: created.createdAt.toISOString() };
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2034") throw error;
      if (attempt === 2) {
        throw new RequestError("La disponibilidad cambió durante el envío. Revisa los datos e intenta de nuevo", 409);
      }
    }
  }
  throw new RequestError("No se pudo reservar el inventario", 409);
}

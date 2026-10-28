import { prisma } from "@/lib/prisma";
import { DonationStatus, type PrismaClient } from "@prisma/client";


type StockQueryOptions = { db?: Pick<PrismaClient, "donation">; now?: Date };

export async function getProductsAvailableStock(
  productIds: string[],
  options: StockQueryOptions = {},
): Promise<Map<string, number>> {
  const stock = new Map(productIds.map((id) => [id, 0]));
  if (productIds.length === 0) return stock;
  const db = options.db ?? prisma;
  const donations = await db.donation.findMany({
    where: {
      productId: { in: productIds },
      status: DonationStatus.APROBADA,
      expirationDate: { gt: options.now ?? new Date() },
    },
    select: {
      productId: true,
      quantity: true,
      requestDonations: {
        select: { quantity: true, request: { select: { status: true } } },
      },
    },
  });
  for (const donation of donations) {
    const committed = donation.requestDonations.reduce((sum, reservation) =>
      reservation.request.status === "CANCELADA" || reservation.request.status === "RECHAZADA"
        ? sum : sum + reservation.quantity, 0);
    stock.set(donation.productId, (stock.get(donation.productId) ?? 0) + Math.max(0, donation.quantity - committed));
  }
  return stock;
}

export async function getProductAvailableStock(productId: string, options: StockQueryOptions = {}): Promise<number> {
  return (await getProductsAvailableStock([productId], options)).get(productId) ?? 0;
}


export async function getInventorySummary() {
  const now = new Date();
  const in7Days = new Date();
  in7Days.setDate(now.getDate() + 7);

  const products = await prisma.product.findMany({
    include: {
      catalog: true,
    },
  });

  const summary = [];

  for (const product of products) {
    const availableStock = await getProductAvailableStock(product.id);

    const expiringSoonDonations = await prisma.donation.findMany({
      where: {
        productId: product.id,
        status: DonationStatus.APROBADA,
        expirationDate: {
          gt: now,
          lte: in7Days,
        },
      },
      include: {
        requestDonations: {
          include: { request: true },
        },
      },
    });

    let expiringSoonStock = 0;
    for (const donation of expiringSoonDonations) {
      const committed = donation.requestDonations.reduce((sum, rd) => {
        if (rd.request.status !== 'CANCELADA' && rd.request.status !== 'RECHAZADA') {
          return sum + rd.quantity;
        }
        return sum;
      }, 0);
      expiringSoonStock += Math.max(0, donation.quantity - committed);
    }

    summary.push({
      productId: product.id,
      productName: product.name,
      catalogName: product.catalog.name,
      unit: product.unit,
      availableStock,
      expiringSoonStock,
    });
  }

  return summary;
}

import type { CreateRequestInput } from "@/types/requests";

export const WEEKLY_LIMIT = 20;
export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export class RequestError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "RequestError";
  }
}

export function parseCreateRequestInput(body: unknown): CreateRequestInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new RequestError("Solicitud inválida", 400);
  }
  const { productId, quantity } = body as Record<string, unknown>;
  if (typeof productId !== "string" || !productId.trim()) {
    throw new RequestError("Selecciona un producto", 400);
  }
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0 || quantity > 2147483647) {
    throw new RequestError("La cantidad debe ser un entero positivo válido", 400);
  }
  return { productId: productId.trim(), quantity };
}

interface ReservationLot {
  id: string;
  quantity: number;
  status: string;
  expirationDate: Date;
  requestDonations: { quantity: number; request: { status: string } }[];
}

export function buildReservationPlan(lots: ReservationLot[], quantity: number, now: Date) {
  const reservations: { donationId: string; quantity: number }[] = [];
  let remaining = quantity;
  const eligible = lots
    .filter((lot) => lot.status === "APROBADA" && lot.expirationDate > now)
    .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime() || a.id.localeCompare(b.id));

  for (const lot of eligible) {
    const committed = lot.requestDonations.reduce((sum, reservation) =>
      ["CANCELADA", "RECHAZADA"].includes(reservation.request.status) ? sum : sum + reservation.quantity, 0);
    const allocated = Math.min(remaining, Math.max(0, lot.quantity - committed));
    if (allocated > 0) reservations.push({ donationId: lot.id, quantity: allocated });
    remaining -= allocated;
    if (remaining === 0) return reservations;
  }
  throw new RequestError("El stock disponible ha cambiado o no alcanza para esta cantidad", 409);
}

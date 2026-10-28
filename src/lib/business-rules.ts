import { RequestError } from "./request-rules";

export function requiredText(value: unknown, label: string, max = 200) {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new RequestError(`${label}: escribe un valor de hasta ${max} caracteres`, 400);
  }
  return value.trim();
}

function optionalText(value: unknown, label: string, max = 1000) {
  return value === undefined || value === null || value === "" ? null : requiredText(value, label, max);
}

export function donationInput(body: Record<string, unknown>, registeredAt: Date) {
  const productId = requiredText(body.productId, "Producto");
  const quantity = body.quantity;
  if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity <= 0 || quantity > 2147483647) {
    throw new RequestError("La cantidad debe ser un entero positivo", 400);
  }
  const expirationDate = new Date(typeof body.expirationDate === "string" ? body.expirationDate : "");
  if (!Number.isFinite(expirationDate.getTime()) || expirationDate.getTime() < registeredAt.getTime() + 3 * 86400000) {
    throw new RequestError("El vencimiento debe ser al menos 3 días posterior al registro", 400);
  }
  return { productId, quantity, expirationDate };
}

export function moderationInput(body: Record<string, unknown>, allowed: string[]) {
  if (typeof body.status !== "string" || !allowed.includes(body.status)) {
    throw new RequestError("Cambio de estado no permitido", 400);
  }
  const rejectionReason = body.status === "RECHAZADA" ? requiredText(body.rejectionReason, "Motivo de rechazo", 1000) : null;
  return { status: body.status, rejectionReason };
}

export function productInput(body: Record<string, unknown>) {
  return {
    name: requiredText(body.name, "Nombre"),
    catalogId: requiredText(body.catalogId, "Categoría"),
    description: optionalText(body.description, "Descripción"),
    unit: optionalText(body.unit, "Unidad", 50),
  };
}

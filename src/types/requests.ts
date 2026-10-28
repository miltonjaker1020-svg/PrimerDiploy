import type { RequestStatus } from "@prisma/client";

export interface CreateRequestInput {
  productId: string;
  quantity: number;
}

export interface RequestProductOption {
  id: string;
  name: string;
  catalogName: string;
  unit: string | null;
  availableStock: number;
  remainingQuota: number;
}

export interface RequestDTO {
  id: string;
  productId: string;
  quantity: number;
  status: RequestStatus;
  createdAt: string;
  rejectionReason: string | null;
  product: { name: string; unit: string | null };
}

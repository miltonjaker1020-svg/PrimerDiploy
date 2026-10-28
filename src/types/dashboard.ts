import type { DonationStatus, RequestStatus } from "@prisma/client";

export interface DashboardRecord {
  id: string;
  productId?: string;
  quantity: number;
  status: DonationStatus | RequestStatus;
  createdAt: string;
  rejectionReason: string | null;
  product: { name: string; unit: string | null };
  expirationDate?: string;
  deliveredQuantity?: number;
}

export interface AdminRecord extends DashboardRecord {
  donor?: { email: string };
  beneficiary?: { email: string };
}

export interface Category { id: string; name: string; description: string | null }
export interface InventoryRow {
  productId: string; productName: string; catalogName: string; unit: string | null;
  availableStock: number; expiringSoonStock: number;
}

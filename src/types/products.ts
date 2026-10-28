export interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  unit: string | null;
  catalog: { id: string; name: string };
  availableStock: number;
}

export interface ProductFilters {
  search?: string;
  available?: boolean;
}


export interface InventoryItem {
  id: number;
  brand: string;
  mrp: number;
  expiryDate: string;
  size: string;
  quantity: number;
  dateAdded: string;
  imageUrl?: string;
}

export interface Sale {
  id: number;
  date: string;
  items: InventoryItem[];
  total: number;
}

export enum UserRole {
  Retailer = 'Retailer',
  Distributor = 'Distributor',
  Admin = 'Admin',
}

export interface ProductDetails {
    brand: string;
    mrp: number;
    expiryDate: string; // YYYY-MM-DD
    size: string;
}

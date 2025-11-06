export interface InventoryItem {
  id?: number;
  userId: string; // To associate item with a user/store
  brand: string;
  mrp: number;
  expiryDate: string;
  size: string;
  quantity: number;
  dateAdded: string;
  imageUrl?: string;
}

export interface Sale {
  id?: number;
  userId: string; // To associate sale with a user/store
  date: string;
  items: Omit<InventoryItem, 'userId'>[]; // Items in a sale don't need the userId again
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

export interface User {
    id: string;
    email: string;
    storeName?: string;
    role?: UserRole;
}
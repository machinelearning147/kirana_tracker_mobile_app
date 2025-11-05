
import { InventoryItem, Sale } from "./types";

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: 1, brand: 'Parle-G', mrp: 5, expiryDate: '2025-12-31', size: '50g', quantity: 100, dateAdded: '2024-07-01', imageUrl: 'https://picsum.photos/seed/parle/200' },
  { id: 2, brand: 'Amul Milk', mrp: 28, expiryDate: '2024-08-15', size: '500ml', quantity: 40, dateAdded: '2024-07-10', imageUrl: 'https://picsum.photos/seed/amul/200' },
  { id: 3, brand: 'Lays Chips', mrp: 20, expiryDate: '2025-01-31', size: '52g', quantity: 75, dateAdded: '2024-07-05', imageUrl: 'https://picsum.photos/seed/lays/200' },
  { id: 4, brand: 'Tata Salt', mrp: 25, expiryDate: '2026-06-30', size: '1kg', quantity: 60, dateAdded: '2024-06-20', imageUrl: 'https://picsum.photos/seed/tata/200' },
  { id: 5, brand: 'Maggi Noodles', mrp: 12, expiryDate: '2025-03-31', size: '70g', quantity: 120, dateAdded: '2024-07-08', imageUrl: 'https://picsum.photos/seed/maggi/200' },
  { id: 6, brand: 'Coca-Cola', mrp: 40, expiryDate: '2025-02-28', size: '750ml', quantity: 4, dateAdded: '2024-07-12', imageUrl: 'https://picsum.photos/seed/coke/200' },
  { id: 7, brand: 'Colgate Toothpaste', mrp: 90, expiryDate: '2026-01-01', size: '200g', quantity: 30, dateAdded: '2024-06-15', imageUrl: 'https://picsum.photos/seed/colgate/200' },
];

export const MOCK_SALES: Sale[] = [
    {
        id: 101,
        date: '2024-07-20T10:30:00Z',
        items: [
            { id: 1, brand: 'Parle-G', mrp: 5, expiryDate: '2025-12-31', size: '50g', quantity: 5, dateAdded: '2024-07-01' },
            { id: 3, brand: 'Lays Chips', mrp: 20, expiryDate: '2025-01-31', size: '52g', quantity: 2, dateAdded: '2024-07-05' },
        ],
        total: 65,
    },
    {
        id: 102,
        date: '2024-07-20T12:15:00Z',
        items: [
            { id: 2, brand: 'Amul Milk', mrp: 28, expiryDate: '2024-08-15', size: '500ml', quantity: 2, dateAdded: '2024-07-10' },
            { id: 5, brand: 'Maggi Noodles', mrp: 12, expiryDate: '2025-03-31', size: '70g', quantity: 4, dateAdded: '2024-07-08' },
        ],
        total: 104,
    },
    {
        id: 103,
        date: '2024-07-19T18:00:00Z',
        items: [
            { id: 4, brand: 'Tata Salt', mrp: 25, expiryDate: '2026-06-30', size: '1kg', quantity: 1, dateAdded: '2024-06-20' },
            { id: 6, brand: 'Coca-Cola', mrp: 40, expiryDate: '2025-02-28', size: '750ml', quantity: 1, dateAdded: '2024-07-12' },
        ],
        total: 65,
    }
];

import Dexie, { Table } from 'https://aistudiocdn.com/dexie@^4.0.0';
import { InventoryItem, Sale, User, UserRole } from '../types';

// Define the database class and its schema
export class KiranaTrackerDB extends Dexie {
  inventory!: Table<InventoryItem>;
  sales!: Table<Sale>;
  users!: Table<User, string>; // The key is of type string (email)

  constructor() {
    super('KiranaTrackerDB');
    // FIX: Cast 'this' to Dexie to resolve a potential typing issue where
    // the 'version' method is not found on the extended class instance.
    (this as Dexie).version(2).stores({
      inventory: '++id, userId, dateAdded, &[userId+brand+size]',
      sales: '++id, userId, date',
      users: 'email, storeName, role', // 'email' is the primary key
    }).upgrade(tx => {
        // Sample migration logic in case you need it later.
        // For version 2, we added the userId index. If there's old data,
        // it would need to be migrated. We'll assume a fresh start.
        console.log("Upgrading database to version 2");
    });
  }

  // Method to populate the database with mock data if it's empty
  async populate() {
      const userCount = await this.users.count();
      if (userCount > 0) return; // DB has been seeded

      console.log('Database is empty, populating with mock data for multiple stores...');

      const userStore1: User = { id: 'store1@test.com', email: 'store1@test.com', storeName: 'Apna Kirana', role: UserRole.Retailer };
      const userStore2: User = { id: 'store2@test.com', email: 'store2@test.com', storeName: 'Best Mart', role: UserRole.Retailer };
      const userAdmin: User = { id: 'admin@test.com', email: 'admin@test.com', storeName: 'Kirana Corp', role: UserRole.Admin };

      await this.users.bulkAdd([userStore1, userStore2, userAdmin]);

      const inventoryStore1: Omit<InventoryItem, 'id'>[] = [
        { userId: userStore1.id, brand: 'Parle-G', mrp: 5, expiryDate: '2025-12-31', size: '50g', quantity: 100, dateAdded: '2024-07-01', imageUrl: 'https://picsum.photos/seed/parle/200' },
        { userId: userStore1.id, brand: 'Amul Milk', mrp: 28, expiryDate: '2024-08-15', size: '500ml', quantity: 40, dateAdded: '2024-07-10', imageUrl: 'https://picsum.photos/seed/amul/200' },
        { userId: userStore1.id, brand: 'Lays Chips', mrp: 20, expiryDate: '2025-01-31', size: '52g', quantity: 75, dateAdded: '2024-07-05', imageUrl: 'https://picsum.photos/seed/lays/200' },
      ];

      const inventoryStore2: Omit<InventoryItem, 'id'>[] = [
        { userId: userStore2.id, brand: 'Tata Salt', mrp: 25, expiryDate: '2026-06-30', size: '1kg', quantity: 60, dateAdded: '2024-06-20', imageUrl: 'https://picsum.photos/seed/tata/200' },
        { userId: userStore2.id, brand: 'Maggi Noodles', mrp: 12, expiryDate: '2025-03-31', size: '70g', quantity: 120, dateAdded: '2024-07-08', imageUrl: 'https://picsum.photos/seed/maggi/200' },
        { userId: userStore2.id, brand: 'Coca-Cola', mrp: 40, expiryDate: '2025-02-28', size: '750ml', quantity: 4, dateAdded: '2024-07-12', imageUrl: 'https://picsum.photos/seed/coke/200' },
      ];
      
      await this.inventory.bulkAdd(inventoryStore1 as InventoryItem[]);
      await this.inventory.bulkAdd(inventoryStore2 as InventoryItem[]);
      
      const salesStore1: Omit<Sale, 'id'>[] = [{
          userId: userStore1.id,
          date: '2024-07-20T10:30:00Z',
          items: [
              { brand: 'Parle-G', mrp: 5, expiryDate: '2025-12-31', size: '50g', quantity: 5, dateAdded: '2024-07-01' },
          ],
          total: 25,
      }];
       const salesStore2: Omit<Sale, 'id'>[] = [{
          userId: userStore2.id,
          date: '2024-07-21T11:00:00Z',
          items: [
              { brand: 'Maggi Noodles', mrp: 12, expiryDate: '2025-03-31', size: '70g', quantity: 10, dateAdded: '2024-07-08' },
          ],
          total: 120,
      }];

      await this.sales.bulkAdd(salesStore1 as Sale[]);
      await this.sales.bulkAdd(salesStore2 as Sale[]);
  }
}

// Create a singleton instance of the database
export const db = new KiranaTrackerDB();

// Populate the DB when the app loads
db.populate().catch(err => {
  console.error("Failed to populate database:", err);
});
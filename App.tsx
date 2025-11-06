import React, { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'https://aistudiocdn.com/dexie-react-hooks@^1.1.7';
import { db } from './services/db';
import { InventoryItem, Sale, User, UserRole } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Forecast from './components/Forecast';
import Replenish from './components/Replenish';
import AddItemModal from './components/AddItemModal';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import * as authService from './services/authService';
import StoreDetailView from './components/StoreSales';

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"/><path d="M12 15.5a10.5 10.5 0 0 0-5.875 1.975l-1.5 1.125a1 1 0 0 0 .625 1.8h13.5a1 1 0 0 0 .625-1.8l-1.5-1.125A10.5 10.5 0 0 0 12 15.5Z"/><path d="m21 2-9.6 9.6"/><path d="m15 2 6 6"/></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;


type View = 'dashboard' | 'inventory' | 'billing' | 'forecast' | 'replenish';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState<User | null>(null);

  // --- Reactive Data from IndexedDB ---
  const users = useLiveQuery(() => db.users.toArray(), []);

  const inventory = useLiveQuery(async () => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.Admin) {
      const allItems = await db.inventory.toArray();
      return allItems.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }
    // For retailers, filter by userId, then sort client-side.
    const items = await db.inventory.where({ userId: currentUser.id }).toArray();
    return items.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  }, [currentUser?.id, currentUser?.role]);
  
  const sales = useLiveQuery(async () => {
    if (!currentUser) return [];
    if (currentUser.role === UserRole.Admin) {
       const allSales = await db.sales.toArray();
       return allSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
     // For retailers, filter by userId, then sort client-side.
    const items = await db.sales.where({ userId: currentUser.id }).toArray();
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [currentUser?.id, currentUser?.role]);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      if (!user.storeName || !user.role) {
        setNeedsOnboarding(true);
      }
    }
    setIsAppLoading(false);
  }, []);

  const lowStockItems = useMemo(() => (inventory ?? []).filter(item => item.quantity <= 5), [inventory]);
  const expiringSoonItems = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(new Date().setDate(today.getDate() + 30));
    return (inventory ?? []).filter(item => {
        try {
            const expiryDate = new Date(item.expiryDate);
            return expiryDate <= thirtyDaysFromNow;
        } catch {
            return false;
        }
    });
  }, [inventory]);
  
  const handleSetView = (view: View) => {
    setCurrentView(view);
    setSelectedStore(null);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    if (!user.storeName || !user.role) {
      setNeedsOnboarding(true);
    }
  };
  
  const handleOnboardingComplete = (user: User) => {
    setCurrentUser(user);
    setNeedsOnboarding(false);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setCurrentView('dashboard');
  };

  const handleAddItem = async (newItem: Omit<InventoryItem, 'id' | 'dateAdded' | 'userId'>) => {
    if (!currentUser) return;
    const userId = currentUser.id;

    const existingItem = await db.inventory.where({
        brand: newItem.brand, 
        size: newItem.size, 
        userId: userId
    }).first();
    
    if (existingItem && existingItem.id) {
      await db.inventory.update(existingItem.id, {
        quantity: existingItem.quantity + newItem.quantity,
        expiryDate: newItem.expiryDate,
        mrp: newItem.mrp,
        imageUrl: newItem.imageUrl || existingItem.imageUrl,
        dateAdded: new Date().toISOString().split('T')[0],
      });
    } else {
      const newInventoryItem: Omit<InventoryItem, 'id'> = {
        ...newItem,
        userId: userId,
        dateAdded: new Date().toISOString().split('T')[0],
        imageUrl: newItem.imageUrl || `https://picsum.photos/seed/${newItem.brand}/200`,
      };
      await db.inventory.add(newInventoryItem as InventoryItem);
    }
    setIsModalOpen(false);
    handleSetView('inventory');
  };

  const handleCreateSale = async (itemsSold: { id: number; quantity: number }[]) => {
    if (!inventory || !currentUser) return;
    const userId = currentUser.id;

    const saleItems: Omit<InventoryItem, 'userId'>[] = [];
    let totalSaleAmount = 0;
    const inventoryUpdatePromises: Promise<any>[] = [];

    itemsSold.forEach(itemSold => {
        const inventoryItem = inventory.find(i => i.id === itemSold.id);
        if (inventoryItem) {
            const { userId, ...itemRecord } = inventoryItem;
            const saleItemRecord = { ...itemRecord, quantity: itemSold.quantity };
            saleItems.push(saleItemRecord);
            totalSaleAmount += saleItemRecord.mrp * saleItemRecord.quantity;

            const updatePromise = db.inventory.update(itemSold.id, {
                quantity: inventoryItem.quantity - itemSold.quantity
            });
            inventoryUpdatePromises.push(updatePromise);
        }
    });
    
    const newSale: Omit<Sale, 'id'> = {
      userId: userId,
      date: new Date().toISOString(),
      items: saleItems,
      total: totalSaleAmount,
    };

    await Promise.all([
        db.sales.add(newSale as Sale),
        ...inventoryUpdatePromises
    ]);
    handleSetView('dashboard');
  };

  const handleUpdateInventoryItem = async (id: number, updates: Partial<InventoryItem>) => {
    await db.inventory.update(id, updates);
  };

  const handleDeleteInventoryItem = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
        await db.inventory.delete(id);
    }
  };

  const handleBulkUpdateInventoryItems = async (itemIds: number[], newQuantity: number) => {
    if (newQuantity < 0) return;
    const updates = itemIds.map(id => db.inventory.update(id, { quantity: newQuantity }));
    await Promise.all(updates);
  };
  
  const renderView = () => {
    if (!currentUser?.role || inventory === undefined || sales === undefined) {
      return <div className="flex justify-center items-center p-8">Loading data...</div>;
    }

    if (currentUser.role === UserRole.Admin && selectedStore) {
        return <StoreDetailView 
            store={selectedStore} 
            sales={sales.filter(s => s.userId === selectedStore.id)}
            inventory={inventory.filter(i => i.userId === selectedStore.id)}
            onBack={() => setSelectedStore(null)}
        />
    }

    switch (currentView) {
      case 'inventory':
        return <Inventory 
                  inventory={inventory} 
                  onUpdateItem={handleUpdateInventoryItem}
                  onDeleteItem={handleDeleteInventoryItem}
                  onBulkUpdateItems={handleBulkUpdateInventoryItems}
                  role={currentUser.role}
                  users={users ?? []}
                />;
      case 'billing':
        return <Billing inventory={inventory} createSale={handleCreateSale} />;
      case 'forecast':
        return <Forecast inventory={inventory} sales={sales} />;
      case 'replenish':
        return <Replenish lowStockItems={lowStockItems} />;
      case 'dashboard':
      default:
        return <Dashboard 
                  inventory={inventory} 
                  sales={sales} 
                  users={users ?? []}
                  role={currentUser.role} 
                  lowStockItemsCount={lowStockItems.length}
                  expiringSoonItemsCount={expiringSoonItems.length}
                  onSelectStore={setSelectedStore}
                  />;
    }
  };

  const NavItem: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => handleSetView(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${
        currentView === view ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
  
  if (isAppLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  if (needsOnboarding) {
    return <Onboarding user={currentUser} onComplete={handleOnboardingComplete} />;
  }


  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
       <header className="bg-white shadow-sm sticky top-0 z-10 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">{currentUser?.storeName || 'Kirana Tracker'}</h1>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-red-500 transition-colors"
                  aria-label="Logout"
                >
                  <LogOutIcon />
                  <span>Logout</span>
                </button>
            </div>
        </header>

      <main className="flex-grow p-4 md:p-6 mb-20">
        <div className="max-w-7xl mx-auto">
          {renderView()}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-20 shadow-[-2px_0_10px_rgba(0,0,0,0.1)]">
        <NavItem view="dashboard" label="Dashboard" icon={<HomeIcon />} />
        <NavItem view="inventory" label="Inventory" icon={<PackageIcon />} />
        
        <button 
          onClick={() => {
              setIsModalOpen(true);
              setSelectedStore(null);
          }}
          className="w-16 h-16 -mt-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transform hover:scale-105 transition-transform duration-200"
          aria-label="Add New Item"
        >
          <PlusIcon />
        </button>

        <NavItem view="billing" label="Billing" icon={<ShoppingCartIcon />} />
        <NavItem view="replenish" label="Reorder" icon={
             <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/></svg>
                {lowStockItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">{lowStockItems.length}</span>
                )}
            </div>
        } />
      </div>

      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddItem={handleAddItem}
      />
    </div>
  );
};

export default App;

import React, { useState, useMemo } from 'react';
import { InventoryItem, Sale, UserRole } from './types';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Billing from './components/Billing';
import Forecast from './components/Forecast';
import Replenish from './components/Replenish';
import AddItemModal from './components/AddItemModal';
import { MOCK_INVENTORY, MOCK_SALES } from './constants';

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16.5 9.4a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0Z"/><path d="M12 15.5a10.5 10.5 0 0 0-5.875 1.975l-1.5 1.125a1 1 0 0 0 .625 1.8h13.5a1 1 0 0 0 .625-1.8l-1.5-1.125A10.5 10.5 0 0 0 12 15.5Z"/><path d="m21 2-9.6 9.6"/><path d="m15 2 6 6"/></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.16"/></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>;

type View = 'dashboard' | 'inventory' | 'billing' | 'forecast' | 'replenish';

const App: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [role, setRole] = useState<UserRole>(UserRole.Retailer);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lowStockItems = useMemo(() => inventory.filter(item => item.quantity <= 5), [inventory]);
  const expiringSoonItems = useMemo(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.setDate(today.getDate() + 30));
    return inventory.filter(item => {
        try {
            const expiryDate = new Date(item.expiryDate);
            return expiryDate <= thirtyDaysFromNow;
        } catch {
            return false;
        }
    });
  }, [inventory]);

  const handleAddItem = (newItem: Omit<InventoryItem, 'id' | 'dateAdded'>) => {
    const existingItemIndex = inventory.findIndex(item => item.brand === newItem.brand && item.size === newItem.size);
    if (existingItemIndex !== -1) {
      const updatedInventory = [...inventory];
      updatedInventory[existingItemIndex].quantity += newItem.quantity;
      updatedInventory[existingItemIndex].expiryDate = newItem.expiryDate;
      updatedInventory[existingItemIndex].mrp = newItem.mrp;
      setInventory(updatedInventory);
    } else {
      const newInventoryItem: InventoryItem = {
        ...newItem,
        id: Date.now(),
        dateAdded: new Date().toISOString().split('T')[0],
      };
      setInventory(prev => [...prev, newInventoryItem]);
    }
    setIsModalOpen(false);
    setCurrentView('inventory');
  };

  const handleCreateSale = (itemsSold: { id: number; quantity: number }[]) => {
    const newSale: Sale = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: [],
      total: 0,
    };
    
    let totalSaleAmount = 0;
    const updatedInventory = inventory.map(inventoryItem => {
      const itemInSale = itemsSold.find(sold => sold.id === inventoryItem.id);
      if (itemInSale) {
        inventoryItem.quantity -= itemInSale.quantity;
        const saleItem = { ...inventoryItem, quantity: itemInSale.quantity };
        newSale.items.push(saleItem);
        totalSaleAmount += saleItem.mrp * saleItem.quantity;
      }
      return inventoryItem;
    });

    newSale.total = totalSaleAmount;
    setInventory(updatedInventory);
    setSales(prev => [newSale, ...prev]);
    setCurrentView('dashboard');
  };
  
  const renderView = () => {
    switch (currentView) {
      case 'inventory':
        return <Inventory inventory={inventory} setInventory={setInventory} />;
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
                  role={role} 
                  lowStockItemsCount={lowStockItems.length}
                  expiringSoonItemsCount={expiringSoonItems.length}
                  />;
    }
  };

  const NavItem: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-colors duration-200 ${
        currentView === view ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
       <header className="bg-white shadow-sm sticky top-0 z-10 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold text-gray-800">Kirana Tracker</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Role:</span>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="p-1 border rounded-md text-sm bg-gray-100 text-gray-800 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value={UserRole.Retailer}>Retailer</option>
                        <option value={UserRole.Distributor}>Distributor</option>
                        <option value={UserRole.Admin}>Admin</option>
                    </select>
                </div>
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
          onClick={() => setIsModalOpen(true)}
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

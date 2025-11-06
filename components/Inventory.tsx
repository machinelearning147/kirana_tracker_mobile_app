
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { InventoryItem, User, UserRole } from '../types';

interface InventoryProps {
  inventory: InventoryItem[];
  onUpdateItem: (id: number, updates: Partial<InventoryItem>) => void;
  onDeleteItem: (id: number) => void;
  onBulkUpdateItems: (itemIds: number[], newQuantity: number) => void;
  role: UserRole;
  users: User[];
}

const Inventory: React.FC<InventoryProps> = ({ inventory, onUpdateItem, onDeleteItem, onBulkUpdateItems, role, users }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [bulkQuantity, setBulkQuantity] = useState('');
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
  
  const userMap = useMemo(() => new Map(users.map(u => [u.id, u.storeName])), [users]);

  const filteredInventory = inventory.filter(item => {
      const storeName = userMap.get(item.userId) || '';
      return item.brand.toLowerCase().includes(searchTerm.toLowerCase()) || storeName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate =
        selectedItems.size > 0 && selectedItems.size < filteredInventory.length;
    }
  }, [selectedItems, filteredInventory.length]);

  const handleQuantityChange = (id: number, currentQuantity: number, delta: number) => {
    const newQuantity = Math.max(0, currentQuantity + delta);
    onUpdateItem(id, { quantity: newQuantity });
  };

  const handleQuantityInputChange = (id: number, value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity)) {
      onUpdateItem(id, { quantity: Math.max(0, newQuantity) });
    } else if (value === '') {
      onUpdateItem(id, { quantity: 0 });
    }
  };

  const handleDelete = (id: number) => {
    onDeleteItem(id);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedItems(new Set(filteredInventory.map(item => item.id!)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: number) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleApplyBulkUpdate = () => {
    const quantity = parseInt(bulkQuantity, 10);
    if (selectedItems.size > 0 && !isNaN(quantity) && quantity >= 0) {
        if (window.confirm(`Are you sure you want to set the quantity to ${quantity} for ${selectedItems.size} selected items?`)) {
            onBulkUpdateItems(Array.from(selectedItems), quantity);
            setSelectedItems(new Set());
            setBulkQuantity('');
        }
    }
  };

  const getExpiryStatusColor = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 font-bold'; // Expired
    if (diffDays <= 30) return 'text-yellow-600 font-semibold'; // Expiring soon
    return 'text-green-600'; // Good
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Inventory Management</h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <input
            type="text"
            placeholder={role === UserRole.Admin ? "Search by brand or store..." : "Search by brand..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {selectedItems.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 flex flex-col sm:flex-row items-center gap-4">
            <p className="text-sm font-medium text-blue-800 flex-grow">{selectedItems.size} item(s) selected</p>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={bulkQuantity}
                    onChange={(e) => setBulkQuantity(e.target.value)}
                    placeholder="Set quantity"
                    className="w-32 text-center border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                />
                <button
                    onClick={handleApplyBulkUpdate}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-semibold"
                >
                    Update Selected
                </button>
            </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">
                <input 
                  ref={selectAllCheckboxRef}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  onChange={handleSelectAll}
                  checked={filteredInventory.length > 0 && selectedItems.size === filteredInventory.length}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              {role === UserRole.Admin && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInventory.filter(item => item.id != null).map(item => (
              <tr key={item.id} className={`hover:bg-gray-50 ${selectedItems.has(item.id!) ? 'bg-blue-50' : ''}`}>
                <td className="p-4">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    checked={selectedItems.has(item.id!)}
                    onChange={() => handleSelectItem(item.id!)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full object-cover" src={item.imageUrl} alt={item.brand} />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{item.brand}</div>
                      <div className="text-sm text-gray-500">{item.size}</div>
                    </div>
                  </div>
                </td>
                 {role === UserRole.Admin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{userMap.get(item.userId) || 'Unknown'}</td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{item.mrp.toFixed(2)}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${getExpiryStatusColor(item.expiryDate)}`}>{item.expiryDate}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => handleQuantityChange(item.id!, item.quantity, -1)} className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200">-</button>
                    <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityInputChange(item.id!, e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded-md shadow-sm p-1 text-sm"
                        aria-label={`Quantity for ${item.brand}`}
                    />
                    <button onClick={() => handleQuantityChange(item.id!, item.quantity, 1)} className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200">+</button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(item.id!)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
         {filteredInventory.length === 0 && <p className="text-center text-gray-500 py-8">No inventory items found.</p>}
      </div>
    </div>
  );
};

export default Inventory;

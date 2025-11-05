
import React, { useState, useEffect } from 'react';
import { InventoryItem } from '../types';
import { generateReplenishmentOrder } from '../services/geminiService';

interface ReplenishProps {
  lowStockItems: InventoryItem[];
}

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>;

const Replenish: React.FC<ReplenishProps> = ({ lowStockItems }) => {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [purchaseOrder, setPurchaseOrder] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Pre-select all low stock items by default
    setSelectedItems(new Set(lowStockItems.map(item => item.id)));
  }, [lowStockItems]);

  const handleToggleItem = (id: number) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };
  
  const handleGenerateOrder = async () => {
    if (selectedItems.size === 0) return;
    setIsLoading(true);
    setPurchaseOrder('');
    const itemsToOrder = lowStockItems.filter(item => selectedItems.has(item.id));
    try {
        const result = await generateReplenishmentOrder(itemsToOrder);
        setPurchaseOrder(result);
    } catch (error) {
        console.error("Failed to generate purchase order:", error);
        setPurchaseOrder("Error: Could not generate purchase order.");
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Replenishment Request</h2>
            <p className="text-sm text-gray-600 mb-4">Select items that are low in stock to generate a purchase order.</p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {lowStockItems.length > 0 ? lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedItems.has(item.id)}
                                onChange={() => handleToggleItem(item.id)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{item.brand}</p>
                                <p className="text-xs text-gray-500">{item.size}</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-red-500">Stock: {item.quantity}</span>
                    </div>
                )) : <p className="text-gray-500 text-center py-4">No items are low on stock.</p>}
            </div>

            <button
                onClick={handleGenerateOrder}
                disabled={isLoading || selectedItems.size === 0}
                className="w-full mt-4 flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
                {isLoading ? <><Spinner /> Generating...</> : `Generate Order for ${selectedItems.size} Items`}
            </button>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Generated Purchase Order</h3>
            <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md h-[calc(100%-60px)] overflow-y-auto">
                {purchaseOrder ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm">{purchaseOrder}</pre>
                ) : (
                    <p className="text-gray-500">Your purchase order will appear here...</p>
                )}
            </div>
             <button
                onClick={() => navigator.clipboard.writeText(purchaseOrder)}
                disabled={!purchaseOrder}
                className="mt-2 text-sm text-blue-600 hover:underline disabled:text-gray-400"
            >
                Copy to Clipboard
            </button>
        </div>
    </div>
  );
};

export default Replenish;

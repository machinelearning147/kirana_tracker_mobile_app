
import React, { useState } from 'react';
import { Sale, User, InventoryItem } from '../types';

interface StoreDetailViewProps {
    store: User;
    sales: Sale[];
    inventory: InventoryItem[];
    onBack: () => void;
}

type ActiveTab = 'sales' | 'inventory';

const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>;

const getExpiryStatusColor = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'text-red-600 font-bold'; // Expired
    if (diffDays <= 30) return 'text-yellow-600 font-semibold'; // Expiring soon
    return 'text-green-600'; // Good
};

const StoreDetailView: React.FC<StoreDetailViewProps> = ({ store, sales, inventory, onBack }) => {
    const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTab>('sales');

    const toggleSaleDetails = (saleId: number) => {
        setExpandedSaleId(expandedSaleId === saleId ? null : saleId);
    };

    const SalesTab = () => (
         <div className="space-y-3">
            {sales.length > 0 ? sales.filter(sale => sale.id != null).map(sale => (
                <div key={sale.id} className="border border-gray-200 rounded-lg">
                    <div 
                        className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                        onClick={() => toggleSaleDetails(sale.id!)}
                    >
                        <div>
                            <p className="font-semibold text-gray-700">Invoice ID: #{sale.id}</p>
                            <p className="text-sm text-gray-500">
                                Date: {new Date(sale.date).toLocaleString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-blue-600">₹{sale.total.toFixed(2)}</p>
                            <p className="text-xs text-gray-500">{sale.items.length} item(s)</p>
                        </div>
                    </div>

                    {expandedSaleId === sale.id && (
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                            <h4 className="font-semibold text-md mb-2">Items Sold:</h4>
                            <ul className="divide-y divide-gray-200">
                                {sale.items.map((item, index) => (
                                    <li key={index} className="flex justify-between items-center py-2">
                                        <div>
                                            <p className="text-sm font-medium">{item.brand} ({item.size})</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm">
                                            ₹{(item.mrp * item.quantity).toFixed(2)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )) : (
                <p className="text-center text-gray-500 py-8">No sales recorded for this store yet.</p>
            )}
        </div>
    );

    const InventoryTab = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRP</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {inventory.filter(item => item.id != null).map(item => (
                    <tr key={item.id} className="hover:bg-gray-50">
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₹{item.mrp.toFixed(2)}</td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${getExpiryStatusColor(item.expiryDate)}`}>{item.expiryDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold">{item.quantity}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
            {inventory.length === 0 && <p className="text-center text-gray-500 py-8">No inventory found for this store.</p>}
        </div>
    );


    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100 mr-4">
                    <ArrowLeftIcon />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Store Details: {store.storeName}</h2>
                    <p className="text-sm text-gray-500">{store.email}</p>
                </div>
            </div>

            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button
                        onClick={() => setActiveTab('sales')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'sales' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Sales History
                    </button>
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'inventory' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                        Current Inventory
                    </button>
                </nav>
            </div>

            <div>
                {activeTab === 'sales' ? <SalesTab /> : <InventoryTab />}
            </div>
            
        </div>
    );
};

export default StoreDetailView;

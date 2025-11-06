import React from 'react';
import { InventoryItem, Sale, User, UserRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  inventory: InventoryItem[];
  sales: Sale[];
  users: User[];
  role: UserRole;
  lowStockItemsCount: number;
  expiringSoonItemsCount: number;
  onSelectStore?: (store: User) => void;
}

const InfoCard: React.FC<{ title: string; value: string | number; subValue?: string; icon: React.ReactNode; color: string }> = ({ title, value, subValue, icon, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            {subValue && <p className="text-xs text-gray-500 mt-1">{subValue}</p>}
        </div>
    </div>
);

const RetailerDashboard: React.FC<Omit<DashboardProps, 'role' | 'users'>> = ({ inventory, sales, lowStockItemsCount, expiringSoonItemsCount }) => {
    const totalInventoryValue = inventory.reduce((acc, item) => acc + item.mrp * item.quantity, 0).toLocaleString('en-IN');
    const totalItems = inventory.reduce((acc, item) => acc + item.quantity, 0);
    const uniqueItemsCount = inventory.length;

    const topSellingProducts = sales
        .flatMap(sale => sale.items)
        .reduce((acc, item) => {
            acc[item.brand] = (acc[item.brand] || 0) + item.quantity;
            return acc;
        }, {} as Record<string, number>);
    
    const chartData = Object.entries(topSellingProducts)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <InfoCard title="Total Inventory Value" value={`₹${totalInventoryValue}`} icon={<span className="text-white">₹</span>} color="bg-blue-500" />
                <InfoCard 
                    title="Total Stock" 
                    value={totalItems} 
                    subValue={`${uniqueItemsCount} unique products`}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>} 
                    color="bg-green-500" 
                />
                <InfoCard title="Low Stock Items" value={lowStockItemsCount} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/></svg>} color="bg-yellow-500" />
                <InfoCard title="Expiring Soon" value={expiringSoonItemsCount} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>} color="bg-red-500" />
            </div>
             <div className="bg-white p-4 rounded-lg shadow-md">
                 <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Selling Products</h3>
                 <ResponsiveContainer width="100%" height={300}>
                     <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis dataKey="name" />
                         <YAxis />
                         <Tooltip />
                         <Legend />
                         <Bar dataKey="quantity" fill="#3b82f6" />
                     </BarChart>
                 </ResponsiveContainer>
             </div>
        </div>
    );
};

const DistributorDashboard: React.FC<Pick<DashboardProps, 'lowStockItemsCount'>> = ({ lowStockItemsCount }) => (
    <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">Distributor Portal</h2>
        <p className="mt-2 text-gray-600">Real-time demand from retailers.</p>
        <div className="mt-8 flex justify-center">
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-6 rounded-md w-full max-w-sm">
                <p className="font-bold text-lg">New Replenishment Requests</p>
                <p className="text-5xl font-extrabold mt-2">{lowStockItemsCount}</p>
                <p className="text-sm mt-1">stores have items requiring replenishment.</p>
            </div>
        </div>
    </div>
);

const AdminDashboard: React.FC<Pick<DashboardProps, 'inventory' | 'sales' | 'users' | 'onSelectStore'>> = ({ inventory, sales, users, onSelectStore }) => {
    const retailerUsers = users.filter(u => u.role === UserRole.Retailer);
    const totalStores = retailerUsers.length;
    const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
    const totalPlatformItems = inventory.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Admin Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoCard title="Total Active Stores" value={totalStores} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>} color="bg-purple-500" />
                <InfoCard title="Total Platform Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={<span className="text-white">₹</span>} color="bg-teal-500" />
                <InfoCard title="Total Platform Items" value={totalPlatformItems.toLocaleString('en-IN')} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>} color="bg-orange-500" />
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Store Overview</h3>
                <div className="space-y-4">
                    {retailerUsers.map(storeUser => {
                        const storeInventory = inventory.filter(i => i.userId === storeUser.id);
                        const storeSales = sales.filter(s => s.userId === storeUser.id);
                        const storeRevenue = storeSales.reduce((acc, sale) => acc + sale.total, 0);
                        const storeItems = storeInventory.reduce((acc, item) => acc + item.quantity, 0);
                        const storeValue = storeInventory.reduce((acc, item) => acc + item.mrp * item.quantity, 0);

                        return (
                            <div 
                                key={storeUser.id} 
                                className="border border-gray-200 p-4 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => onSelectStore?.(storeUser)}
                            >
                                <h4 className="font-bold text-gray-800">{storeUser.storeName}</h4>
                                <p className="text-sm text-gray-500 mb-2">{storeUser.email}</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                                    <div>
                                        <p className="text-xs text-gray-500">Inventory Value</p>
                                        <p className="font-semibold text-gray-700">₹{storeValue.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Items</p>
                                        <p className="font-semibold text-gray-700">{storeItems.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Sales</p>
                                        <p className="font-semibold text-gray-700">{storeSales.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Total Revenue</p>
                                        <p className="font-semibold text-gray-700">₹{storeRevenue.toLocaleString('en-IN')}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = (props) => {
  switch (props.role) {
    case UserRole.Retailer:
      return <RetailerDashboard {...props} />;
    case UserRole.Distributor:
      return <DistributorDashboard {...props} />;
    case UserRole.Admin:
      return <AdminDashboard {...props} />;
    default:
      return <div>Invalid Role</div>;
  }
};

export default Dashboard;

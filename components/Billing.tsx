
import React, { useState } from 'react';
import { InventoryItem } from '../types';

interface BillingProps {
  inventory: InventoryItem[];
  createSale: (items: { id: number; quantity: number }[]) => void;
}

const Billing: React.FC<BillingProps> = ({ inventory, createSale }) => {
  const [cart, setCart] = useState<Map<number, number>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');

  const addToCart = (item: InventoryItem) => {
    if (item.quantity > (cart.get(item.id) || 0)) {
        setCart(new Map(cart.set(item.id, (cart.get(item.id) || 0) + 1)));
    }
  };

  const removeFromCart = (itemId: number) => {
    const newCart = new Map(cart);
    if (newCart.has(itemId)) {
      const currentQty = newCart.get(itemId)!;
      if (currentQty > 1) {
        newCart.set(itemId, currentQty - 1);
      } else {
        newCart.delete(itemId);
      }
      setCart(newCart);
    }
  };

  const handleCheckout = () => {
    if (cart.size > 0) {
      const itemsSold = Array.from(cart.entries()).map(([id, quantity]) => ({ id, quantity }));
      createSale(itemsSold);
      setCart(new Map());
    }
  };

  const total = Array.from(cart.entries()).reduce((acc, [id, quantity]) => {
    const item = inventory.find(i => i.id === id);
    return acc + (item ? item.mrp * quantity : 0);
  }, 0);

  const filteredInventory = inventory.filter(item => 
    item.brand.toLowerCase().includes(searchTerm.toLowerCase()) && item.quantity > 0
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Point of Sale</h2>
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:ring-2 focus:ring-blue-500"
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto pr-2">
          {filteredInventory.map(item => (
            <div key={item.id} onClick={() => addToCart(item)} className="border rounded-lg p-3 text-center cursor-pointer hover:shadow-lg transition-shadow">
              <img src={item.imageUrl} alt={item.brand} className="h-20 w-20 mx-auto object-cover rounded-md mb-2" />
              <p className="text-sm font-semibold text-gray-800">{item.brand}</p>
              <p className="text-xs text-gray-500">{item.size}</p>
              <p className="text-sm font-bold text-blue-600">₹{item.mrp}</p>
              <span className="text-xs text-gray-400">Stock: {item.quantity - (cart.get(item.id) || 0)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-1 bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Current Bill</h3>
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {Array.from(cart.entries()).map(([id, quantity]) => {
            const item = inventory.find(i => i.id === id);
            if (!item) return null;
            return (
              <div key={id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                <div>
                  <p className="font-medium text-sm">{item.brand}</p>
                  <p className="text-xs text-gray-500">₹{item.mrp.toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => removeFromCart(id)} className="p-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 text-xs">-</button>
                  <span className="text-sm font-medium w-5 text-center">{quantity}</span>
                  <button onClick={() => addToCart(item)} className="p-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 text-xs">+</button>
                </div>
                <p className="text-sm font-semibold w-16 text-right">₹{(item.mrp * quantity).toFixed(2)}</p>
              </div>
            );
          })}
        </div>
        {cart.size === 0 && <p className="text-center text-gray-500 mt-8">Cart is empty</p>}
        
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.size === 0}
            className="w-full mt-4 bg-blue-600 text-white p-3 rounded-md font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;

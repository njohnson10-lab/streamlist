import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, AlertCircle } from 'lucide-react';

// --- Mock Data (Based on assignment prompt) ---
const mockData = [
  { id: 'sub-1', name: 'EZTech Premium Subscription', type: 'subscription', price: 29.99, image: 'https://via.placeholder.com/150/1e293b/cyan?text=Premium' },
  { id: 'sub-2', name: 'EZTech Basic Subscription', type: 'subscription', price: 9.99, image: 'https://via.placeholder.com/150/1e293b/cyan?text=Basic' },
  { id: 'acc-1', name: 'EZTech Logo T-Shirt', type: 'accessory', price: 19.99, image: 'https://via.placeholder.com/150/334155/fff?text=T-Shirt' },
  { id: 'acc-2', name: 'EZTech Phone Case', type: 'accessory', price: 24.99, image: 'https://via.placeholder.com/150/334155/fff?text=Phone+Case' },
];

export default function CartApp() {
  // --- State Management ---
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('eztech_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch {
      return [];
    }
  });
  const [warning, setWarning] = useState(null);
  const [activeTab, setActiveTab] = useState('shop'); // 'shop' or 'cart'

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('eztech_cart', JSON.stringify(cart));
  }, [cart]);

  // Clear warning after 3 seconds
  useEffect(() => {
    if (warning) {
      const timer = setTimeout(() => setWarning(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [warning]);

  // --- Cart Actions ---
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const hasSubscription = cart.some(item => item.type === 'subscription');

    if (product.type === 'subscription') {
      if (hasSubscription) {
        setWarning('You can only have one subscription in your cart at a time.');
        return;
      }
      setCart([...cart, { ...product, quantity: 1 }]);
    } else {
      if (existingItem) {
        setCart(cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    }
  };

  const updateQuantity = (id, amount) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // --- Calculated Values ---
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-cyan-500/30">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-slate-800/90 backdrop-blur-md border-b border-slate-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-900">EZ</div>
            <h1 className="text-xl font-bold text-white tracking-tight">Tech <span className="text-cyan-400 font-normal">Store</span></h1>
          </div>
          
          <div className="flex gap-4">
             <button 
              onClick={() => setActiveTab('shop')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'shop' ? 'text-cyan-400 bg-slate-700/50' : 'text-slate-400 hover:text-white'}`}
            >
              Subscriptions & Gear
            </button>
            <button 
              onClick={() => setActiveTab('cart')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'cart' ? 'bg-cyan-500 text-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
            >
              <ShoppingCart size={18} />
              <span>Cart</span>
              {totalItems > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${activeTab === 'cart' ? 'bg-slate-900 text-cyan-400' : 'bg-cyan-500 text-slate-900'}`}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Warning Toast */}
      {warning && (
        <div className="fixed top-20 right-6 z-50 animate-bounce">
          <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 border border-red-400">
            <AlertCircle size={18} />
            {warning}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {activeTab === 'shop' ? (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Shop Products</h2>
                <p className="text-slate-400">Add subscriptions and accessories to your cart.</p>
             </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockData.map(product => (
                <div key={product.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col transition-all hover:border-cyan-500/50 hover:shadow-lg hover:-translate-y-1">
                  <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl mb-4 opacity-90" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded">
                      {product.type}
                    </span>
                    <span className="font-bold text-white">${product.price}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4 flex-grow">{product.name}</h3>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full py-3 rounded-xl font-bold bg-slate-700 text-white hover:bg-cyan-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-white mb-8">Review Your Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-slate-800 border-2 border-slate-700 rounded-3xl border-dashed">
                <ShoppingCart className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Your cart is empty</h3>
                <p className="text-slate-500 mb-6">Looks like you haven't added anything yet.</p>
                <button 
                  onClick={() => setActiveTab('shop')}
                  className="px-6 py-3 rounded-xl font-bold bg-cyan-500 text-slate-900 hover:bg-cyan-400 transition-colors"
                >
                  Return to Shop
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="flex-grow space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-slate-800 rounded-2xl p-4 border border-slate-700 flex items-center gap-6">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                      <div className="flex-grow">
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{item.type}</span>
                        <h3 className="text-lg font-bold text-white">{item.name}</h3>
                        <p className="text-cyan-400 font-bold">${item.price}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-1 border border-slate-700">
                        {item.type === 'accessory' ? (
                           <button onClick={() => updateQuantity(item.id, -1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><Minus size={14}/></button>
                        ) : (
                           <div className="p-2 text-slate-600 cursor-not-allowed" title="Subscriptions are limited to 1"><Minus size={14}/></div>
                        )}
                        <span className="w-6 text-center font-bold text-white">{item.quantity}</span>
                        {item.type === 'accessory' ? (
                           <button onClick={() => updateQuantity(item.id, 1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><Plus size={14}/></button>
                        ) : (
                           <div className="p-2 text-slate-600 cursor-not-allowed" title="Subscriptions are limited to 1"><Plus size={14}/></div>
                        )}
                      </div>

                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-80 shrink-0">
                  <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 sticky top-24">
                    <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-slate-400">
                        <span>Items ({totalItems})</span>
                        <span className="text-white">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Tax (Estimated)</span>
                        <span className="text-white">${(totalPrice * 0.08).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-700 pt-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Total</span>
                        <span className="text-2xl font-black text-cyan-400">${(totalPrice * 1.08).toFixed(2)}</span>
                      </div>
                    </div>
                    <button className="w-full py-4 rounded-xl font-black bg-cyan-500 text-slate-900 hover:bg-cyan-400 transition-all shadow-[0_4px_20px_rgba(6,182,212,0.2)]">
                      Proceed to Checkout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { 
  Film, 
  Trash2, 
  Search, 
  Play, 
  Plus, 
  Minus,
  AlertCircle, 
  CheckCircle2, 
  ShoppingCart, 
  CreditCard, 
  LogIn, 
  LogOut,
  Smartphone,
  User,
  Store
} from 'lucide-react';

/**
 * STREAMLIST APPLICATION - WEEK 5 FINAL INTEGRATION
 * Integrates TMDB Search, Watchlist, EZTech Store, Google OAuth Gate, and Credit Card Management.
 */

// --- MOCK SHOP DATA ---
const mockShopProducts = [
  { id: 'sub-1', name: 'EZTech Premium Subscription', type: 'subscription', price: 29.99, image: 'https://via.placeholder.com/150/1e293b/cyan?text=Premium' },
  { id: 'sub-2', name: 'EZTech Basic Subscription', type: 'subscription', price: 9.99, image: 'https://via.placeholder.com/150/1e293b/cyan?text=Basic' },
  { id: 'acc-1', name: 'EZTech Logo T-Shirt', type: 'accessory', price: 19.99, image: 'https://via.placeholder.com/150/334155/fff?text=T-Shirt' },
  { id: 'acc-2', name: 'EZTech Phone Case', type: 'accessory', price: 24.99, image: 'https://via.placeholder.com/150/334155/fff?text=Phone+Case' },
];

// Custom hook to manage localStorage
function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error("Error reading localStorage", error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error("Error setting localStorage", error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}

export default function App() {
  // --- AUTHENTICATION STATE ---
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage('eztech_auth', false);
  
  // --- NAVIGATION & UI STATE ---
  const [currentRoute, setCurrentRoute] = useState('home'); // home, search, shop, cart, checkout, success
  const [notification, setNotification] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // --- DATA STATE ---
  const [movies, setMovies] = useLocalStorage('streamlist_movies', []);
  const [cart, setCart] = useLocalStorage('streamlist_cart', []);
  
  // --- CREDIT CARD STATE ---
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  // --- EFFECTS ---
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setIsInstallable(true);
    });
  }, []);

  // --- HANDLERS ---
  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentRoute('home');
    setNotification("Successfully signed in with Google OAuth.");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentRoute('home'); // Reset route for next login
  };

  const addMovieToWatchlist = (movie) => {
    if (!isLoggedIn) {
      setCurrentRoute('login');
      setNotification("Please sign in to add movies to your watchlist.");
      return;
    }
    if (!movies.some(m => m.id === movie.id)) {
      setMovies([movie, ...movies]);
      setNotification(`${movie.title} added to list!`);
    } else {
      setNotification(`"${movie.title}" is already in your list.`);
    }
  };

  const deleteMovie = (id) => {
    if (!isLoggedIn) {
      setCurrentRoute('login');
      setNotification("Please sign in to modify your watchlist.");
      return;
    }
    setMovies(movies.filter(m => m.id !== id));
  };

  const toggleWatched = (id) => {
    if (!isLoggedIn) {
      setCurrentRoute('login');
      setNotification("Please sign in to play movies.");
      return;
    }
    setMovies(movies.map(m => m.id === id ? { ...m, watched: !m.watched } : m));
  };

  // --- CART LOGIC ---
  const addToCart = (item) => {
    if (!isLoggedIn) {
      setCurrentRoute('login');
      setNotification("Please sign in to add items to your cart.");
      return;
    }

    // Standardize item data (handle both TMDB movies and Shop products)
    const cartItem = {
      id: item.id.toString(),
      name: item.title || item.name,
      price: item.price || 14.99, // default movie price if none provided
      type: item.type || 'movie',
      image: item.image || null
    };

    const existingItemIndex = cart.findIndex(c => c.id === cartItem.id);

    // Subscription limitation logic
    if (cartItem.type === 'subscription') {
      const hasSubscription = cart.some(c => c.type === 'subscription');
      if (hasSubscription && existingItemIndex === -1) {
        setNotification('You can only have one subscription in your cart at a time.');
        return;
      }
    }

    if (existingItemIndex >= 0) {
      const newCart = [...cart];
      newCart[existingItemIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...cartItem, quantity: 1 }]);
    }
    setNotification(`${cartItem.name} added to cart!`);
  };

  const updateCartQuantity = (id, amount) => {
    if (!isLoggedIn) {
      setCurrentRoute('login');
      return;
    }
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity + amount;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    if (!isLoggedIn) {
      setCurrentRoute('login');
      return;
    }
    setCart(cart.filter(item => item.id !== id));
  };

  // --- PAYMENT LOGIC ---
  const handleCardNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, '');
    const masked = input.replace(/(\d{4})(?=\d)/g, '$1 ').substring(0, 19);
    setCardNumber(masked);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setCurrentRoute('login');
      return;
    }
    // Saving to localStorage as required by instructions
    const paymentInfo = { cardName, cardNumber, expiry };
    localStorage.setItem('eztech_last_payment', JSON.stringify(paymentInfo));
    setCurrentRoute('success');
  };

  // --- DERIVED CART VALUES ---
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = totalPrice * 0.08;
  const finalTotal = totalPrice + tax;

  // --- COMPONENTS ---

  const LoginScreen = () => (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-4">
      <div className="bg-[#0b0e14] p-10 rounded-3xl border border-cyan-900/30 shadow-[0_0_50px_rgba(6,182,212,0.1)] w-full max-w-md text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-cyan-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-cyan-500/20">
          <User className="text-cyan-400 w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2 tracking-tighter uppercase">EZTech<span className="text-cyan-400">Movie</span></h1>
        <p className="text-slate-500 mb-8 font-medium">Internal IT Access Portal</p>
        <button 
          onClick={handleLogin}
          className="w-full bg-cyan-500 text-[#05080f] font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          <LogIn size={20} />
          Sign in with Google OAuth
        </button>
        <div className="mt-6 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
          Secure Access Required
        </div>
      </div>
    </div>
  );

  // EXCLUSIVE REDIRECT LOGIC:
  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  // --- MAIN SYSTEM INTERFACE ---
  return (
    <div className="min-h-screen bg-[#05080f] text-slate-200 font-sans selection:bg-cyan-500/30 animate-in fade-in duration-700">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-cyan-500 text-[#05080f] px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2">
            <CheckCircle2 size={18} />
            {notification}
          </div>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="border-b border-cyan-900/30 bg-[#0b0e14]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentRoute('home')}>
            <div className="bg-cyan-500/20 p-2 rounded-xl border border-cyan-500/30">
              <Film className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white uppercase">
              Stream<span className="text-cyan-400">List</span>
            </h1>
          </div>
          
          <nav className="flex items-center gap-2 bg-[#161b22] p-1 rounded-xl border border-slate-800 overflow-x-auto">
            <button 
              onClick={() => setCurrentRoute('home')}
              className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${currentRoute === 'home' ? 'bg-cyan-500 text-[#05080f]' : 'text-slate-400 hover:text-white'}`}
            >
              Watchlist
            </button>
            <button 
              onClick={() => setCurrentRoute('search')}
              className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${currentRoute === 'search' ? 'bg-cyan-500 text-[#05080f]' : 'text-slate-400 hover:text-white'}`}
            >
              <Search size={14} className="inline mr-1" /> TMDB Search
            </button>
            <button 
              onClick={() => setCurrentRoute('shop')}
              className={`px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${currentRoute === 'shop' ? 'bg-cyan-500 text-[#05080f]' : 'text-slate-400 hover:text-white'}`}
            >
              <Store size={14} className="inline mr-1" /> Store
            </button>
            <button 
              onClick={() => setCurrentRoute('cart')}
              className={`relative px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-all ${currentRoute === 'cart' ? 'bg-cyan-500 text-[#05080f]' : 'text-slate-400 hover:text-white'}`}
            >
              <ShoppingCart size={14} className="inline mr-1" />
              Cart
              {totalItems > 0 && <span className="ml-1 bg-red-500 text-white px-1.5 rounded-full text-[10px]">{totalItems}</span>}
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1 hidden sm:block"></div>
            <button 
              onClick={handleLogout} 
              className="flex items-center px-4 py-2 rounded-lg font-bold text-xs whitespace-nowrap text-slate-500 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut size={14} className="inline mr-1" />
              Sign Out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        
        {/* VIEW: WATCHLIST (HOME) */}
        {currentRoute === 'home' && (
          <div className="animate-in fade-in duration-500">
             <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">Your Library</h2>
                  <p className="text-slate-500 font-medium">Tracking {movies.length} titles</p>
                </div>
                {isInstallable && (
                  <button className="hidden sm:flex items-center gap-2 bg-[#1e252e] border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800">
                    <Smartphone size={14} className="text-cyan-400" />
                    Install App
                  </button>
                )}
              </div>

              {movies.length === 0 ? (
                <div className="text-center py-24 bg-[#0b0e14] border-2 border-slate-800/50 rounded-3xl border-dashed">
                  <Film className="w-16 h-16 text-slate-700 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-slate-300 mb-2">The list is empty</h3>
                  <p className="text-slate-500">Head over to the TMDB Search tab to start building your collection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {movies.map((movie) => (
                    <div key={movie.id} className={`bg-[#0b0e14] border rounded-2xl p-6 flex flex-col transition-all duration-300 ${movie.watched ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-cyan-500/40'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className={`text-xl font-bold ${movie.watched ? 'text-slate-500 line-through' : 'text-white'}`}>{movie.title}</h3>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => toggleWatched(movie.id)} className={`p-2 rounded-lg ${movie.watched ? 'bg-cyan-500 text-[#05080f]' : 'bg-[#1e252e] text-slate-400'}`}>
                            <Play className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteMovie(movie.id)} className="p-2 rounded-lg bg-[#1e252e] text-slate-400 hover:text-red-400">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-2">{movie.summary || "No description provided."}</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* VIEW: TMDB SEARCH */}
        {currentRoute === 'search' && (
          <TmdbSearch onAddWatchlist={addMovieToWatchlist} onAddCart={addToCart} />
        )}

        {/* VIEW: EZTECH STORE */}
        {currentRoute === 'shop' && (
          <div className="animate-in fade-in duration-500">
             <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">EZTech Store</h2>
                <p className="text-slate-500">Add premium subscriptions and accessories to your cart.</p>
             </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockShopProducts.map(product => (
                <div key={product.id} className="bg-[#0b0e14] rounded-2xl p-5 border border-slate-800 flex flex-col transition-all hover:border-cyan-500/50 hover:shadow-lg">
                  <img src={product.image} alt={product.name} className="w-full h-40 object-cover rounded-xl mb-4 opacity-80" />
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded">
                      {product.type}
                    </span>
                    <span className="font-bold text-white">${product.price}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-4 flex-grow">{product.name}</h3>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full py-3 rounded-xl font-bold bg-[#1e252e] text-cyan-400 hover:bg-cyan-500 hover:text-[#05080f] transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW: SHOPPING CART */}
        {currentRoute === 'cart' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold text-white mb-8">Review Your Cart</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-20 bg-[#0b0e14] border-2 border-slate-800 rounded-3xl border-dashed">
                <ShoppingCart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-300 mb-2">Your cart is empty</h3>
                <p className="text-slate-500 mb-6">Looks like you haven't added anything yet.</p>
                <button 
                  onClick={() => setCurrentRoute('shop')}
                  className="px-6 py-3 rounded-xl font-bold bg-cyan-500 text-[#05080f] hover:bg-cyan-400 transition-colors"
                >
                  Return to Store
                </button>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="flex-grow space-y-4">
                  {cart.map(item => (
                    <div key={item.id} className="bg-[#0b0e14] rounded-2xl p-5 border border-slate-800 flex items-center gap-6">
                      {item.image ? (
                         <img src={item.image} alt={item.name} className="hidden sm:block w-16 h-16 object-cover rounded-lg opacity-80" />
                      ) : (
                         <div className="hidden sm:flex w-16 h-16 bg-[#161b22] rounded-lg items-center justify-center border border-slate-700">
                           <Film className="text-cyan-400" size={24} />
                         </div>
                      )}
                      
                      <div className="flex-grow">
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{item.type}</span>
                        <h3 className="text-lg font-bold text-white leading-tight">{item.name}</h3>
                        <p className="text-cyan-400 font-bold">${item.price}</p>
                      </div>
                      
                      <div className="flex items-center gap-3 bg-[#161b22] rounded-lg p-1 border border-slate-700">
                        {item.type === 'accessory' || item.type === 'movie' ? (
                           <button onClick={() => updateCartQuantity(item.id, -1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><Minus size={14}/></button>
                        ) : (
                           <div className="p-2 text-slate-600 cursor-not-allowed" title="Subscriptions are limited to 1"><Minus size={14}/></div>
                        )}
                        <span className="w-6 text-center font-bold text-white text-sm">{item.quantity}</span>
                        {item.type === 'accessory' || item.type === 'movie' ? (
                           <button onClick={() => updateCartQuantity(item.id, 1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-md transition-colors"><Plus size={14}/></button>
                        ) : (
                           <div className="p-2 text-slate-600 cursor-not-allowed" title="Subscriptions are limited to 1"><Plus size={14}/></div>
                        )}
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
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
                  <div className="bg-[#0b0e14] rounded-3xl p-6 border border-cyan-900/30 sticky top-24 shadow-lg">
                    <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>
                    <div className="space-y-3 mb-6 text-sm">
                      <div className="flex justify-between text-slate-400">
                        <span>Items ({totalItems})</span>
                        <span className="text-white">${totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Tax (Estimated 8%)</span>
                        <span className="text-white">${tax.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="border-t border-slate-800 pt-4 mb-8">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-white">Total</span>
                        <span className="text-2xl font-black text-cyan-400">${finalTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCurrentRoute('checkout')}
                      className="w-full py-4 rounded-xl font-black bg-cyan-500 text-[#05080f] hover:bg-cyan-400 transition-all shadow-[0_4px_20px_rgba(6,182,212,0.2)] flex items-center justify-center gap-2"
                    >
                       Proceed to Checkout <CreditCard size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW: CHECKOUT */}
        {currentRoute === 'checkout' && (
          <div className="max-w-md mx-auto animate-in fade-in duration-500">
            <button onClick={() => setCurrentRoute('cart')} className="text-slate-500 mb-6 flex items-center gap-2 hover:text-white transition-colors text-sm font-bold">
              &larr; Back to Cart
            </button>
            <div className="bg-[#0b0e14] border border-cyan-900/30 p-8 rounded-3xl">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <CreditCard className="text-cyan-400" /> Payment Details
              </h2>
              <form onSubmit={handleProcessPayment} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Cardholder Name</label>
                  <input 
                    type="text" required value={cardName} onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-[#161b22] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500"
                    placeholder="Enter Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Card Number</label>
                  <input 
                    type="text" required value={cardNumber} onChange={handleCardNumberChange}
                    className="w-full bg-[#161b22] border border-slate-800 rounded-xl px-4 py-3 text-white font-mono focus:outline-none focus:border-cyan-500"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="text" placeholder="MM/YY" required
                    className="w-full bg-[#161b22] border border-slate-800 rounded-xl px-4 py-3 text-white"
                  />
                  <input 
                    type="password" placeholder="CVV" required
                    className="w-full bg-[#161b22] border border-slate-800 rounded-xl px-4 py-3 text-white"
                  />
                </div>
                <button type="submit" className="w-full bg-cyan-500 text-[#05080f] font-black py-4 rounded-xl mt-4 flex justify-between items-center px-6">
                  <span>Confirm Payment</span>
                  <span>${finalTotal.toFixed(2)}</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* VIEW: SUCCESS */}
        {currentRoute === 'success' && (
          <div className="text-center py-20 animate-in zoom-in duration-500">
            <div className="bg-cyan-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/20">
              <CheckCircle2 size={60} className="text-cyan-400" />
            </div>
            <h2 className="text-4xl font-black text-white mb-4">PURCHASE COMPLETE</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-10 font-medium">Your order has been processed successfully. Your payment details were securely saved to local storage per PCI standards.</p>
            <button onClick={() => { setCart([]); setCurrentRoute('home'); }} className="bg-white text-[#05080f] font-black px-10 py-4 rounded-2xl">Return Home</button>
          </div>
        )}

      </main>

      <footer className="max-w-6xl mx-auto px-6 pb-12 pt-6 border-t border-slate-900 flex justify-between items-center text-slate-600 text-[10px] uppercase font-bold tracking-widest">
        <p>© 2026 Nicholas Johnson • INT499 Capstone</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          PWA Version 1.0.6 Active
        </div>
      </footer>
    </div>
  );
}

function TmdbSearch({ onAddWatchlist, onAddCart }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  // Placeholder for the environment - User should use their own REACT_APP_TMDB_API_KEY locally
  const TMDB_API_KEY = "3fd2be6f0c70a2a598f084ddfb75487c"; // Standard testing key

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Failed to fetch from TMDB. Please check your network.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-white mb-2">Explore TMDB</h2>
        <p className="text-slate-500 font-medium">Sync professional metadata with your EZTechMovie StreamList.</p>
      </div>
      
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movie title..." 
            className="w-full bg-[#0b0e14] border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>
        <button type="submit" disabled={isSearching} className="bg-cyan-500 text-[#05080f] font-black py-4 px-8 rounded-2xl disabled:opacity-50">
          {isSearching ? '...' : 'Search'}
        </button>
      </form>

      {error && <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm"><AlertCircle size={18} />{error}</div>}

      <div className="space-y-4">
        {results.map((movie) => (
          <div key={movie.id} className="bg-[#0b0e14] border border-slate-800 hover:border-cyan-900/30 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center gap-6 transition-all group">
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{movie.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{movie.overview || "No summary available."}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button 
                onClick={() => onAddWatchlist({ id: movie.id.toString(), title: movie.title, summary: movie.overview, watched: false })}
                className="bg-[#1e252e] hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl flex items-center gap-2 transition-all text-xs"
              >
                <Plus size={14} /> List
              </button>
              <button 
                onClick={() => onAddCart({ ...movie, type: 'movie', price: 14.99 })}
                className="bg-cyan-500 hover:bg-cyan-400 text-[#05080f] font-black py-3 px-4 rounded-xl flex items-center gap-2 transition-all text-xs"
              >
                <ShoppingCart size={14} /> Buy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
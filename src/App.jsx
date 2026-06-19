import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import { useCart } from './context/CartContext';

function App() {
  const { cartCount } = useCart();
  const location = useLocation();
  const [isPageLoading, setIsPageLoading] = useState(false);

  useEffect(() => {
    setIsPageLoading(true);
    
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans text-sm relative">
      
      {isPageLoading && (
        <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center transition-opacity duration-300">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium animate-pulse text-sm">Đang tải dữ liệu...</p>
        </div>
      )}

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-6 py-3 flex justify-between items-center transition-all">
        <Link to="/" className="text-lg font-extrabold text-blue-600 hover:text-blue-700 transition-colors tracking-tight">
          TechShop
        </Link>
        <Link to="/cart" className="relative flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-1.5 px-4 rounded-full transition-all text-sm">
          <span>🛒 Giỏ hàng</span>
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
              {cartCount}
            </span>
          )}
        </Link>
      </nav>

      <main className="max-w-6xl mx-auto pb-12">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
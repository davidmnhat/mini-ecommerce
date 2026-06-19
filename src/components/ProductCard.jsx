import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [showNotification, setShowNotification] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl p-4 flex flex-col h-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      
      {showNotification && (
        <div className="absolute -top-10 right-0 bg-green-500 text-white px-3 py-1.5 rounded shadow-lg z-10 font-medium animate-pulse text-xs">
          ✓ Đã thêm
        </div>
      )}

      <div className="w-full h-40 mb-4 overflow-hidden rounded-lg flex items-center justify-center bg-gray-50 p-2">
        <img 
          src={product.image} 
          alt={product.title} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
        />
      </div>
      
      <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 flex-1 group-hover:text-blue-600 transition-colors">
        {product.title}
      </h3>
      
      <span className="inline-block bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-0.5 rounded mb-2 self-start">
        {product.category}
      </span>
      
      <p className="text-base font-extrabold text-red-500 mb-4">
        {product.price.toLocaleString('en-US')} <span className="text-xs text-gray-500 font-medium">đ</span>
      </p>
      
      <div className="flex gap-2 mt-auto">
        <Link 
          to={`/product/${product.id}`} 
          className="flex-1 text-center py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded text-xs transition-colors"
        >
          Chi tiết
        </Link>
        <button 
          onClick={handleAddToCart} 
          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs shadow-sm transition-all"
        >
          🛒 Thêm
        </button>
      </div>
    </div>
  );
}
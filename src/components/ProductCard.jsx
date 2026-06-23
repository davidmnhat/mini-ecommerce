import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart, cartItems, removeFromCart } = useCart();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const [showNotification, setShowNotification] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);

  const isInCart = cartItems.some(item => item.id === product.id);

  const handleCartAction = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }

    if (isInCart) {
      setIsDeleteModalOpen(true);
    } else {
      addToCart(product);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  const confirmDelete = () => {
    removeFromCart(product.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl p-4 flex flex-col h-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
      
      {showNotification && (
        <div className="absolute -top-10 right-0 bg-green-500 text-white px-3 py-1.5 rounded shadow-lg z-10 font-medium animate-pulse text-xs">
          ✓ Đã thêm
        </div>
      )}

      <Link to={`/product/${product.id}`} className="flex flex-col flex-1">
        <div className="w-full h-40 mb-4 overflow-hidden rounded-lg flex items-center justify-center bg-gray-50 p-2">
          <img 
            src={product.image} 
            alt={product.title} 
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" 
          />
        </div>
        
        <h3 className="text-sm font-bold text-gray-800 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>
        
        <span className="inline-block bg-blue-50 text-blue-600 text-[11px] font-semibold px-2 py-0.5 rounded mb-2 self-start">
          {product.category}
        </span>
        
        <p className="text-base font-extrabold text-red-500 mb-4 mt-auto">
          {product.price.toLocaleString('en-US')} <span className="text-xs text-gray-500 font-medium">đ</span>
        </p>
      </Link>
      
      <div className="mt-2">
        <button 
          onClick={handleCartAction} 
          className={`w-full py-2 font-medium rounded-lg text-sm shadow-sm transition-all ${
            isInCart 
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isInCart ? '✕ Xóa khỏi giỏ' : '🛒 Thêm vào giỏ'}
        </button>
      </div>

      {isLoginPromptOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center animate-[popIn_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
            <p className="text-gray-500 mb-5 text-sm">Bạn phải đăng nhập để thêm sản phẩm này vào giỏ hàng.</p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => setIsLoginPromptOpen(false)} 
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded text-sm transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-sm transition-colors shadow-sm"
              >
                Đi tới đăng nhập
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {isDeleteModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center animate-[popIn_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa sản phẩm</h3>
            <p className="text-gray-500 mb-5 text-sm">Bỏ "{product.title}" khỏi giỏ hàng?</p>
            <div className="flex gap-2 justify-center">
              <button 
                onClick={() => setIsDeleteModalOpen(false)} 
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded text-sm transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-sm transition-colors shadow-sm"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
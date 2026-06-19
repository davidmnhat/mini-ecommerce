import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { products, loading, error } = useProducts();
  const [showNotification, setShowNotification] = useState(false);

  const product = products.find(item => item.id === parseInt(id));

  const handleAddToCart = () => {
    addToCart(product);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  if (loading) return <div className="text-center mt-12 text-sm text-gray-600">Đang tải...</div>;
  if (error || !product) return <div className="text-center mt-12 text-sm text-red-500">Lỗi: Không tìm thấy sản phẩm!</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {showNotification && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 font-medium flex items-center gap-2 text-sm">
          ✓ Đã thêm vào giỏ
        </div>
      )}

      <Link to="/" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm mb-4">
        &larr; Quay lại
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/5 flex items-center justify-center bg-gray-50 rounded-lg p-4">
          <img src={product.image} alt={product.title} className="w-full max-w-[250px] object-contain" />
        </div>

        <div className="w-full md:w-3/5 flex flex-col justify-center">
          <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-1 rounded w-max mb-3 uppercase">
            {product.category}
          </span>
          
          <h1 className="text-xl font-bold text-gray-900 mb-3 leading-snug">
            {product.title}
          </h1>
          
          <p className="text-2xl font-black text-red-500 mb-4">
            {product.price.toLocaleString('en-US')} <span className="text-sm text-gray-500">đ</span>
          </p>
          
          <div className="mb-6 text-gray-600 text-sm leading-relaxed">
            <p>{product.description}</p>
          </div>

          <button 
            onClick={handleAddToCart}
            className="w-max px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow transition-all flex items-center gap-2"
          >
            🛒 Thêm vào giỏ hàng
          </button>
        </div>
      </div>
    </div>
  );
}
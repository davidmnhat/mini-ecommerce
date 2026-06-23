import { useState } from 'react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';
import { Link, useNavigate } from 'react-router-dom';

export default function Cart() {
  const { cartItems, updateQuantity, removeFromCart } = useCart();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleToggleCheckbox = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach(id => removeFromCart(id));
    setSelectedIds([]);
    setIsDeleteModalOpen(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="py-16 text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Giỏ hàng trống!</h3>
        <Link to="/" className="inline-block bg-blue-600 text-white font-medium px-5 py-2 rounded shadow hover:bg-blue-700 text-sm">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const selectedTotal = selectedItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Giỏ Hàng</h2>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex items-center justify-between font-semibold text-gray-500 text-xs uppercase">
          <span>Sản phẩm</span>
          <span className="hidden md:block mr-16">Thành tiền</span>
        </div>
        <div className="px-2">
          {cartItems.map(item => (
            <CartItem 
              key={item.id} 
              item={item} 
              updateQuantity={updateQuantity} 
              removeFromCart={removeFromCart} 
              isChecked={selectedIds.includes(item.id)} 
              onToggle={() => handleToggleCheckbox(item.id)} 
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 z-40 bg-white border border-gray-200 p-4 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <button 
          onClick={() => selectedIds.length > 0 && setIsDeleteModalOpen(true)}
          disabled={selectedIds.length === 0}
          className={`px-4 py-2 rounded font-medium ${selectedIds.length === 0 ? 'bg-gray-100 text-gray-400' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
        >
          Xóa đã chọn ({selectedIds.length})
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-gray-600">
            Tổng thanh toán: <span className="text-lg font-bold text-red-500 ml-1">{selectedTotal.toLocaleString('en-US')} đ</span>
          </div>

          <button 
            onClick={() => {
              if (selectedIds.length > 0) {
                const itemsToBuy = cartItems.filter(item => selectedIds.includes(item.id));
                localStorage.setItem('checkoutItems', JSON.stringify(itemsToBuy));
                localStorage.setItem('checkoutTotal', selectedTotal);
                navigate('/checkout');
              }
            }}
            disabled={selectedIds.length === 0}
            className={`px-6 py-2 rounded font-medium text-white shadow transition-colors ${selectedIds.length === 0 ? 'bg-gray-300' : 'bg-[#ee4d2d] hover:bg-[#d73211]'}`}
          >
            Mua hàng
          </button>
        </div>
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa sản phẩm</h3>
            <p className="text-gray-500 mb-5 text-sm">Xóa các mục đã chọn khỏi giỏ?</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded text-sm font-medium">Hủy</button>
              <button onClick={handleDeleteSelected} className="px-4 py-1.5 bg-red-600 text-white rounded text-sm font-medium">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
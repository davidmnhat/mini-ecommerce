import { useState } from 'react';

export default function CartItem({ item, updateQuantity, removeFromCart, isChecked, onToggle }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMinus = () => {
    if (item.quantity === 1) setIsOpen(true);
    else updateQuantity(item.id, item.quantity - 1);
  };

  const handlePlus = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-100 last:border-0 gap-3 hover:bg-gray-50 text-sm">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <input 
          type="checkbox" 
          checked={isChecked} 
          onChange={onToggle} 
          className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
        />
        <div className="w-14 h-14 bg-white rounded border border-gray-100 p-1 flex-shrink-0">
          <img src={item.image} alt={item.title} className="w-full h-full object-contain" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 line-clamp-1">{item.title}</h4>
          <p className="text-red-500 font-bold mt-0.5">{item.price.toLocaleString('en-US')} đ</p>
        </div>
      </div>

      <div className="flex items-center w-full sm:w-auto justify-between sm:justify-end gap-6">
        <div className="flex items-center bg-gray-100 rounded p-0.5">
          <button onClick={handleMinus} className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-white rounded">-</button>
          <span className="w-8 text-center font-medium text-xs">{item.quantity}</span>
          <button onClick={handlePlus} className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-white rounded">+</button>
        </div>

        <div className="font-bold text-gray-800 w-24 text-right hidden md:block">
          {(item.price * item.quantity).toLocaleString('en-US')} đ
        </div>

        <button onClick={() => setIsOpen(true)} className="text-gray-400 hover:text-red-500 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
          <div className="bg-white p-5 rounded-xl shadow-xl w-[90%] max-w-sm text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xóa sản phẩm?</h3>
            <p className="text-gray-500 mb-5 text-sm">Bỏ "{item.title}" khỏi giỏ hàng?</p>
            <div className="flex gap-2 justify-center">
              <button onClick={() => setIsOpen(false)} className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded text-sm">Hủy</button>
              <button onClick={() => { removeFromCart(item.id); setIsOpen(false); }} className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded text-sm">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
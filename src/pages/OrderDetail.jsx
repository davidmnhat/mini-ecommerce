import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrderDetail() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const savedOrders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
    setOrders(savedOrders);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-block mb-6 text-blue-600 hover:underline font-medium text-sm">
          &larr; Về trang chủ
        </Link>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của bạn</h2>

        {orders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <p className="text-gray-500">Bạn chưa có đơn hàng nào.</p>
            <Link to="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <div 
                key={idx} 
                onClick={() => setSelectedOrder(order)}
                className="bg-white p-5 rounded-xl shadow-sm border border-transparent hover:border-blue-500 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-800">{order.id}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{order.date}</p>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                    {order.items.map(item => `${item.quantity}x ${item.title}`).join(', ')}
                  </p>
                </div>
                <div className="text-right w-full md:w-auto flex justify-between md:block items-center border-t md:border-t-0 pt-3 md:pt-0 mt-2 md:mt-0">
                  <p className="text-xs text-gray-500 md:mb-1">Tổng tiền</p>
                  <p className="font-bold text-[#ee4d2d] text-lg">{order.total.toLocaleString()} đ</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.id} • {selectedOrder.date}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)} 
                className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 hover:text-black transition-colors"
              >
                ✖
              </button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-gray-800 text-sm mb-2">📍 Địa chỉ giao hàng</h4>
                  {selectedOrder.address ? (
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-800">{selectedOrder.address.name} | {selectedOrder.address.phone}</p>
                      <p>{selectedOrder.address.street}</p>
                      <p>{selectedOrder.address.ward}, {selectedOrder.address.district}, {selectedOrder.address.province}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Trống</p>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">🚚 Đơn vị vận chuyển</h4>
                    <p className="text-sm text-gray-600">{selectedOrder.shipping}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-gray-800 text-sm mb-1">💳 Phương thức thanh toán</h4>
                    <p className="text-sm text-gray-600">{selectedOrder.payment}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-800 text-sm mb-3">🛒 Sản phẩm</h4>
                <div className="border rounded-xl divide-y">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center gap-4">
                      <img src={item.image} alt={item.title} className="w-14 h-14 object-cover rounded border" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm line-clamp-1">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">SL: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-800 text-sm">{(item.price * item.quantity).toLocaleString()} đ</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-gray-600 font-medium">Thành tiền</span>
              <span className="text-2xl font-bold text-[#ee4d2d]">{selectedOrder.total.toLocaleString()} đ</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
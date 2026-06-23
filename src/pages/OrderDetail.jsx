import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OrderDetail() {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const orders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
    const foundOrder = orders.find(o => o.id === orderId);
    if (foundOrder) {
      setOrder(foundOrder);
    }
  }, [orderId, user, navigate]);

  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải hoặc không tìm thấy đơn hàng...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-block mb-6 text-blue-600 hover:underline font-medium text-sm">
          &larr; Quay lại trang chủ
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex justify-between items-center border-l-4 border-blue-500">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Chi tiết đơn hàng</h2>
            <p className="text-gray-500 mt-1 text-sm">Mã đơn: <span className="font-semibold text-black">{order.id}</span></p>
            <p className="text-gray-400 text-xs mt-1">{order.date}</p>
          </div>
          <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold text-sm">
            {order.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-base mb-4 text-gray-800">📍 Địa chỉ nhận hàng</h3>
            {order.address ? (
              <div className="text-gray-700 text-sm space-y-1.5">
                <p><span className="font-semibold">{order.address.name}</span> | {order.address.phone}</p>
                <p>{order.address.street}</p>
                <p>{order.address.ward}, {order.address.district}, {order.address.province}</p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Không có thông tin địa chỉ.</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-base mb-3 text-gray-800">🚚 Vận chuyển</h3>
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border">{order.shipping}</p>
            </div>
            <div>
              <h3 className="font-bold text-base mb-3 text-gray-800">💳 Thanh toán</h3>
              <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border">{order.payment}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="font-bold text-base mb-4 text-gray-800">🛒 Sản phẩm đã đặt</h3>
          <div className="divide-y">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 flex items-center gap-4">
                <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg border" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Số lượng: {item.quantity}</p>
                </div>
                <p className="font-bold text-[#ee4d2d] text-sm">{(item.price * item.quantity).toLocaleString()} đ</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t flex justify-end items-center gap-4">
            <span className="text-gray-600 font-medium">Tổng tiền:</span>
            <span className="text-xl font-bold text-[#ee4d2d]">{order.total.toLocaleString()} đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
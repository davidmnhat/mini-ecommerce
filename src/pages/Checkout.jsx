import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { removeFromCart } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [localityData, setLocalityData] = useState(null);
  const [address, setAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shipping, setShipping] = useState('Giao nhanh');
  const [payment, setPayment] = useState('Trả tiền khi nhận hàng');
  const [formData, setFormData] = useState({ name: '', phone: '', province: '', district: '', ward: '', street: '' });
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  useEffect(() => {
    const savedItems = localStorage.getItem('checkoutItems');
    const savedTotal = localStorage.getItem('checkoutTotal');
    if (savedItems) {
      setSelectedItems(JSON.parse(savedItems));
      setSelectedTotal(Number(savedTotal));
    } else if (!isSuccessModalOpen) {
      navigate('/cart');
    }

    fetch('/data/vietnamLocality.json')
      .then(res => res.json())
      .then(setLocalityData)
      .catch(console.error);
    
    if (user) {
      const savedAddr = localStorage.getItem(`address_${user.id}`);
      if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        setAddress(parsed);
        setFormData(parsed);
      }
    }
  }, [navigate, user, isSuccessModalOpen]);

  const handleSaveAddress = (e) => {
    e.preventDefault();
    setAddress(formData);
    if (user) localStorage.setItem(`address_${user.id}`, JSON.stringify(formData));
    setIsModalOpen(false);
  };

  const handlePlaceOrder = () => {
    if (!address) return alert("Vui lòng thêm địa chỉ!");
    setIsConfirmModalOpen(true);
  };

  const confirmOrder = () => {
    setIsConfirmModalOpen(false);

    const newOrder = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleString('vi-VN'),
      items: selectedItems,
      total: selectedTotal,
      address: address,
      shipping: shipping,
      payment: payment,
      status: 'Đang xử lý'
    };

    const orderKey = user ? `orders_${user.id}` : 'orders_guest';
    const existingOrders = JSON.parse(localStorage.getItem(orderKey)) || [];
    localStorage.setItem(orderKey, JSON.stringify([newOrder, ...existingOrders]));

    selectedItems.forEach(item => removeFromCart(item.id));
    localStorage.removeItem('checkoutItems');
    localStorage.removeItem('checkoutTotal');
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#ee4d2d]">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📍 Địa chỉ nhận hàng</h3>
            {address ? (
              <div>
                <p className="font-semibold">{address.name} | {address.phone}</p>
                <p className="text-gray-600">{address.street}, {address.ward}, {address.district}, {address.province}</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-2 text-blue-500 text-sm hover:underline">Thay đổi</button>
              </div>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="w-full py-4 border-2 border-dashed rounded-lg text-gray-400">Thêm địa chỉ</button>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold mb-4">🛒 Sản phẩm thanh toán</h3>
            {selectedItems.map(item => (
              <div key={item.id} className="flex items-center gap-4 py-4 border-b">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded border" />
                <div className="flex-1">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-500">Số lượng: {item.quantity}</p>
                </div>
                <p className="font-bold text-[#ee4d2d]">{(item.price * item.quantity).toLocaleString()} đ</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm sticky top-6">
            <h3 className="font-bold mb-4">🚚 Vận chuyển</h3>
            {['Giao nhanh', 'Giao tiết kiệm', 'Hỏa tốc'].map(m => (
              <label key={m} className={`block p-3 border rounded-lg mb-2 cursor-pointer ${shipping === m ? 'border-[#ee4d2d] bg-orange-50' : ''}`}>
                <input type="radio" className="mr-2" name="shipping" checked={shipping === m} onChange={() => setShipping(m)} /> {m}
              </label>
            ))}
            <h3 className="font-bold mt-6 mb-4">💳 Thanh toán</h3>
            {['Trả tiền khi nhận hàng', 'Thẻ/Trả sau', 'Ngân hàng'].map(m => (
              <label key={m} className={`block p-3 border rounded-lg mb-2 cursor-pointer ${payment === m ? 'border-[#ee4d2d] bg-orange-50' : ''}`}>
                <input type="radio" className="mr-2" name="payment" checked={payment === m} onChange={() => setPayment(m)} /> {m}
              </label>
            ))}
            <div className="mt-6 pt-6 border-t flex justify-between font-bold text-xl">
              <span>Tổng:</span>
              <span className="text-[#ee4d2d]">{selectedTotal.toLocaleString()} đ</span>
            </div>
            <button onClick={handlePlaceOrder} className="w-full mt-6 bg-[#ee4d2d] text-white py-4 rounded-xl font-bold hover:bg-[#d73211]">Đặt hàng ngay</button>
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Xác nhận đặt hàng</h3>
            <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đặt đơn hàng này?</p>
            <div className="flex gap-4">
              <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300">Hủy</button>
              <button onClick={confirmOrder} className="flex-1 bg-[#ee4d2d] text-white py-3 rounded-lg font-bold hover:bg-[#d73211]">Đồng ý</button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-2xl font-bold mb-2">Đặt hàng thành công!</h3>
            <p className="text-gray-600 mb-6">Đơn hàng của bạn đã được ghi nhận.</p>
            <Link to="/" className="block bg-[#ee4d2d] text-white py-3 rounded-lg font-bold">Về trang chủ</Link>
          </div>
        </div>
      )}

      {isModalOpen && localityData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSaveAddress} className="bg-white p-6 rounded-2xl w-full max-w-sm flex flex-col gap-3">
            <h3 className="font-bold text-lg mb-2">Thông tin giao hàng</h3>
            <input required placeholder="Họ tên" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="border p-2 rounded"/>
            <input required placeholder="SĐT" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="border p-2 rounded"/>
            <select value={formData.province} onChange={(e) => setFormData({...formData, province: e.target.value, district: '', ward: ''})} className="border p-2 rounded">
              <option value="">Chọn Tỉnh</option>
              {localityData.provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={formData.district} onChange={(e) => setFormData({...formData, district: e.target.value, ward: ''})} className="border p-2 rounded">
              <option value="">Chọn Quận</option>
              {formData.province && (localityData.districts[formData.province] || []).map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={formData.ward} onChange={(e) => setFormData({...formData, ward: e.target.value})} className="border p-2 rounded">
              <option value="">Chọn Phường</option>
              {formData.district && (localityData.wards[formData.district] || []).map(w => <option key={w} value={w}>{w}</option>)}
            </select>
            <input required placeholder="Số nhà, tên đường" value={formData.street} onChange={(e) => setFormData({...formData, street: e.target.value})} className="border p-2 rounded"/>
            <button type="submit" className="bg-green-600 text-white py-2 rounded mt-2">Lưu địa chỉ</button>
          </form>
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const addressSchema = z.object({
  name: z.string().min(1, { message: 'Vui lòng nhập họ và tên' }),
  email: z.string().min(1, { message: 'Vui lòng nhập email' }).email({ message: 'Định dạng email không hợp lệ' }),
  phone: z.string().regex(/^(0[3|5|7|8|9])+([0-9]{8})\b$/, { message: 'Số điện thoại không hợp lệ (VD: 0912345678)' }),
  province: z.string().min(1, { message: 'Vui lòng chọn Tỉnh/Thành phố' }),
  district: z.string().min(1, { message: 'Vui lòng chọn Quận/Huyện' }),
  ward: z.string().min(1, { message: 'Vui lòng chọn Phường/Xã' }),
  street: z.string().min(1, { message: 'Vui lòng nhập số nhà, tên đường' }),
});

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { removeFromCart } = useCart();

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedTotal, setSelectedTotal] = useState(0);
  const [localityData, setLocalityData] = useState(null);
  const [address, setAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shipping, setShipping] = useState('Giao nhanh');
  const [payment, setPayment] = useState('Trả tiền khi nhận hàng');
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: { name: '', email: '', phone: '', province: '', district: '', ward: '', street: '' }
  });

  const selectedProvince = watch('province');
  const selectedDistrict = watch('district');

  useEffect(() => {
    if (location.state?.directBuyItem) {
      const item = location.state.directBuyItem;
      setSelectedItems([item]);
      setSelectedTotal(item.price * item.quantity);
    } else {
      const savedItems = localStorage.getItem('checkoutItems');
      const savedTotal = localStorage.getItem('checkoutTotal');
      if (savedItems) {
        setSelectedItems(JSON.parse(savedItems));
        setSelectedTotal(Number(savedTotal));
      } else if (!isSuccessModalOpen) {
        navigate('/cart');
      }
    }
  }, [navigate, isSuccessModalOpen, location.state]);

  useEffect(() => {
    fetch('/data/vietnamLocality.json')
      .then(res => res.json())
      .then(setLocalityData)
      .catch(console.error);
    
    if (user) {
      const savedAddr = localStorage.getItem(`address_${user.id}`);
      if (savedAddr) {
        const parsed = JSON.parse(savedAddr);
        setAddress(parsed);
        reset(parsed); 
      }
    }
  }, [user, reset]);

  const onSaveAddress = (data) => {
    setAddress(data);
    if (user) localStorage.setItem(`address_${user.id}`, JSON.stringify(data));
    setIsModalOpen(false);
  };

  const handlePlaceOrder = () => {
    if (!address) return alert("Vui lòng thêm địa chỉ nhận hàng!");
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
                <p className="font-semibold text-base">{address.name} <span className="text-gray-400 font-normal mx-1">|</span> {address.phone}</p>
                {address.email && <p className="text-sm text-gray-500 mb-1">✉️ {address.email}</p>}
                <p className="text-gray-600 mt-1">{address.street}, {address.ward}, {address.district}, {address.province}</p>
                <button onClick={() => setIsModalOpen(true)} className="mt-3 text-blue-600 font-medium text-sm hover:underline">Thay đổi địa chỉ</button>
              </div>
            ) : (
              <button onClick={() => setIsModalOpen(true)} className="w-full py-6 border-2 border-dashed border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-colors rounded-xl text-gray-400 font-medium flex flex-col items-center justify-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Thêm địa chỉ giao hàng mới
              </button>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold mb-4">🛒 Sản phẩm thanh toán</h3>
            {selectedItems.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center gap-4 py-4 border-b last:border-0">
                <img src={item.image} alt={item.title} className="w-20 h-20 object-contain bg-gray-50 rounded-lg border border-gray-100 p-2" />
                <div className="flex-1">
                  <p className="font-medium text-gray-800 line-clamp-2">{item.title}</p>
                  <p className="text-sm text-gray-500 mt-1">Số lượng: <span className="font-semibold text-gray-700">{item.quantity}</span></p>
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
              <label key={m} className={`flex items-center p-3 border rounded-lg mb-3 cursor-pointer transition-all ${shipping === m ? 'border-[#ee4d2d] bg-orange-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input type="radio" className="w-4 h-4 text-[#ee4d2d] focus:ring-[#ee4d2d] mr-3" name="shipping" checked={shipping === m} onChange={() => setShipping(m)} /> 
                <span className="font-medium text-gray-700">{m}</span>
              </label>
            ))}
            
            <h3 className="font-bold mt-8 mb-4">💳 Thanh toán</h3>
            {['Trả tiền khi nhận hàng', 'Thẻ/Trả sau', 'Ngân hàng'].map(m => (
              <label key={m} className={`flex items-center p-3 border rounded-lg mb-3 cursor-pointer transition-all ${payment === m ? 'border-[#ee4d2d] bg-orange-50' : 'border-gray-200 hover:border-blue-300'}`}>
                <input type="radio" className="w-4 h-4 text-[#ee4d2d] focus:ring-[#ee4d2d] mr-3" name="payment" checked={payment === m} onChange={() => setPayment(m)} /> 
                <span className="font-medium text-gray-700">{m}</span>
              </label>
            ))}
            
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center font-bold text-xl">
              <span className="text-gray-800">Tổng thanh toán:</span>
              <span className="text-[#ee4d2d] text-2xl">{selectedTotal.toLocaleString()} đ</span>
            </div>
            <button onClick={handlePlaceOrder} className="w-full mt-6 bg-[#ee4d2d] text-white py-4 rounded-xl font-bold hover:bg-[#d73211] transition-colors shadow-sm text-lg">
              Đặt hàng ngay
            </button>
          </div>
        </div>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-6 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-[popIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold mb-3 text-gray-900">Xác nhận đặt hàng</h3>
            <p className="text-gray-600 mb-8">Bạn có chắc chắn muốn đặt đơn hàng này với tổng thanh toán là <strong className="text-[#ee4d2d]">{selectedTotal.toLocaleString()} đ</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 bg-gray-100 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">Hủy</button>
              <button onClick={confirmOrder} className="flex-1 bg-[#ee4d2d] text-white py-3 rounded-xl font-bold hover:bg-[#d73211] transition-colors shadow-md">Đồng ý</button>
            </div>
          </div>
        </div>
      )}

      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-[popIn_0.2s_ease-out]">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Đặt hàng thành công!</h3>
            <p className="text-gray-600 mb-8">Cảm ơn bạn đã mua sắm. Đơn hàng của bạn đang được xử lý.</p>
            <Link to="/" className="block bg-[#ee4d2d] text-white py-3.5 rounded-xl font-bold hover:bg-[#d73211] transition-colors shadow-md">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      )}

      {/* POPUP ĐIỀN THÔNG TIN GIAO HÀNG VỚI REACT HOOK FORM */}
      {isModalOpen && localityData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 sm:p-6">
          <div className="bg-white rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] shadow-2xl animate-[popIn_0.2s_ease-out] relative">
            
            <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-bold text-xl text-gray-900">Thông tin giao hàng</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500 flex items-center justify-center transition-colors"
                title="Đóng"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto hide-scrollbar">
              {/* Thay vì onSubmit tự viết, mình truyền hàm của Zod xử lý trước, hết lỗi nó mới gọi onSaveAddress */}
              <form id="address-form" onSubmit={handleSubmit(onSaveAddress)} className="flex flex-col gap-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                    <input 
                      placeholder="Nhập họ và tên..." 
                      {...register('name')}
                      className={`p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.name ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                    />
                    {errors.name && <span className="text-xs text-red-500 font-medium pl-1">{errors.name.message}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email"
                      placeholder="Nhập địa chỉ email..." 
                      {...register('email')}
                      className={`p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.email ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                    />
                    {errors.email && <span className="text-xs text-red-500 font-medium pl-1">{errors.email.message}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Số điện thoại <span className="text-red-500">*</span></label>
                  <input 
                    type="tel"
                    placeholder="VD: 0912345678" 
                    maxLength={10}
                    {...register('phone')}
                    className={`p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.phone ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                  />
                  {errors.phone && <span className="text-xs text-red-500 font-medium pl-1">{errors.phone.message}</span>}
                </div>

                <div className="border-t border-gray-100 my-2"></div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Tỉnh/Thành phố <span className="text-red-500">*</span></label>
                    <select 
                      {...register('province', { 
                        onChange: () => { 
                          setValue('district', '', { shouldValidate: true }); 
                          setValue('ward', '', { shouldValidate: true }); 
                        } 
                      })}
                      className={`p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white cursor-pointer ${errors.province ? 'border-red-500 bg-red-50 focus:ring-red-200 text-red-600' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                    >
                      <option value="">-- Chọn Tỉnh/Thành phố --</option>
                      {localityData.provinces.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {errors.province && <span className="text-xs text-red-500 font-medium pl-1">{errors.province.message}</span>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-gray-700">Quận/Huyện <span className="text-red-500">*</span></label>
                    <select 
                      {...register('district', { 
                        onChange: () => { 
                          setValue('ward', '', { shouldValidate: true }); 
                        } 
                      })}
                      disabled={!selectedProvince}
                      className={`p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.district ? 'border-red-500 bg-red-50 focus:ring-red-200 text-red-600' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                    >
                      <option value="">-- Chọn Quận/Huyện --</option>
                      {selectedProvince && (localityData.districts[selectedProvince] || []).map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {errors.district && <span className="text-xs text-red-500 font-medium pl-1">{errors.district.message}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Phường/Xã <span className="text-red-500">*</span></label>
                  <select 
                    {...register('ward')}
                    disabled={!selectedDistrict}
                    className={`p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.ward ? 'border-red-500 bg-red-50 focus:ring-red-200 text-red-600' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                  >
                    <option value="">-- Chọn Phường/Xã --</option>
                    {selectedDistrict && (localityData.wards[selectedDistrict] || []).map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                  {errors.ward && <span className="text-xs text-red-500 font-medium pl-1">{errors.ward.message}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700">Số nhà, tên đường cụ thể <span className="text-red-500">*</span></label>
                  <input 
                    placeholder="Nhập địa chỉ chi tiết..." 
                    {...register('street')}
                    className={`p-3 border rounded-xl focus:outline-none focus:ring-2 transition-all ${errors.street ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'}`}
                  />
                  {errors.street && <span className="text-xs text-red-500 font-medium pl-1">{errors.street.message}</span>}
                </div>

              </form>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit" 
                form="address-form"
                className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Lưu địa chỉ
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
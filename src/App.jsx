import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import OrderDetail from './pages/OrderDetail';
import { useAuth } from './context/AuthContext';
import { useCart } from './context/CartContext';
import { createPortal } from 'react-dom';

function App() {
  const { cartCount } = useCart();
  const { user, logout, isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isPageLoading, setIsPageLoading] = useState(false);
  
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // STATE MỚI: Quản lý bật tắt thông báo chuông bằng click
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('wishlist');
      setWishlist(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('wishlist_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('wishlist_updated', handleStorageChange);
    };
  }, []);

  const handleRemoveFromWishlist = (e, itemId) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedWishlist = wishlist.filter(item => item.id !== itemId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlist_updated'));
  };

  // Tự động đóng phần thông báo khi chuyển trang
  useEffect(() => {
    setShowNotifications(false);
    
    setIsPageLoading(true);
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 1000);
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

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm px-4 sm:px-6 py-3 flex justify-between items-center transition-all">
        <Link to="/" className="text-lg font-extrabold text-blue-600 hover:text-blue-700 transition-colors tracking-tight">
          TechShop
        </Link>
        
        <div className="flex items-center gap-2 sm:gap-4">
          
          <button 
            onClick={() => setShowWishlistModal(true)}
            className="relative w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-50 hover:text-red-500 transition-colors text-gray-600"
            title="Danh sách yêu thích"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {wishlist.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-2 sm:gap-4 py-2 relative">
              
              {/* KHU VỰC NÚT CHUÔNG ĐÃ ĐƯỢC FIX */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors relative"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {(() => {
                    const orders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
                    return orders.length > 0 && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                    );
                  })()}
                </button>

                {/* POPUP THÔNG BÁO RESPONSIVE CHUẨN ĐIỆN THOẠI */}
                {showNotifications && (
                  <>
                    {/* Lớp nền trong suốt click ra ngoài tự đóng popup */}
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    
                    <div className="fixed inset-x-4 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 flex flex-col animate-[popIn_0.2s_ease-out]">
                      <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                        <p className="font-bold text-gray-800">Thông báo đơn hàng</p>
                      </div>
                      
                      <div className="max-h-64 overflow-y-auto p-2 hide-scrollbar">
                        {(() => {
                          const orders = JSON.parse(localStorage.getItem(`orders_${user.id}`)) || [];
                          if (orders.length === 0) {
                            return <p className="text-sm text-gray-500 px-2 py-4 text-center italic">Chưa có thông báo nào.</p>;
                          }
                          return orders.map((order, index) => (
                            <Link 
                              to="/orders" 
                              key={index} 
                              onClick={() => setShowNotifications(false)}
                              className="block p-3 border-b border-gray-50 last:border-0 hover:bg-blue-50/50 rounded-lg transition-colors mb-1 cursor-pointer"
                            >
                              <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-blue-600">{order.id}</span>
                                <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium whitespace-nowrap">
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-500 mb-2">{order.date}</p>
                              <div className="text-right pt-2 border-t border-dashed border-gray-200">
                                <span className="text-xs text-gray-500 mr-2">Tổng:</span>
                                <span className="text-sm font-bold text-[#ee4d2d]">{order.total.toLocaleString()} đ</span>
                              </div>
                            </Link>
                          ));
                        })()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* KHU VỰC USER PROFILE */}
              <div className="relative group">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center cursor-pointer border-2 border-gray-200 shadow-sm hover:border-blue-500 transition-colors">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>

                <div className="absolute right-0 top-full mt-1 w-52 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
                  <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <p className="font-bold text-gray-800 truncate">{user.username || user.name}</p>
                    <p className="text-xs text-gray-500">Thành viên TechShop</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link 
                      to="/orders" 
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 font-medium hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Tất cả đơn hàng
                    </Link>
                    <button 
                      onClick={logout} 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="text-xs text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors white-space-nowrap"
            >
              Đăng nhập
            </Link>
          )}

          <Link to="/cart" className="relative flex items-center gap-1 sm:gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-1.5 px-3 sm:px-4 rounded-full transition-all text-xs sm:text-sm">
            <span>🛒 <span className="hidden xs:inline">Giỏ hàng</span></span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      {/* POPUP HIỂN THỊ DANH SÁCH YÊU THÍCH */}
      {showWishlistModal && createPortal(
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999] p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setShowWishlistModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden animate-[popIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                ❤️ Danh sách yêu thích ({wishlist.length})
              </h3>
              <button 
                onClick={() => setShowWishlistModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
              {wishlist.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">
                  Chưa có sản phẩm nào trong danh sách yêu thích.
                </div>
              ) : (
                wishlist.map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setShowWishlistModal(false);
                      navigate(`/product/${item.id}`, { state: { category: item.category } });
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer relative group"
                  >
                    <div className="w-16 h-16 bg-white rounded-lg p-1 border flex items-center justify-center flex-shrink-0">
                      <img src={item.image} alt={item.title} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-xs font-bold text-gray-800 truncate mb-1">{item.title}</h4>
                      <p className="text-xs text-blue-500 font-medium mb-1">{item.category}</p>
                      <p className="text-sm font-black text-red-500">{item.price.toLocaleString()} đ</p>
                    </div>
                    <button
                      onClick={(e) => handleRemoveFromWishlist(e, item.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Xóa khỏi danh sách"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      <main className="max-w-6xl mx-auto pb-12">
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<OrderDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
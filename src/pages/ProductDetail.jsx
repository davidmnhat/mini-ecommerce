import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../context/AuthContext';
import { createPortal } from 'react-dom';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { products, loading, error } = useProducts();
  const { isLoggedIn } = useAuth();
  
  const [showNotification, setShowNotification] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  
  const [zoomScale, setZoomScale] = useState(1);
  
  const thumbnailRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('wishlist');
      setWishlist(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('wishlist_updated', handleStorageChange);
    return () => window.removeEventListener('wishlist_updated', handleStorageChange);
  }, []);

  useEffect(() => {
    setZoomScale(1);
  }, [currentImageIndex, showLightbox]);

  const product = products?.find(item => item.id === parseInt(id));
  const fromCategory = location.state?.category;

  const isFavorited = wishlist.some(item => item.id === product?.id);

  const imagesList = product?.images?.length > 0 
    ? product.images 
    : product ? [product.image, product.image, product.image] : [];
    
  const currentDisplayImage = imagesList[currentImageIndex];
  const relatedProducts = products?.filter(item => item.category === product?.category && item.id !== product?.id).slice(0, 4) || [];

  useEffect(() => {
    setCurrentImageIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  useEffect(() => {
    if (thumbnailRef.current && thumbnailRef.current.children[currentImageIndex]) {
      thumbnailRef.current.children[currentImageIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentImageIndex]);

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }
    addToCart(product);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }
    navigate('/checkout', { state: { directBuyItem: { ...product, quantity: 1 } } });
  };

  const handleToggleWishlist = () => {
    if (!isLoggedIn) {
      setIsLoginPromptOpen(true);
      return;
    }

    let updatedWishlist;
    if (isFavorited) {
      updatedWishlist = wishlist.filter(item => item.id !== product.id);
    } else {
      updatedWishlist = [...wishlist, product];
    }
    
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event('wishlist_updated'));
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    setTimeout(() => setZoomScale(1), 200); 
  };

  if (loading) return <div className="text-center mt-12 text-sm text-gray-600">Đang tải...</div>;
  if (error || !product) return <div className="text-center mt-12 text-sm text-red-500">Lỗi: Không tìm thấy sản phẩm!</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto relative">
      <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      
      {showNotification && (
        <div className="fixed top-16 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 font-medium flex items-center gap-2 text-sm">
          ✓ Đã thêm vào giỏ
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-100/70">
        <Link to="/" className="hover:text-blue-600 transition-colors font-medium">Trang chủ</Link>
        
        {fromCategory && (
          <>
            <span className="text-gray-300 font-light">/</span>
            <Link 
              to="/" 
              state={{ filteredCategory: fromCategory }} 
              className="hover:text-blue-600 transition-colors font-medium"
            >
              {fromCategory}
            </Link>
          </>
        )}

        <span className="text-gray-300 font-light">/</span>
        <span className="text-gray-700 font-semibold truncate max-w-[180px] sm:max-w-[350px]">{product.title}</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 relative">
        <div className="w-full md:w-2/5 flex flex-col gap-4">
          <div 
            className="w-full flex items-center justify-center bg-white rounded-lg p-4 border border-gray-50 cursor-zoom-in relative h-[300px] hover:shadow-md transition-shadow group"
            onClick={() => setShowLightbox(true)}
            title="Bấm để phóng to"
          >
            <img 
              src={currentDisplayImage} 
              alt={product.title} 
              className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-2 w-full">
            <button 
              onClick={prevImage}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors font-bold"
            >
              &lt;
            </button>

            <div 
              ref={thumbnailRef}
              className="flex gap-2 overflow-x-auto px-1 py-1 w-full max-w-[260px] scroll-smooth hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {imagesList.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`w-14 h-14 p-1 cursor-pointer rounded-lg border-2 transition-all flex-shrink-0 ${
                    currentImageIndex === idx ? 'border-blue-500' : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                </div>
              ))}
            </div>

            <button 
              onClick={nextImage}
              className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full transition-colors font-bold"
            >
              &gt;
            </button>
          </div>
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

          <div className="flex flex-col md:flex-row gap-3 w-full">
            <button 
              onClick={handleAddToCart}
              className="flex-1 md:flex-initial px-6 py-2.5 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-medium text-sm rounded-lg transition-all flex items-center gap-2 justify-center"
            >
              🛒 Thêm vào giỏ
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 md:flex-initial px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow transition-all flex items-center gap-2 justify-center"
            >
              ⚡ Mua ngay
            </button>
            
            <button 
              onClick={handleToggleWishlist}
              className={`p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                isFavorited 
                  ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100' 
                  : 'border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:bg-gray-50'
              }`}
              title={isFavorited ? "Xóa khỏi mục yêu thích" : "Thêm vào mục yêu thích"}
            >
              <svg className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <Link 
                to={`/product/${item.id}`} 
                state={{ category: product.category }}
                key={item.id}
                className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col h-full group"
              >
                <div className="w-full h-32 bg-gray-50 rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors flex-1 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm font-extrabold text-red-500">
                  {item.price.toLocaleString('en-US')} <span className="text-[10px] text-gray-500 font-medium">đ</span>
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {showLightbox && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col p-4 animate-[fadeIn_0.2s_ease-out]"
          onClick={closeLightbox}
        >
          <button 
            className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 bg-white/10 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors shadow-lg z-50"
            onClick={closeLightbox}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex-1 w-full h-full flex items-center justify-center overflow-auto hide-scrollbar">
            <img 
              src={currentDisplayImage} 
              alt={product.title} 
              style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
              className="max-w-full max-h-[85vh] object-contain drop-shadow-2xl transition-transform duration-100 ease-out"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>

          <div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 z-50 shadow-xl border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-white font-medium text-sm hidden sm:block">🔍 Thu phóng</span>
            <input 
              type="range" 
              min="1" 
              max="3" 
              step="0.1" 
              value={zoomScale} 
              onChange={(e) => setZoomScale(parseFloat(e.target.value))}
              className="w-32 sm:w-48 md:w-64 accent-blue-500 cursor-pointer"
            />
            <span className="text-white text-xs w-8 text-right font-bold bg-black/30 px-2 py-1 rounded-md">
              {Math.round(zoomScale * 100)}%
            </span>
          </div>
        </div>,
        document.body
      )}

      {isLoginPromptOpen && createPortal(
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-[9999]">
          <div className="bg-white p-6 rounded-xl shadow-xl w-[90%] max-w-sm text-center animate-[popIn_0.2s_ease-out]">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
            {/* Đã sửa lại dòng text này cho dùng chung được */}
            <p className="text-gray-500 mb-5 text-sm">Vui lòng đăng nhập để tiếp tục thao tác này.</p>
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
    </div>
  );
}
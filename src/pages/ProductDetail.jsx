import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../hooks/useProducts';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { products, loading, error } = useProducts();
  const [showNotification, setShowNotification] = useState(false);
  
  const [showZoom, setShowZoom] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const hideTimeoutRef = useRef(null);
  const thumbnailRef = useRef(null); 

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const product = products?.find(item => item.id === parseInt(id));

  const imagesList = product?.images?.length > 0 
    ? product.images 
    : product ? [product.image, product.image, product.image] : [];
    
  const currentDisplayImage = imagesList[currentImageIndex];

  useEffect(() => {
    setCurrentImageIndex(0);
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
    addToCart(product);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleMouseEnter = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setShowZoom(true);
  };

  const handleMouseLeave = () => {
    hideTimeoutRef.current = setTimeout(() => {
      setShowZoom(false);
    }, 150);
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
    setMousePos({ x, y });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
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

      <Link to="/" className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm mb-4">
        &larr; Quay lại
      </Link>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 relative">
        
        <div className="w-full md:w-2/5 flex flex-col gap-4">
          
          <div 
            className="w-full flex items-center justify-center bg-white rounded-lg p-4 border border-gray-50 cursor-crosshair relative h-[300px]"
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={currentDisplayImage} 
              alt={product.title} 
              className="w-full h-full object-contain pointer-events-none" 
            />
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

          <button 
            onClick={handleAddToCart}
            className="w-max px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg shadow transition-all flex items-center gap-2"
          >
            🛒 Thêm vào giỏ hàng
          </button>
        </div>

        {showZoom && (
          <div 
            className="hidden md:block fixed top-1/2 left-[5%] transform -translate-y-1/2 w-[45vw] h-[80vh] bg-white border border-gray-200 shadow-2xl rounded-xl z-[100] opacity-95 transition-opacity duration-200 cursor-crosshair"
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              backgroundImage: `url(${currentDisplayImage})`,
              backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
              backgroundSize: '250%', 
              backgroundRepeat: 'no-repeat'
            }}
          />
        )}
      </div>
    </div>
  );
}
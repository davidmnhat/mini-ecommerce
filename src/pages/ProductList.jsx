import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortType, setSortType] = useState('');
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/data/products.json');
        const cats = res.data.map(p => p.category);
        setCategories([...new Set(cats)]);
      } catch {
        setCategories([]); 
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get('/data/products.json');
        let result = response.data;

        if (search.trim() !== '') {
          result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (category !== '') {
          result = result.filter(p => p.category === category);
        }
        if (minPrice !== '') {
          result = result.filter(p => p.price >= parseFloat(minPrice));
        }
        if (maxPrice !== '') {
          result = result.filter(p => p.price <= parseFloat(maxPrice));
        }

        if (sortType === 'price-asc') {
          result.sort((a, b) => a.price - b.price);
        } else if (sortType === 'price-desc') {
          result.sort((a, b) => b.price - a.price);
        } else if (sortType === 'name-asc') {
          result.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortType === 'name-desc') {
          result.sort((a, b) => b.title.localeCompare(a.title));
        }
        
        setProducts(result);
        setCurrentPage(1);
        setError(null);
      } catch {
        setError('Không thể tải dữ liệu sản phẩm!');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFilteredProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search, category, minPrice, maxPrice, sortType]);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const currentProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSizeChange = (size) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const renderPageNumbers = () => {
    if (totalPages <= 0) return null;

    const elements = [];

    // Nếu tổng số trang ít hơn hoặc bằng 3 thì in ra hết
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        elements.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
              currentPage === i 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {i}
          </button>
        );
      }
      return elements;
    }

    // Tính toán cửa sổ 3 số
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1) {
      endPage = 3;
    } else if (currentPage === totalPages) {
      startPage = totalPages - 2;
    }

    // Dấu ... ở đầu (nếu số bắt đầu lớn hơn 1)
    if (startPage > 1) {
      elements.push(
        <span key="dots-start" className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-400 select-none">
          ...
        </span>
      );
    }

    // In ra 3 số
    for (let i = startPage; i <= endPage; i++) {
      elements.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-lg transition-all ${
            currentPage === i 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Dấu ... ở cuối (nếu số kết thúc nhỏ hơn tổng số trang)
    if (endPage < totalPages) {
      elements.push(
        <span key="dots-end" className="w-8 h-8 flex items-center justify-center text-xs font-bold text-gray-400 select-none">
          ...
        </span>
      );
    }

    return elements;
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Sản Phẩm Nổi Bật</h2>
      
      <SearchBar 
        search={search} setSearch={setSearch}
        category={category} setCategory={setCategory}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        sortType={sortType} setSortType={setSortType}
        categories={categories}
      />

      {loading ? (
        <div className="py-16 text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm font-medium animate-pulse">Đang tìm kiếm sản phẩm...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center text-red-500 text-sm font-bold">{error}</div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {currentProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Đầu
              </button>

              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Trước
              </button>
              
              {totalPages > 0 && (
                <div className="flex items-center gap-1">
                  {renderPageNumbers()}
                </div>
              )}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Sau
              </button>

              <button 
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Cuối
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
              <span>Hiển thị:</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="px-2 py-1.5 border border-gray-200 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer shadow-sm transition-all"
              >
                <option value={4}>4 sản phẩm / trang</option>
                <option value={8}>8 sản phẩm / trang</option>
                <option value={12}>12 sản phẩm / trang</option>
                <option value={16}>16 sản phẩm / trang</option>
              </select>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
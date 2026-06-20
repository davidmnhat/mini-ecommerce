import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/data/products.json');
        const cats = res.data.map(p => p.category);
        setCategories([...new Set(cats)]);
      } catch (err) {
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
        setError(null);
      } catch (err) {
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

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Sản Phẩm Nổi Bật</h2>
      
      <SearchBar 
        search={search}
        setSearch={setSearch}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
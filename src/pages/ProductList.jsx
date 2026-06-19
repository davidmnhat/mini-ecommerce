import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { useProducts } from '../hooks/useProducts';

export default function ProductList() {
  const { products, loading, error } = useProducts();
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortType, setSortType] = useState('');

  const categories = useMemo(() => {
    if (!products) return [];
    const cats = products.map(p => p.category);
    return [...new Set(cats)];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];
    let result = [...products];

    if (search.trim() !== '') {
      result = result.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase())
      );
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

    return result;
  }, [products, search, category, minPrice, maxPrice, sortType]);

  if (loading) return <div className="text-center mt-12 text-sm text-gray-600 animate-pulse">Đang tải danh sách...</div>;
  if (error) return <div className="text-center mt-12 text-sm text-red-500">{error}</div>;

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Sản Phẩm Nổi Bật</h2>
      
      <SearchBar 
        setSearch={setSearch}
        category={category} setCategory={setCategory}
        minPrice={minPrice} setMinPrice={setMinPrice}
        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
        sortType={sortType} setSortType={setSortType}
        categories={categories}
      />

      {filteredAndSortedProducts.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {filteredAndSortedProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
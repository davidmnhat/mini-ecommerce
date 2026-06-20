import React, { useState, useEffect } from 'react';

export default function SearchBar({ 
  search, setSearch, category, setCategory, minPrice, setMinPrice, maxPrice, setMaxPrice, sortType, setSortType, categories = [] 
}) {
  const [localSearch, setLocalSearch] = useState(search || '');
  const [localCategory, setLocalCategory] = useState(category || '');
  const [localMinPrice, setLocalMinPrice] = useState(minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice || '');
  const [localSortType, setLocalSortType] = useState(sortType || '');

  const MIN = 100000;
  const MAX = 50000000;
  const STEP = 100000;

  const currentMin = localMinPrice !== '' ? Number(localMinPrice) : MIN;
  const currentMax = localMaxPrice !== '' ? Number(localMaxPrice) : MAX;

  const hasParentFilter = Boolean(
    (search && search.trim() !== '') || 
    (category && category !== '') || 
    (minPrice && Number(minPrice) > MIN) || 
    (maxPrice && Number(maxPrice) < MAX) || 
    (sortType && sortType !== '')
  );

  const hasLocalFilter = Boolean(
    (localSearch && localSearch.trim() !== '') || 
    (localCategory && localCategory !== '') || 
    (currentMin > MIN) || 
    (currentMax < MAX) || 
    (localSortType && localSortType !== '')
  );

  useEffect(() => {
    if (hasParentFilter && !hasLocalFilter) {
      setSearch('');
      setCategory('');
      setMinPrice('');
      setMaxPrice('');
      setSortType('');
    }
  }, [hasLocalFilter, hasParentFilter, setSearch, setCategory, setMinPrice, setMaxPrice, setSortType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearch(localSearch);
    setCategory(localCategory);
    setMinPrice(localMinPrice);
    setMaxPrice(localMaxPrice);
    setSortType(localSortType);
  };

  const handleInputChange = (e) => {
    setLocalSearch(e.target.value);
  };

  const handleReset = () => {
    setLocalSearch('');
    setLocalCategory('');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalSortType('');
    
    setSearch('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortType('');
  };

  const minPos = ((currentMin - MIN) / (MAX - MIN)) * 100;
  const maxPos = ((currentMax - MIN) / (MAX - MIN)) * 100;

  const handleMinChange = (e) => {
    const val = Math.min(Number(e.target.value), currentMax - STEP);
    setLocalMinPrice(val.toString());
  };

  const handleMaxChange = (e) => {
    const val = Math.max(Number(e.target.value), currentMin + STEP);
    setLocalMaxPrice(val.toString());
  };

  const formatPrice = (val) => {
    if (val >= 1000000) return (val / 1000000) + 'Tr';
    return (val / 1000) + 'k';
  };

  const thumbStyles = "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-600 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-sm hover:[&::-webkit-slider-thumb]:scale-110 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-blue-600 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-sm";

  const showCancelButton = hasParentFilter && hasLocalFilter;

  const inputClass = "px-3 py-1.5 bg-gray-50/60 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500/40 focus:border-blue-500 transition-all text-xs text-gray-700 w-full";

  return (
    <div className="bg-white p-3 border border-gray-200/70 rounded-xl shadow-sm mb-6 flex flex-wrap gap-3 items-center text-xs transition-all">
      
      <form onSubmit={handleSubmit} className="flex gap-2 flex-1 min-w-[240px]">
        <input type="text" placeholder="Tìm sản phẩm..." value={localSearch} onChange={handleInputChange} className={inputClass} />
        <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-lg shadow-sm transition-colors whitespace-nowrap">
          Tìm
        </button>
        {showCancelButton && (
          <button type="button" onClick={handleReset} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap flex items-center gap-1 animate-[fadeIn_0.2s_ease-out]">
            ✕ Hủy
          </button>
        )}
      </form>

      <div className="w-full sm:w-auto min-w-[130px]">
        <select value={localCategory} onChange={(e) => setLocalCategory(e.target.value)} className={`${inputClass} cursor-pointer`}>
          <option value="">Tất cả danh mục</option>
          {categories?.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>

      <div className="group relative flex flex-col justify-center w-full sm:w-[240px] px-3 pt-6 pb-2 bg-gray-50/80 border border-gray-200 rounded-lg">
        <div className="relative w-full h-1.5 bg-gray-200 rounded-full">
          <div className="absolute h-1.5 bg-blue-600 rounded-full" style={{ left: `${minPos}%`, right: `${100 - maxPos}%` }}></div>

          <div className="absolute -top-8 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none z-30" style={{ left: `${minPos}%` }}>
            {formatPrice(currentMin)}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>

          <div className="absolute -top-8 -translate-x-1/2 bg-gray-800 text-white text-[10px] font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity pointer-events-none z-30" style={{ left: `${maxPos}%` }}>
            {formatPrice(currentMax)}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>

          <input 
            type="range" min={MIN} max={MAX} step={STEP} value={currentMin} onChange={handleMinChange} 
            className={`absolute -top-1.5 w-full appearance-none bg-transparent pointer-events-none z-20 ${thumbStyles}`} 
          />

          <input 
            type="range" min={MIN} max={MAX} step={STEP} value={currentMax} onChange={handleMaxChange} 
            className={`absolute -top-1.5 w-full appearance-none bg-transparent pointer-events-none z-20 ${thumbStyles}`} 
          />
        </div>

        <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-medium select-none">
          <span>100k</span>
          <span>50Tr</span>
        </div>
      </div>

      <div className="w-full sm:w-auto min-w-[140px]">
        <select value={localSortType} onChange={(e) => setLocalSortType(e.target.value)} className={`${inputClass} cursor-pointer`}>
          <option value="">Sắp xếp mặc định</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
          <option value="name-asc">Tên: A - Z</option>
          <option value="name-desc">Tên: Z - A</option>
        </select>
      </div>

    </div>
  );
}
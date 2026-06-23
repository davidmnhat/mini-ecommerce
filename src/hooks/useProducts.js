import { useState, useEffect } from 'react';
import axios from 'axios';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/data/products.json');
        setProducts(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Không thể tải danh sách sản phẩm!');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []); // array dependency

  return { products, loading, error };
}
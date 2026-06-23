import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const getCartKey = (user) => (user ? `cart_${user.id}` : 'guest_cart');

export function CartProvider({ children }) {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem(getCartKey(user));
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    const savedCart = localStorage.getItem(getCartKey(user));
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  }, [user]);

  const saveCart = (newCart) => {
    setCartItems(newCart);
    localStorage.setItem(getCartKey(user), JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    const existing = cartItems.find(item => item.id === product.id);
    if (existing) {
      saveCart(cartItems.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      saveCart([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    saveCart(cartItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    saveCart(cartItems.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const cartCount = cartItems.length;

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
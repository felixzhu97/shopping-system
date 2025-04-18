'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { CartItem } from './types';
import * as api from './api';

// 使用有效的MongoDB ObjectId格式
// 之前用的是字符串 'user123'，现在使用有效的24位十六进制字符串
const TEMP_USER_ID = '000000000000000000000001';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初始化时加载购物车数据
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true);
        const cartData = await api.getCart(TEMP_USER_ID);

        // 转换为前端格式
        const items = cartData.items.map((item: any) => ({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image,
        }));

        setCartItems(items);
        setError(null);
      } catch (err) {
        console.error('获取购物车失败:', err);
        setError('获取购物车失败');
        // 如果API请求失败，使用本地存储的数据
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          setCartItems(JSON.parse(storedCart));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, []);

  // 保存购物车到本地存储
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (item: CartItem) => {
    try {
      setIsLoading(true);
      setError(null);

      // 调用API添加商品到购物车
      await api.addToCart(TEMP_USER_ID, item.id, item.quantity);

      // 更新本地状态
      setCartItems(prevItems => {
        const existingItem = prevItems.find(i => i.id === item.id);

        if (existingItem) {
          return prevItems.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }

        return [...prevItems, item];
      });
    } catch (err) {
      console.error('添加商品到购物车失败:', err);
      setError('添加商品到购物车失败');

      // 发生错误时仍然更新本地状态，确保UI响应
      setCartItems(prevItems => {
        const existingItem = prevItems.find(i => i.id === item.id);

        if (existingItem) {
          return prevItems.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
          );
        }

        return [...prevItems, item];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    try {
      setIsLoading(true);
      setError(null);

      // 调用API更新数量
      await api.updateCartItem(TEMP_USER_ID, id, quantity);

      // 更新本地状态
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (err) {
      console.error('更新购物车商品数量失败:', err);
      setError('更新商品数量失败');

      // 错误时仍更新UI
      setCartItems(prevItems =>
        prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 调用API移除商品
      await api.removeFromCart(TEMP_USER_ID, id);

      // 更新本地状态
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err) {
      console.error('从购物车移除商品失败:', err);
      setError('移除商品失败');

      // 错误时仍更新UI
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 调用API清空购物车
      await api.clearCart(TEMP_USER_ID);

      // 更新本地状态
      setCartItems([]);
    } catch (err) {
      console.error('清空购物车失败:', err);
      setError('清空购物车失败');

      // 错误时仍更新UI
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isLoading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}

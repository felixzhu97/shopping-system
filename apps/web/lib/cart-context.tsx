'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import type { CartItem } from './types';
import * as api from './api';
import { useToast } from '@/components/ui/use-toast';

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
  itemCount: number; // 添加商品总数
  subtotal: number; // 添加小计金额
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// 本地存储键
const CART_STORAGE_KEY = 'shopping-cart';

// 防抖函数
const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<F>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // 计算商品总数和小计金额
  const itemCount = useMemo(
    () => cartItems.reduce((count, item) => count + item.quantity, 0),
    [cartItems]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  // 节流保存到本地存储
  const saveToLocalStorage = useCallback(
    debounce((items: CartItem[]) => {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.error('保存购物车到本地存储失败:', err);
      }
    }, 300),
    []
  );

  // 从本地存储加载购物车
  useEffect(() => {
    const loadStoredCart = () => {
      try {
        const storedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setCartItems(parsedCart);
        }
      } catch (err) {
        console.error('解析本地购物车数据失败:', err);
        // 无效的本地存储，重置它
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    };

    loadStoredCart();
    fetchCartFromApi();
  }, []);

  // 保存购物车到本地存储
  useEffect(() => {
    if (cartItems.length > 0 || localStorage.getItem(CART_STORAGE_KEY)) {
      saveToLocalStorage(cartItems);
    }
  }, [cartItems, saveToLocalStorage]);

  // 从API获取购物车，使用useCallback优化
  const fetchCartFromApi = useCallback(async () => {
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
      // 同步到本地存储
      saveToLocalStorage(items);
      setError(null);
    } catch (err) {
      console.error('获取购物车失败:', err);
      setError('获取购物车数据失败');
      // 此时保留本地存储中的数据，不做改变

      toast({
        title: '获取购物车失败',
        description: '无法从服务器加载购物车数据，已使用本地存储的数据。',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, saveToLocalStorage]);

  // 重试机制
  const retryOperation = useCallback(
    async (operation: () => Promise<any>, maxRetries = 3): Promise<any> => {
      let lastError;
      for (let retry = 0; retry < maxRetries; retry++) {
        try {
          return await operation();
        } catch (err) {
          lastError = err;
          console.warn(`操作失败，尝试重试 (${retry + 1}/${maxRetries})`, err);
          // 指数退避
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retry)));
        }
      }
      throw lastError;
    },
    []
  );

  const addToCart = useCallback(
    async (item: CartItem) => {
      try {
        setIsLoading(true);
        setError(null);

        // 立即更新UI以提高用户体验
        setCartItems(prevItems => {
          const existingItem = prevItems.find(i => i.id === item.id);

          if (existingItem) {
            return prevItems.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            );
          }

          return [...prevItems, item];
        });

        // 添加成功提示，提升用户体验
        toast({
          title: '已添加到购物车',
          description: `${item.name} × ${item.quantity}`,
          duration: 2000,
        });

        // 调用API添加商品到购物车（有重试机制）
        await retryOperation(() => api.addToCart(TEMP_USER_ID, item.id, item.quantity));
      } catch (err) {
        console.error('添加商品到购物车失败:', err);
        setError('添加商品到购物车失败');

        toast({
          title: '同步购物车失败',
          description: '商品已添加到本地购物车，但未能同步到服务器。',
          variant: 'destructive',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, retryOperation]
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      try {
        setIsLoading(true);
        setError(null);

        // 立即更新UI
        setCartItems(prevItems =>
          prevItems.map(item => (item.id === id ? { ...item, quantity } : item))
        );

        // 调用API更新数量（有重试机制）
        await retryOperation(() => api.updateCartItem(TEMP_USER_ID, id, quantity));
      } catch (err) {
        console.error('更新购物车商品数量失败:', err);
        setError('更新商品数量失败');

        toast({
          title: '同步购物车失败',
          description: '商品数量已更新到本地购物车，但未能同步到服务器。',
          variant: 'destructive',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [toast, retryOperation]
  );

  const removeFromCart = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // 获取要删除的商品信息用于提示
        const itemToRemove = cartItems.find(item => item.id === id);

        // 立即更新UI
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));

        // 添加删除提示
        if (itemToRemove) {
          toast({
            title: '已从购物车移除',
            description: itemToRemove.name,
            duration: 2000,
          });
        }

        // 调用API移除商品（有重试机制）
        await retryOperation(() => api.removeFromCart(TEMP_USER_ID, id));
      } catch (err) {
        console.error('从购物车移除商品失败:', err);
        setError('移除商品失败');

        toast({
          title: '同步购物车失败',
          description: '商品已从本地购物车移除，但未能同步到服务器。',
          variant: 'destructive',
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [cartItems, toast, retryOperation]
  );

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 立即更新UI
      setCartItems([]);

      // 清除本地存储
      localStorage.removeItem(CART_STORAGE_KEY);

      // 调用API清空购物车（有重试机制）
      await retryOperation(() => api.clearCart(TEMP_USER_ID));
    } catch (err) {
      console.error('清空购物车失败:', err);
      setError('清空购物车失败');

      toast({
        title: '同步购物车失败',
        description: '本地购物车已清空，但未能同步到服务器。',
        variant: 'destructive',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, retryOperation]);

  // 使用useMemo优化上下文值
  const contextValue = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isLoading,
      error,
      itemCount,
      subtotal,
    }),
    [
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isLoading,
      error,
      itemCount,
      subtotal,
    ]
  );

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { CartItem, Product } from '../types';
import { encryptedStorage } from '@/lib/utils/crypto';

const CART_STORAGE_KEY = 'ss-c';

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  fetchCartFromApi: () => Promise<void>;
  _calculateTotals: () => void;
}

const SHIPPING_RATE = 10; // 固定运费
const TAX_RATE = 0.13; // 13% 税率

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,

      _calculateTotals: () => {
        const items = get().items;
        const subtotal = items.reduce((total, item) => {
          const price = item.product?.price || 0;
          return total + price * item.quantity;
        }, 0);

        const shipping = items.length > 0 ? SHIPPING_RATE : 0;
        const tax = subtotal * TAX_RATE;
        const total = subtotal + shipping + tax;

        set({ subtotal, shipping, tax, total });
      },

      addToCart: (product: Product, quantity = 1) => {
        try {
          set(state => {
            const existingItem = state.items.find(item => item.productId === product.id);

            if (existingItem) {
              const updatedItems = state.items.map(item =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              );
              return { items: updatedItems };
            }

            const newItem: CartItem = {
              productId: product.id,
              quantity,
              product,
            };

            return { items: [...state.items, newItem] };
          });

          get()._calculateTotals();
        } catch (error) {
          set({ error: '添加商品到购物车时发生错误' });
        }
      },

      updateQuantity: (productId: string, quantity: number) => {
        try {
          if (quantity < 1) {
            throw new Error('商品数量必须大于 0');
          }

          set(state => ({
            items: state.items.map(item =>
              item.productId === productId ? { ...item, quantity } : item
            ),
          }));

          get()._calculateTotals();
        } catch (error) {
          set({ error: '更新商品数量时发生错误' });
        }
      },

      removeFromCart: (productId: string) => {
        try {
          set(state => ({
            items: state.items.filter(item => item.productId !== productId),
          }));

          get()._calculateTotals();
        } catch (error) {
          set({ error: '移除商品时发生错误' });
        }
      },

      clearCart: () => {
        try {
          set({ items: [] });
          get()._calculateTotals();
        } catch (error) {
          set({ error: '清空购物车时发生错误' });
        }
      },

      fetchCartFromApi: async () => {
        try {
          set({ isLoading: true, error: null });

          // TODO: 实现 API 调用
          const response = await fetch('/api/cart');
          const data = await response.json();

          set({ items: data.items });
          get()._calculateTotals();
        } catch (error) {
          set({ error: '获取购物车数据时发生错误' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      storage: {
        getItem: name => {
          const str = encryptedStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          encryptedStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: encryptedStorage.removeItem,
      },
      partialize: state => ({
        ...state,
      }),
    }
  )
);
export const useCartItems = () => useCartStore(state => state.items);
export const useCartSubtotal = () => useCartStore(state => state.subtotal);
export const useCartShipping = () => useCartStore(state => state.shipping);
export const useCartTax = () => useCartStore(state => state.tax);
export const useCartTotal = () => useCartStore(state => state.total);
export const useCartIsLoading = () => useCartStore(state => state.isLoading);
export const useCartError = () => useCartStore(state => state.error);
export const useCartAddToCart = () => useCartStore(state => state.addToCart);
export const useCartUpdateQuantity = () => useCartStore(state => state.updateQuantity);
export const useCartRemoveFromCart = () => useCartStore(state => state.removeFromCart);
export const useCartClearCart = () => useCartStore(state => state.clearCart);

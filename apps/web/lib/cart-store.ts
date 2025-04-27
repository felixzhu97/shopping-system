import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './types';
import * as api from './api';
import { toast } from '@/components/ui/use-toast';

const CART_STORAGE_KEY = 'shopping-cart';
const TEMP_USER_ID = '000000000000000000000001';

interface CartStore {
  cartItems: CartItem[];
  isLoading: boolean;
  error: string | null;
  itemCount: number;
  subtotal: number;
  addToCart: (item: CartItem) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCartFromApi: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cartItems: [],
      isLoading: false,
      error: null,
      itemCount: 0,
      subtotal: 0,

      addToCart: async (item: CartItem) => {
        try {
          set({ isLoading: true, error: null });
          await api.addToCart(TEMP_USER_ID, item.id, item.quantity);
          const updatedCart = [...get().cartItems, item];
          set({ cartItems: updatedCart });
          toast({
            title: '添加成功',
            description: '商品已添加到购物车',
          });
        } catch (err) {
          set({ error: '添加商品失败' });
          toast({
            title: '添加失败',
            description: '请稍后重试',
            variant: 'destructive',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      updateQuantity: async (id: string, quantity: number) => {
        try {
          set({ isLoading: true, error: null });
          await api.updateCartItem(TEMP_USER_ID, id, quantity);
          const updatedCart = get().cartItems.map(item =>
            item.id === id ? { ...item, quantity } : item
          );
          set({ cartItems: updatedCart });
        } catch (err) {
          set({ error: '更新数量失败' });
          toast({
            title: '更新失败',
            description: '请稍后重试',
            variant: 'destructive',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      removeFromCart: async (id: string) => {
        try {
          set({ isLoading: true, error: null });
          await api.removeFromCart(TEMP_USER_ID, id);
          const updatedCart = get().cartItems.filter(item => item.id !== id);
          set({ cartItems: updatedCart });
          toast({
            title: '删除成功',
            description: '商品已从购物车移除',
          });
        } catch (err) {
          set({ error: '删除商品失败' });
          toast({
            title: '删除失败',
            description: '请稍后重试',
            variant: 'destructive',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      clearCart: async () => {
        try {
          set({ isLoading: true, error: null });
          await api.clearCart(TEMP_USER_ID);
          set({ cartItems: [] });
          toast({
            title: '清空成功',
            description: '购物车已清空',
          });
        } catch (err) {
          set({ error: '清空购物车失败' });
          toast({
            title: '清空失败',
            description: '请稍后重试',
            variant: 'destructive',
          });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCartFromApi: async () => {
        try {
          set({ isLoading: true, error: null });
          const cart = await api.getCart(TEMP_USER_ID);
          set({ cartItems: cart.items });
        } catch (err) {
          set({ error: '获取购物车失败' });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: CART_STORAGE_KEY,
      partialize: state => ({ cartItems: state.cartItems }),
    }
  )
);

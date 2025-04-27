import { create } from 'zustand';
import * as api from './api';
import type { Product } from './types';

interface ProductStore {
  products: Product[];
  product: Product | null;
  relatedProducts: Product[];
  isLoading: boolean;
  error: string | null;
  fetchProducts: (category?: string) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  fetchRelatedProducts: (category: string, excludeId: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>(set => ({
  products: [],
  product: null,
  relatedProducts: [],
  isLoading: false,
  error: null,

  fetchProducts: async category => {
    set({ isLoading: true, error: null });
    try {
      const products = await api.getProducts(category);
      set({ products });
    } catch (err) {
      set({ error: '获取产品列表失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProduct: async id => {
    set({ isLoading: true, error: null });
    try {
      const product = await api.getProduct(id);
      set({ product });
    } catch (err) {
      set({ error: '获取产品详情失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRelatedProducts: async (category, excludeId) => {
    set({ isLoading: true, error: null });
    try {
      const products = await api.getProducts(category);
      set({ relatedProducts: products.filter((p: Product) => p.id !== excludeId).slice(0, 4) });
    } catch (err) {
      set({ error: '获取相关产品失败' });
    } finally {
      set({ isLoading: false });
    }
  },
}));

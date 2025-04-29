import { create } from 'zustand';
import * as api from '../api';
import type { Product } from '../types';

interface ProductState {
  product: Product | null;
  relatedProducts: Product[];
  productsByCategory: Record<string, Product[]>;
  productsLoadedByCategory: Record<string, boolean>;
  productsLoadingByCategory: Record<string, boolean>;
  isLoading: boolean;
  error: string | null;
  cache: {
    products: Record<string, Product>;
    categories: Record<string, Product[]>;
    timestamp: number;
  };
  fetchProduct: (productId: string) => Promise<void>;
  fetchProducts: (category: string) => Promise<void>;
  fetchRelatedProducts: (category: string, currentProductId: string) => Promise<void>;
  prefetchProduct: (productId: string) => Promise<void>;
  clearCache: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export const useProductStore = create<ProductState>((set, get) => ({
  product: null,
  relatedProducts: [],
  productsByCategory: {},
  productsLoadedByCategory: {},
  productsLoadingByCategory: {},
  isLoading: false,
  error: null,
  cache: {
    products: {},
    categories: {},
    timestamp: Date.now(),
  },

  fetchProduct: async (productId: string) => {
    try {
      // 检查缓存
      const cache = get().cache;
      if (cache.products[productId] && Date.now() - cache.timestamp < CACHE_DURATION) {
        set({ product: cache.products[productId], isLoading: false, error: null });
        return;
      }

      set({ isLoading: true, error: null });
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('获取产品信息失败');

      const product = await response.json();

      // 更新缓存
      set(state => ({
        product,
        isLoading: false,
        cache: {
          ...state.cache,
          products: {
            ...state.cache.products,
            [productId]: product,
          },
          timestamp: Date.now(),
        },
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchProducts: async (category: string) => {
    try {
      // 检查缓存
      const cache = get().cache;
      if (cache.categories[category] && Date.now() - cache.timestamp < CACHE_DURATION) {
        set(state => ({
          productsByCategory: {
            ...state.productsByCategory,
            [category]: cache.categories[category],
          },
          productsLoadedByCategory: {
            ...state.productsLoadedByCategory,
            [category]: true,
          },
          isLoading: false,
          error: null,
        }));
        return;
      }

      set({ isLoading: true, error: null });
      const response = await fetch(`/api/products${category ? `?category=${category}` : ''}`);
      if (!response.ok) throw new Error('获取产品列表失败');

      const products = await response.json();

      // 更新缓存
      set(state => ({
        productsByCategory: {
          ...state.productsByCategory,
          [category]: products,
        },
        productsLoadedByCategory: {
          ...state.productsLoadedByCategory,
          [category]: true,
        },
        isLoading: false,
        cache: {
          ...state.cache,
          categories: {
            ...state.cache.categories,
            [category]: products,
          },
          timestamp: Date.now(),
        },
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchRelatedProducts: async (category: string, currentProductId: string) => {
    try {
      const response = await fetch(
        `/api/products?category=${category}&exclude=${currentProductId}&limit=4`
      );
      if (!response.ok) throw new Error('获取相关产品失败');

      const products = await response.json();
      set({ relatedProducts: products });
    } catch (error) {
      console.error('获取相关产品失败:', error);
      set({ relatedProducts: [] });
    }
  },

  prefetchProduct: async (productId: string) => {
    try {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) return;

      const product = await response.json();

      // 只更新缓存，不更新状态
      set(state => ({
        cache: {
          ...state.cache,
          products: {
            ...state.cache.products,
            [productId]: product,
          },
          timestamp: Date.now(),
        },
      }));
    } catch (error) {
      console.error('预加载产品失败:', error);
    }
  },

  clearCache: () => {
    set(state => ({
      cache: {
        products: {},
        categories: {},
        timestamp: Date.now(),
      },
    }));
  },
}));

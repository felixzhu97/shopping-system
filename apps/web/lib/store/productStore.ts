import { create } from 'zustand';
import * as api from '../api';
import type { Product } from '../types';

interface ProductStore {
  productsByCategory: Record<string, Product[]>;
  productsLoadedByCategory: Record<string, boolean>;
  productsLoadingByCategory: Record<string, boolean>;
  product: Product | null;
  productLoadedId: string | null;
  productLoadingId: string | null;
  relatedProducts: Product[];
  relatedLoadedKey: string | null;
  relatedLoadingKey: string | null;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (category?: string) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  fetchRelatedProducts: (category: string, excludeId: string) => Promise<void>;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  productsByCategory: {},
  productsLoadedByCategory: {},
  productsLoadingByCategory: {},
  product: null,
  productLoadedId: null,
  productLoadingId: null,
  relatedProducts: [],
  relatedLoadedKey: null,
  relatedLoadingKey: null,
  isLoading: false,
  error: null,

  fetchProducts: async (category = 'all') => {
    const loadedMap = get().productsLoadedByCategory;
    const loadingMap = get().productsLoadingByCategory;
    if (loadedMap[category] || loadingMap[category]) return;
    set(state => ({
      isLoading: true,
      error: null,
      productsLoadingByCategory: { ...state.productsLoadingByCategory, [category]: true },
    }));
    try {
      const products = await api.getProducts(category === 'all' ? undefined : category);
      set(state => ({
        productsByCategory: { ...state.productsByCategory, [category]: products },
        productsLoadedByCategory: { ...state.productsLoadedByCategory, [category]: true },
        productsLoadingByCategory: { ...state.productsLoadingByCategory, [category]: false },
      }));
    } catch (err) {
      set(state => ({
        error: 'Failed to fetch products',
        productsLoadingByCategory: { ...state.productsLoadingByCategory, [category]: false },
      }));
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProduct: async id => {
    if (get().productLoadedId === id) return;
    if (get().productLoadingId === id) return;

    const cached = Object.values(get().productsByCategory)
      .flat()
      .find(p => p.id === id);
    if (cached) {
      set({ product: cached, productLoadedId: id });
      return;
    }

    set({ productLoadingId: id });
    set({ isLoading: true, error: null });
    try {
      const product = await api.getProduct(id);
      set({ product, productLoadedId: id });
    } catch (err) {
      set({ error: 'Failed to fetch product' });
    } finally {
      set({ isLoading: false, productLoadingId: null });
    }
  },

  fetchRelatedProducts: async (category, excludeId) => {
    const key = `${category}:${excludeId}:4`;
    if (get().relatedLoadedKey === key) return;
    if (get().relatedLoadingKey === key) return;

    set({ relatedLoadingKey: key });
    set({ isLoading: true, error: null });
    try {
      const recommended = await api.getRecommendations(excludeId, 4);
      const cleaned = recommended.filter((p: Product) => p.id !== excludeId).slice(0, 4);
      if (cleaned.length > 0) {
        set({ relatedProducts: cleaned, relatedLoadedKey: key });
        return;
      }

      const cachedProducts = get().productsByCategory[category];
      if (cachedProducts && cachedProducts.length > 0) {
        set({
          relatedProducts: cachedProducts.filter((p: Product) => p.id !== excludeId).slice(0, 4),
          relatedLoadedKey: key,
        });
        return;
      }

      const products = await api.getProducts(category);
      set({
        relatedProducts: products.filter((p: Product) => p.id !== excludeId).slice(0, 4),
        relatedLoadedKey: key,
      });
    } catch (err) {
      set({ error: 'Failed to fetch related products' });
    } finally {
      set({ isLoading: false, relatedLoadingKey: null });
    }
  },
}));

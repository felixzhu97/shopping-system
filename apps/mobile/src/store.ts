import { create } from "zustand";
import { Product, CartItem, ProductHelpers, CartItemHelpers } from "./types";
import { ProductService } from "./services";
import { CartCacheService } from "./infrastructure";

// 产品 Store
interface ProductState {
  products: Product[];
  recommendedProducts: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: (category?: string) => Promise<void>;
  fetchRecommendedProducts: () => Promise<void>;
  fetchProductsByCategory: (category: string) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  searchProducts: (query: string) => Product[];
  getCategories: () => string[];
  clearProducts: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  recommendedProducts: [],
  isLoading: false,
  error: null,

  fetchProducts: async (category?: string) => {
    set({ isLoading: true, error: null });
    try {
      const productService = new ProductService();
      const products = await productService.getProducts(category);
      set({ products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        isLoading: false,
      });
    }
  },

  fetchRecommendedProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const productService = new ProductService();
      const products = await productService.getRecommendedProducts();
      set({ recommendedProducts: products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        isLoading: false,
      });
    }
  },

  fetchProductsByCategory: async (category: string) => {
    set({ isLoading: true, error: null });
    try {
      const productService = new ProductService();
      const products = await productService.getProductsByCategory(category);
      set({ products, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id: string) => {
    try {
      const productService = new ProductService();
      return await productService.getProductById(id);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },

  searchProducts: (query: string) => {
    const { products } = get();
    if (!query.trim()) return products;

    const lowerQuery = query.toLowerCase();
    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const description = product.description?.toLowerCase() ?? "";
      const category = product.category?.toLowerCase() ?? "";
      return (
        name.includes(lowerQuery) ||
        description.includes(lowerQuery) ||
        category.includes(lowerQuery)
      );
    });
  },

  getCategories: () => {
    const { products } = get();
    const categories = products
      .map((product) => product.category)
      .filter((category): category is string => !!category && category !== "")
      .filter((category, index, self) => self.indexOf(category) === index)
      .sort();
    return categories;
  },

  clearProducts: () => {
    set({ products: [], recommendedProducts: [], error: null });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// 购物车 Store
interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;

  // Getters
  itemCount: number;
  isEmpty: boolean;
  subtotal: number;
  shipping: number; // 订单满200元免运费
  tax: number; // 税费 6%
  total: number;

  // Actions
  loadCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
  getQuantity: (productId: string) => number;
  clearError: () => void;
  reloadCart: () => Promise<void>;
}

const cartCache = new CartCacheService();
const CART_KEY = "@cart";

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,

  get itemCount() {
    return get().items.length;
  },

  get isEmpty() {
    return get().items.length === 0;
  },

  get subtotal() {
    return get().items.reduce(
      (total, item) => total + CartItemHelpers.subtotal(item),
      0
    );
  },

  get shipping() {
    return get().subtotal >= 200 ? 0 : 15;
  },

  get tax() {
    return get().subtotal * 0.06;
  },

  get total() {
    return get().subtotal + get().shipping + get().tax;
  },

  loadCart: async () => {
    set({ isLoading: true });
    try {
      const items = await cartCache.get(CART_KEY);
      set({ items: items || [], isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : String(error),
        isLoading: false,
      });
    }
  },

  addToCart: async (product: Product, quantity: number = 1) => {
    try {
      const { items } = get();
      set({ error: null });

      if (!product.id) {
        throw new Error("产品ID不能为空");
      }

      const existingIndex = items.findIndex(
        (item) => item.productId === product.id
      );

      let newItems: CartItem[];
      if (existingIndex >= 0) {
        // 如果商品已存在，增加数量
        const existingItem = items[existingIndex];
        newItems = [...items];
        newItems[existingIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        };
      } else {
        // 添加新商品
        const newItem: CartItem = {
          productId: product.id,
          quantity,
          name: product.name,
          image: product.image,
          price: product.price,
          description: product.description,
          product,
        };
        newItems = [...items, newItem];
      }

      set({ items: newItems });
      await cartCache.set(CART_KEY, newItems);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  updateQuantity: async (productId: string, quantity: number) => {
    try {
      const { items } = get();
      set({ error: null });

      if (quantity <= 0) {
        await get().removeFromCart(productId);
        return;
      }

      const index = items.findIndex((item) => item.productId === productId);
      if (index >= 0) {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], quantity };
        set({ items: newItems });
        await cartCache.set(CART_KEY, newItems);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  removeFromCart: async (productId: string) => {
    try {
      const { items } = get();
      set({ error: null });

      const newItems = items.filter((item) => item.productId !== productId);
      set({ items: newItems });
      await cartCache.set(CART_KEY, newItems);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  clearCart: async () => {
    try {
      set({ error: null, items: [] });
      await cartCache.clear();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ error: errorMessage });
      throw error;
    }
  },

  isInCart: (productId: string) => {
    return get().items.some((item) => item.productId === productId);
  },

  getQuantity: (productId: string) => {
    const item = get().items.find((item) => item.productId === productId);
    return item?.quantity ?? 0;
  },

  clearError: () => {
    set({ error: null });
  },

  reloadCart: async () => {
    await get().loadCart();
  },
}));

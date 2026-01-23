import AsyncStorage from "@react-native-async-storage/async-storage";
import { isArray } from "lodash";
import { CartItem } from "@/src/types";

export interface ICacheService<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class MapCacheService<T> implements ICacheService<T> {
  private cache = new Map<string, T>();

  async get(key: string): Promise<T | undefined> {
    return this.cache.get(key);
  }

  async set(key: string, value: T): Promise<void> {
    this.cache.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
}

// 购物车缓存服务
const CART_KEY = '@cart';

export class CartCacheService implements ICacheService<CartItem[]> {
  async get(key: string): Promise<CartItem[] | undefined> {
    try {
      const stored = await AsyncStorage.getItem(CART_KEY);
      if (!stored) return undefined;

      const parsed = JSON.parse(stored);
      return isArray(parsed) ? parsed : undefined;
    } catch (error) {
      console.error("Cart load error", error);
      return undefined;
    }
  }

  async set(key: string, value: CartItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(CART_KEY, JSON.stringify(value));
    } catch (error) {
      console.error("Cart save error", error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error("Cart delete error", error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CART_KEY);
    } catch (error) {
      console.error("Cart clear error", error);
    }
  }
}

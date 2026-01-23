import axios, { AxiosInstance } from "axios";
import { ApiConstants } from "./constants/api";
import { Product } from "./types";
import { ICacheService, MapCacheService } from "./infrastructure";

// API 服务类
export class ApiService {
  private static instance: ApiService;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: ApiConstants.baseUrl,
      timeout: ApiConstants.connectTimeout,
      headers: ApiConstants.defaultHeaders,
    });

    // 添加请求拦截器用于日志记录
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log("[API Request]", config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error("[API Request Error]", error);
        return Promise.reject(error);
      }
    );

    // 添加响应拦截器
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log("[API Response]", response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error("[API Response Error]", error);
        return Promise.reject(error);
      }
    );
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // 获取所有产品
  async getProducts(category?: string): Promise<Product[]> {
    try {
      const response = await this.axiosInstance.get(ApiConstants.products, {
        params: category ? { category } : undefined,
      });

      if (response.status === 200) {
        return response.data as Product[];
      } else {
        throw new Error(`获取产品列表失败: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`网络请求失败: ${error.message}`);
      }
      throw new Error(`获取产品列表失败: ${error}`);
    }
  }

  // 获取单个产品
  async getProductById(id: string): Promise<Product | null> {
    try {
      const response = await this.axiosInstance.get(
        `${ApiConstants.products}/${id}`
      );

      if (response.status === 200) {
        return response.data as Product;
      } else {
        return null;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        throw new Error(`网络请求失败: ${error.message}`);
      }
      throw new Error(`获取产品详情失败: ${error}`);
    }
  }

  // 获取推荐产品（这里简单返回前4个产品作为推荐）
  async getRecommendedProducts(): Promise<Product[]> {
    try {
      const response = await this.axiosInstance.get(ApiConstants.products);

      if (response.status === 200) {
        const products = response.data as Product[];
        // 返回前4个产品作为推荐
        return products.slice(0, 4);
      } else {
        throw new Error(`获取推荐产品失败: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`网络请求失败: ${error.message}`);
      }
      throw new Error(`获取推荐产品失败: ${error}`);
    }
  }

  // 按分类获取产品
  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await this.axiosInstance.get(ApiConstants.products, {
        params: { category },
      });

      if (response.status === 200) {
        return response.data as Product[];
      } else {
        throw new Error(`获取分类产品失败: ${response.status}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`网络请求失败: ${error.message}`);
      }
      throw new Error(`获取分类产品失败: ${error}`);
    }
  }
}

// 产品服务接口
export interface IProductService {
  getProducts(category?: string): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;
  getRecommendedProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
}

// 产品服务实现
export class ProductService implements IProductService {
  private apiService: ApiService;
  private cache: ICacheService<Product[]>;

  constructor(
    apiService: ApiService = ApiService.getInstance(),
    cache: ICacheService<Product[]> = new MapCacheService()
  ) {
    this.apiService = apiService;
    this.cache = cache;
  }

  async getProducts(category?: string): Promise<Product[]> {
    return this.apiService.getProducts(category);
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.apiService.getProductById(id);
  }

  async getRecommendedProducts(): Promise<Product[]> {
    return this.apiService.getRecommendedProducts();
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return this.apiService.getProductsByCategory(category);
  }
}

// 购物车服务接口
export interface ICartService {
  // 购物车业务逻辑将在 store 中实现
  // 这里可以添加需要服务层处理的逻辑
}

// 购物车服务实现
export class CartService implements ICartService {
  // 购物车业务逻辑主要在 store 中实现
  // 如果需要服务层处理，可以在这里添加
}

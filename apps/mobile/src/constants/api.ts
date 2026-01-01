import { Platform } from 'react-native';
import { AppConfig } from './config';

export class ApiConstants {
  // 基础 URL - Android 模拟器特殊处理
  static get baseUrl(): string {
    // Android 模拟器访问宿主机要用 10.0.2.2
    if (Platform.OS === 'android' && AppConfig.apiUrl.includes('localhost')) {
      return AppConfig.apiUrl.replace('localhost', '10.0.2.2');
    }
    return AppConfig.apiUrl;
  }

  // API 端点
  static readonly products = '/api/products';
  static readonly users = '/api/users';
  static readonly cart = '/api/cart';
  static readonly orders = '/api/orders';

  // 请求超时时间
  static readonly connectTimeout = 10000; // 10秒
  static readonly receiveTimeout = 10000; // 10秒

  // 请求头
  static readonly defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}


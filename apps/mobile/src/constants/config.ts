// 应用配置
export const AppConfig = {
  // 开发环境配置 - 从环境变量 EXPO_PUBLIC_API_URL 读取，如果未设置则使用默认值
  devApiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001',

  // 生产环境配置 - 从环境变量 EXPO_PUBLIC_API_URL 读取，如果未设置则使用默认值
  prodApiUrl: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',

  // 当前环境 - 根据 NODE_ENV 自动判断
  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },

  // 获取当前环境的 API URL
  get apiUrl(): string {
    return this.isProduction ? this.prodApiUrl : this.devApiUrl;
  },

  // 应用信息
  appName: '购物系统',
  appVersion: '1.0.0',

  // 网络配置
  connectTimeout: 10000, // 10秒
  receiveTimeout: 10000, // 10秒

  // 缓存配置
  cacheMaxAge: 300, // 5分钟
  maxCacheSize: 50, // 最大缓存条目数
};

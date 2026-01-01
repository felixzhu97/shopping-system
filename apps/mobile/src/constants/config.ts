// 应用配置
export const AppConfig = {
  // 开发环境配置
  devApiUrl: 'http://192.168.3.18:3001',

  // 生产环境配置
  prodApiUrl: 'https://your-api-domain.com',

  // 当前环境
  isProduction: false,

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


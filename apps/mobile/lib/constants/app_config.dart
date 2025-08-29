class AppConfig {
  // 开发环境配置
  static const String devApiUrl = 'http://192.168.3.18:3001';

  // 生产环境配置
  static const String prodApiUrl = 'https://your-api-domain.com';

  // 当前环境
  static const bool isProduction = false;

  // 获取当前环境的 API URL
  static String get apiUrl {
    return isProduction ? prodApiUrl : devApiUrl;
  }

  // 应用信息
  static const String appName = '购物系统';
  static const String appVersion = '1.0.0';

  // 网络配置
  static const int connectTimeout = 10000; // 10秒
  static const int receiveTimeout = 10000; // 10秒

  // 缓存配置
  static const int cacheMaxAge = 300; // 5分钟
  static const int maxCacheSize = 50; // 最大缓存条目数
}

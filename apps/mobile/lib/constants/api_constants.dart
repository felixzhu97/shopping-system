import 'dart:io';
import 'app_config.dart';
import 'package:flutter/foundation.dart';

class ApiConstants {
  // 基础 URL - Android 模拟器特殊处理
  static String get baseUrl {
    // 在web环境下直接返回配置的URL
    if (kIsWeb) {
      return AppConfig.apiUrl;
    }

    // Android 模拟器访问宿主机要用 10.0.2.2
    if (Platform.isAndroid && AppConfig.apiUrl.contains('localhost')) {
      return AppConfig.apiUrl.replaceFirst('localhost', '10.0.2.2');
    }
    return AppConfig.apiUrl;
  }

  // API 端点
  static const String products = '/api/products';
  static const String users = '/api/users';
  static const String cart = '/api/cart';
  static const String orders = '/api/orders';

  // 请求超时时间
  static const int connectTimeout = 10000; // 10秒
  static const int receiveTimeout = 10000; // 10秒

  // 请求头
  static const Map<String, String> defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

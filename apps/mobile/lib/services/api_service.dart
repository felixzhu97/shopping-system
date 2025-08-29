import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import '../constants/api_constants.dart';
import '../models/product.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late Dio _dio;

  void init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: Duration(milliseconds: ApiConstants.connectTimeout),
        receiveTimeout: Duration(milliseconds: ApiConstants.receiveTimeout),
        headers: ApiConstants.defaultHeaders,
      ),
    );

    // 添加拦截器用于日志记录
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        logPrint: (obj) => debugPrint(obj.toString()),
      ),
    );
  }

  // 获取所有产品
  Future<List<Product>> getProducts({String? category}) async {
    try {
      final response = await _dio.get(
        ApiConstants.products,
        queryParameters: category != null ? {'category': category} : null,
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Product.fromJson(json)).toList();
      } else {
        throw Exception('获取产品列表失败: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('网络请求失败: ${e.message}');
    } catch (e) {
      throw Exception('获取产品列表失败: $e');
    }
  }

  // 获取单个产品
  Future<Product> getProductById(String id) async {
    try {
      final response = await _dio.get('${ApiConstants.products}/$id');

      if (response.statusCode == 200) {
        return Product.fromJson(response.data);
      } else {
        throw Exception('获取产品详情失败: ${response.statusCode}');
      }
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw Exception('产品不存在');
      }
      throw Exception('网络请求失败: ${e.message}');
    } catch (e) {
      throw Exception('获取产品详情失败: $e');
    }
  }

  // 获取推荐产品（这里简单返回前4个产品作为推荐）
  Future<List<Product>> getRecommendedProducts() async {
    try {
      final response = await _dio.get(ApiConstants.products);

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        final products = data.map((json) => Product.fromJson(json)).toList();
        // 返回前4个产品作为推荐
        return products.take(4).toList();
      } else {
        throw Exception('获取推荐产品失败: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('网络请求失败: ${e.message}');
    } catch (e) {
      throw Exception('获取推荐产品失败: $e');
    }
  }

  // 按分类获取产品
  Future<List<Product>> getProductsByCategory(String category) async {
    try {
      final response = await _dio.get(
        ApiConstants.products,
        queryParameters: {'category': category},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        return data.map((json) => Product.fromJson(json)).toList();
      } else {
        throw Exception('获取分类产品失败: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw Exception('网络请求失败: ${e.message}');
    } catch (e) {
      throw Exception('获取分类产品失败: $e');
    }
  }
}

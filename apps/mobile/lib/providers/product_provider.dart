import 'package:flutter/foundation.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Product> _products = [];
  List<Product> _recommendedProducts = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<Product> get products => _products;
  List<Product> get recommendedProducts => _recommendedProducts;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // 初始化 API 服务
  void init() {
    _apiService.init();
  }

  // 获取所有产品
  Future<void> fetchProducts({String? category}) async {
    _setLoading(true);
    _clearError();

    try {
      _products = await _apiService.getProducts(category: category);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 获取推荐产品
  Future<void> fetchRecommendedProducts() async {
    _setLoading(true);
    _clearError();

    try {
      _recommendedProducts = await _apiService.getRecommendedProducts();
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 按分类获取产品
  Future<void> fetchProductsByCategory(String category) async {
    _setLoading(true);
    _clearError();

    try {
      _products = await _apiService.getProductsByCategory(category);
      notifyListeners();
    } catch (e) {
      _setError(e.toString());
    } finally {
      _setLoading(false);
    }
  }

  // 获取单个产品
  Future<Product?> fetchProductById(String id) async {
    try {
      return await _apiService.getProductById(id);
    } catch (e) {
      _setError(e.toString());
      return null;
    }
  }

  // 搜索产品
  List<Product> searchProducts(String query) {
    if (query.isEmpty) return _products;

    return _products.where((product) {
      final name = product.name.toLowerCase();
      final description = product.description?.toLowerCase() ?? '';
      final category = product.category?.toLowerCase() ?? '';
      final searchQuery = query.toLowerCase();

      return name.contains(searchQuery) ||
          description.contains(searchQuery) ||
          category.contains(searchQuery);
    }).toList();
  }

  // 获取所有分类
  List<String> getCategories() {
    final categories = _products
        .map((product) => product.category)
        .where((category) => category != null && category.isNotEmpty)
        .map((category) => category!)
        .toSet()
        .toList();

    categories.sort();
    return categories;
  }

  // 私有方法
  void _setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void _setError(String error) {
    _error = error;
    notifyListeners();
  }

  void _clearError() {
    _error = null;
    notifyListeners();
  }

  // 清除数据
  void clearProducts() {
    _products.clear();
    _recommendedProducts.clear();
    _error = null;
    notifyListeners();
  }
}

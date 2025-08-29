import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/cart_item.dart';
import '../models/product.dart';

class CartProvider extends ChangeNotifier {
  List<CartItem> _items = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get error => _error;
  int get itemCount => _items.length;
  bool get isEmpty => _items.isEmpty;

  // 计算总价
  double get subtotal {
    return _items.fold(0.0, (total, item) => total + item.subtotal);
  }

  // 计算运费 (订单满200元免运费)
  double get shipping {
    return subtotal >= 200 ? 0.0 : 15.0;
  }

  // 计算税费 (6%)
  double get tax {
    return subtotal * 0.06;
  }

  // 计算总价
  double get total {
    return subtotal + shipping + tax;
  }

  CartProvider() {
    _loadCart();
  }

  // 从本地存储加载购物车
  Future<void> _loadCart() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final cartJson = prefs.getString('cart');

      if (cartJson != null) {
        final List<dynamic> cartList = json.decode(cartJson);
        _items = cartList.map((item) => CartItem.fromJson(item)).toList();
      }
    } catch (e) {
      _error = '加载购物车失败: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // 保存购物车到本地存储
  Future<void> _saveCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cartJson = json.encode(
        _items.map((item) => item.toJson()).toList(),
      );
      await prefs.setString('cart', cartJson);
    } catch (e) {
      _error = '保存购物车失败: $e';
      notifyListeners();
    }
  }

  // 添加商品到购物车
  Future<void> addToCart(Product product, {int quantity = 1}) async {
    try {
      _error = null;

      final existingIndex = _items.indexWhere(
        (item) => item.productId == product.id,
      );

      if (existingIndex >= 0) {
        // 如果商品已存在，增加数量
        final existingItem = _items[existingIndex];
        _items[existingIndex] = existingItem.copyWith(
          quantity: existingItem.quantity + quantity,
        );
      } else {
        // 添加新商品
        final cartItem = CartItem(
          productId: product.id!,
          quantity: quantity,
          name: product.name,
          image: product.image,
          price: product.price,
          description: product.description,
          product: product,
        );
        _items.add(cartItem);
      }

      await _saveCart();
      notifyListeners();
    } catch (e) {
      _error = '添加商品失败: $e';
      notifyListeners();
      rethrow;
    }
  }

  // 更新商品数量
  Future<void> updateQuantity(String productId, int quantity) async {
    try {
      _error = null;

      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      final index = _items.indexWhere((item) => item.productId == productId);
      if (index >= 0) {
        _items[index] = _items[index].copyWith(quantity: quantity);
        await _saveCart();
        notifyListeners();
      }
    } catch (e) {
      _error = '更新数量失败: $e';
      notifyListeners();
      rethrow;
    }
  }

  // 从购物车移除商品
  Future<void> removeFromCart(String productId) async {
    try {
      _error = null;

      _items.removeWhere((item) => item.productId == productId);
      await _saveCart();
      notifyListeners();
    } catch (e) {
      _error = '移除商品失败: $e';
      notifyListeners();
      rethrow;
    }
  }

  // 清空购物车
  Future<void> clearCart() async {
    try {
      _error = null;

      _items.clear();
      await _saveCart();
      notifyListeners();
    } catch (e) {
      _error = '清空购物车失败: $e';
      notifyListeners();
      rethrow;
    }
  }

  // 检查商品是否在购物车中
  bool isInCart(String productId) {
    return _items.any((item) => item.productId == productId);
  }

  // 获取商品在购物车中的数量
  int getQuantity(String productId) {
    final item = _items.firstWhere(
      (item) => item.productId == productId,
      orElse: () => CartItem(productId: '', quantity: 0),
    );
    return item.quantity;
  }

  // 清除错误
  void clearError() {
    _error = null;
    notifyListeners();
  }

  // 重新加载购物车
  Future<void> reloadCart() async {
    await _loadCart();
  }
}

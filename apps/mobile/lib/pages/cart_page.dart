import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/cart_item.dart';
import '../providers/cart_provider.dart';
import 'product_detail_page.dart';

class CartPage extends StatefulWidget {
  const CartPage({super.key});

  @override
  State<CartPage> createState() => _CartPageState();
}

class _CartPageState extends State<CartPage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('购物车'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          Consumer<CartProvider>(
            builder: (context, cartProvider, child) {
              if (cartProvider.items.isNotEmpty) {
                return PopupMenuButton<String>(
                  onSelected: (value) {
                    if (value == 'clear') {
                      _showClearCartDialog(context);
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(value: 'clear', child: Text('清空购物车')),
                  ],
                  child: const Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Icon(Icons.more_vert),
                  ),
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: Consumer<CartProvider>(
        builder: (context, cartProvider, child) {
          if (cartProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (cartProvider.error != null) {
            return _buildErrorState(cartProvider);
          }

          if (cartProvider.items.isEmpty) {
            return _buildEmptyState();
          }

          return Column(
            children: [
              // 购物车商品列表
              Expanded(child: _buildCartList(cartProvider)),
              // 订单摘要
              _buildOrderSummary(cartProvider),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCartList(CartProvider cartProvider) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: cartProvider.items.length,
      itemBuilder: (context, index) {
        final item = cartProvider.items[index];
        return _buildCartItem(item, cartProvider);
      },
    );
  }

  Widget _buildCartItem(CartItem item, CartProvider cartProvider) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 商品图片
            GestureDetector(
              onTap: () {
                if (item.productId.isNotEmpty) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) =>
                          ProductDetailPage(productId: item.productId),
                    ),
                  );
                }
              },
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: item.image != null && item.image!.isNotEmpty
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: Image.network(
                          item.image!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[300],
                              child: const Icon(
                                Icons.image,
                                size: 32,
                                color: Colors.grey,
                              ),
                            );
                          },
                        ),
                      )
                    : Container(
                        color: Colors.grey[300],
                        child: const Icon(
                          Icons.image,
                          size: 32,
                          color: Colors.grey,
                        ),
                      ),
              ),
            ),

            const SizedBox(width: 16),

            // 商品信息
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 商品名称
                  GestureDetector(
                    onTap: () {
                      if (item.productId.isNotEmpty) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                ProductDetailPage(productId: item.productId),
                          ),
                        );
                      }
                    },
                    child: Text(
                      item.name ?? '未知商品',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF1D1D1F),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),

                  const SizedBox(height: 4),

                  // 商品价格
                  Text(
                    '¥${(item.price ?? 0).toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 14, color: Colors.grey),
                  ),

                  const SizedBox(height: 12),

                  // 数量控制和操作
                  Row(
                    children: [
                      // 数量控制
                      _buildQuantityControl(item, cartProvider),

                      const Spacer(),

                      // 删除按钮
                      IconButton(
                        onPressed: () =>
                            _showRemoveItemDialog(context, item, cartProvider),
                        icon: const Icon(
                          Icons.delete_outline,
                          color: Colors.red,
                        ),
                      ),

                      // 小计
                      Text(
                        '¥${item.subtotal.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuantityControl(CartItem item, CartProvider cartProvider) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey[300]!),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // 减少按钮
          IconButton(
            onPressed: item.quantity > 1
                ? () => cartProvider.updateQuantity(
                    item.productId,
                    item.quantity - 1,
                  )
                : null,
            icon: const Icon(Icons.remove, size: 16),
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            padding: EdgeInsets.zero,
          ),

          // 数量显示
          Container(
            width: 40,
            alignment: Alignment.center,
            child: Text(
              item.quantity.toString(),
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500),
            ),
          ),

          // 增加按钮
          IconButton(
            onPressed: () =>
                cartProvider.updateQuantity(item.productId, item.quantity + 1),
            icon: const Icon(Icons.add, size: 16),
            constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            padding: EdgeInsets.zero,
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummary(CartProvider cartProvider) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        boxShadow: [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        children: [
          // 价格明细
          Column(
            children: [
              _buildPriceRow('小计', cartProvider.subtotal),
              _buildPriceRow('运费', cartProvider.shipping, isShipping: true),
              _buildPriceRow('税费', cartProvider.tax),
              const Divider(),
              _buildPriceRow('总计', cartProvider.total, isTotal: true),
            ],
          ),

          const SizedBox(height: 16),

          // 结账按钮
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _handleCheckout(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                '立即结账',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
              ),
            ),
          ),

          const SizedBox(height: 8),

          // 继续购物按钮
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {
                // 切换到首页
                DefaultTabController.of(context).animateTo(0);
              },
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text(
                '继续购物',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow(
    String label,
    double amount, {
    bool isShipping = false,
    bool isTotal = false,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isShipping && amount == 0
                  ? Colors.green
                  : Colors.grey[700],
            ),
          ),
          Text(
            amount == 0 && isShipping ? '免费' : '¥${amount.toStringAsFixed(2)}',
            style: TextStyle(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
              color: isTotal ? Colors.blue : Colors.grey[700],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            '购物车是空的',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '快去添加一些商品吧',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              // 切换到首页
              DefaultTabController.of(context).animateTo(0);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            child: const Text('去购物'),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(CartProvider cartProvider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: Colors.red[400]),
          const SizedBox(height: 16),
          Text(
            '加载失败',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            cartProvider.error!,
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: () {
              cartProvider.clearError();
              // 重新加载购物车
              cartProvider.reloadCart();
            },
            child: const Text('重试'),
          ),
        ],
      ),
    );
  }

  void _showRemoveItemDialog(
    BuildContext context,
    CartItem item,
    CartProvider cartProvider,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('确认删除'),
        content: Text('确定要从购物车中删除"${item.name}"吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              cartProvider.removeFromCart(item.productId);
              Navigator.of(context).pop();
            },
            child: const Text('删除', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _showClearCartDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('确认清空'),
        content: const Text('确定要清空购物车吗？此操作不可撤销。'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              context.read<CartProvider>().clearCart();
              Navigator.of(context).pop();
            },
            child: const Text('清空', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _handleCheckout(BuildContext context) {
    final cartProvider = context.read<CartProvider>();
    if (cartProvider.items.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('购物车是空的，请先添加商品'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    // TODO: 跳转到结账页面
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('结账功能开发中...'), backgroundColor: Colors.blue),
    );
  }
}

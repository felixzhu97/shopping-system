import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/product.dart';
import '../providers/product_provider.dart';
import 'product_detail_page.dart';

class CategoriesPage extends StatefulWidget {
  const CategoriesPage({super.key});

  @override
  State<CategoriesPage> createState() => _CategoriesPageState();
}

class _CategoriesPageState extends State<CategoriesPage> {
  String _selectedCategory = 'all';
  String _sortBy = 'featured';
  List<Product> _filteredProducts = [];
  bool _isLoading = false;

  final List<CategoryItem> _categories = [
    CategoryItem(
      id: 'all',
      name: '全部商品',
      description: '浏览所有精选商品',
      icon: Icons.all_inclusive,
      color: Colors.blue,
    ),
    CategoryItem(
      id: 'electronics',
      name: '电子产品',
      description: '智能设备与科技产品',
      icon: Icons.devices,
      color: Colors.indigo,
    ),
    CategoryItem(
      id: 'clothing',
      name: '服装',
      description: '时尚服饰与配饰',
      icon: Icons.checkroom,
      color: Colors.pink,
    ),
    CategoryItem(
      id: 'home-kitchen',
      name: '家居厨房',
      description: '家居用品与厨房电器',
      icon: Icons.home,
      color: Colors.orange,
    ),
    CategoryItem(
      id: 'books',
      name: '图书',
      description: '知识书籍与文学作品',
      icon: Icons.book,
      color: Colors.green,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final productProvider = context.read<ProductProvider>();
      await productProvider.fetchProducts(
        category: _selectedCategory == 'all' ? null : _selectedCategory,
      );

      _filterAndSortProducts();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('加载失败: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _filterAndSortProducts() {
    final productProvider = context.read<ProductProvider>();
    List<Product> products = productProvider.products;

    // 排序
    switch (_sortBy) {
      case 'price-asc':
        products.sort((a, b) => a.price.compareTo(b.price));
        break;
      case 'price-desc':
        products.sort((a, b) => b.price.compareTo(a.price));
        break;
      case 'rating':
        products.sort((a, b) => (b.rating ?? 0).compareTo(a.rating ?? 0));
        break;
      case 'featured':
      default:
        // 保持原有顺序
        break;
    }

    setState(() {
      _filteredProducts = products;
    });
  }

  void _onCategoryChanged(String categoryId) {
    setState(() {
      _selectedCategory = categoryId;
    });
    _loadProducts();
  }

  void _onSortChanged(String sortBy) {
    setState(() {
      _sortBy = sortBy;
    });
    _filterAndSortProducts();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('商品分类'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          PopupMenuButton<String>(
            onSelected: _onSortChanged,
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'featured', child: Text('推荐')),
              const PopupMenuItem(value: 'price-asc', child: Text('价格从低到高')),
              const PopupMenuItem(value: 'price-desc', child: Text('价格从高到低')),
              const PopupMenuItem(value: 'rating', child: Text('评分')),
            ],
            child: const Padding(
              padding: EdgeInsets.all(16.0),
              child: Icon(Icons.sort),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // 分类选择器
          _buildCategorySelector(),

          // 产品列表
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredProducts.isEmpty
                ? _buildEmptyState()
                : _buildProductGrid(),
          ),
        ],
      ),
    );
  }

  Widget _buildCategorySelector() {
    return Container(
      height: 120,
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _categories.length,
        itemBuilder: (context, index) {
          final category = _categories[index];
          final isSelected = category.id == _selectedCategory;

          return GestureDetector(
            onTap: () => _onCategoryChanged(category.id),
            child: Container(
              width: 100,
              margin: const EdgeInsets.only(right: 12),
              decoration: BoxDecoration(
                color: isSelected ? category.color : Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    category.icon,
                    size: 32,
                    color: isSelected ? Colors.white : category.color,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    category.name,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: isSelected ? Colors.white : Colors.black87,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildProductGrid() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.75,
        crossAxisSpacing: 16,
        mainAxisSpacing: 16,
      ),
      itemCount: _filteredProducts.length,
      itemBuilder: (context, index) {
        final product = _filteredProducts[index];
        return _buildProductCard(product);
      },
    );
  }

  Widget _buildProductCard(Product product) {
    return GestureDetector(
      onTap: () {
        if (product.id != null && product.id!.isNotEmpty) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ProductDetailPage(productId: product.id!),
            ),
          );
        }
      },
      child: Container(
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
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 产品图片
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(16),
                  ),
                ),
                child: product.image != null && product.image!.isNotEmpty
                    ? ClipRRect(
                        borderRadius: const BorderRadius.vertical(
                          top: Radius.circular(16),
                        ),
                        child: Image.network(
                          product.image!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Container(
                              color: Colors.grey[300],
                              child: const Icon(
                                Icons.image,
                                size: 48,
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
                          size: 48,
                          color: Colors.grey,
                        ),
                      ),
              ),
            ),

            // 产品信息
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // 产品名称
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: Color(0xFF1D1D1F),
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),

                    const SizedBox(height: 4),

                    // 评分
                    if (product.rating != null)
                      Row(
                        children: [
                          Row(
                            children: List.generate(5, (index) {
                              return Icon(
                                index < (product.rating ?? 0).floor()
                                    ? Icons.star
                                    : Icons.star_border,
                                size: 12,
                                color: index < (product.rating ?? 0).floor()
                                    ? Colors.amber
                                    : Colors.grey,
                              );
                            }),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            (product.rating ?? 0).toStringAsFixed(1),
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),

                    const Spacer(),

                    // 价格
                    Row(
                      children: [
                        Text(
                          '¥${product.price.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.blue,
                          ),
                        ),
                        if (product.originalPrice != null) ...[
                          const SizedBox(width: 4),
                          Text(
                            '¥${product.originalPrice!.toStringAsFixed(2)}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            '暂无商品',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: Colors.grey[600],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '该分类下暂时没有商品',
            style: TextStyle(fontSize: 14, color: Colors.grey[500]),
          ),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadProducts, child: const Text('重新加载')),
        ],
      ),
    );
  }
}

class CategoryItem {
  final String id;
  final String name;
  final String description;
  final IconData icon;
  final Color color;

  CategoryItem({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    required this.color,
  });
}

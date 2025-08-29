import 'dart:async';
import 'package:flutter/material.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class ProductDetailPage extends StatefulWidget {
  final String productId;

  const ProductDetailPage({super.key, required this.productId});

  @override
  State<ProductDetailPage> createState() => _ProductDetailPageState();
}

class _ProductDetailPageState extends State<ProductDetailPage>
    with TickerProviderStateMixin {
  Product? _product;
  List<Product> _relatedProducts = [];
  bool _isLoading = true;
  String? _error;
  int _quantity = 1;
  int _selectedImageIndex = 0;
  bool _isAddToCartLoading = false;
  bool _isBuyNowLoading = false;
  bool _addedToCart = false;
  late TabController _tabController;
  final PageController _imagePageController = PageController();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadProduct();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _imagePageController.dispose();
    super.dispose();
  }

  Future<void> _loadProduct() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final apiService = ApiService();
      apiService.init();

      final product = await apiService.getProductById(widget.productId);
      if (product != null && product.id != null) {
        setState(() {
          _product = product;
          _isLoading = false;
        });

        // 加载相关产品
        _loadRelatedProducts(product.category ?? '');
      } else {
        setState(() {
          _error = '产品不存在';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _loadRelatedProducts(String category) async {
    try {
      final apiService = ApiService();
      final products = await apiService.getProductsByCategory(category);
      setState(() {
        _relatedProducts = products
            .where((p) => p.id != widget.productId)
            .take(4)
            .toList();
      });
    } catch (e) {
      // 忽略相关产品加载错误
    }
  }

  void _onQuantityChanged(int delta) {
    setState(() {
      _quantity = (_quantity + delta).clamp(1, _product?.stock ?? 99);
    });
  }

  Future<void> _addToCart() async {
    if (_product == null) return;

    setState(() {
      _isAddToCartLoading = true;
    });

    try {
      // TODO: 实现添加到购物车的逻辑
      await Future.delayed(const Duration(seconds: 1)); // 模拟网络请求

      setState(() {
        _addedToCart = true;
        _isAddToCartLoading = false;
      });

      // 显示成功提示
      if (mounted && _product != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${_product!.name} × $_quantity 已添加到购物车'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 2),
          ),
        );
      }

      // 2秒后重置状态
      Timer(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            _addedToCart = false;
          });
        }
      });
    } catch (e) {
      setState(() {
        _isAddToCartLoading = false;
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('添加到购物车失败: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  Future<void> _buyNow() async {
    if (_product == null) return;

    setState(() {
      _isBuyNowLoading = true;
    });

    try {
      // TODO: 实现立即购买的逻辑
      await Future.delayed(const Duration(seconds: 1)); // 模拟网络请求

      if (mounted) {
        // 跳转到结算页面
        Navigator.pushNamed(context, '/checkout');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('购买失败: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() {
        _isBuyNowLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('产品详情'),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.share),
            onPressed: () {
              // TODO: 实现分享功能
            },
          ),
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {
              // TODO: 实现收藏功能
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
          ? _buildErrorWidget()
          : _product != null
          ? _buildProductDetail()
          : const Center(child: Text('产品不存在')),
    );
  }

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error_outline, size: 64, color: Colors.red),
          const SizedBox(height: 16),
          Text(
            '加载失败: $_error',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _loadProduct, child: const Text('重试')),
        ],
      ),
    );
  }

  Widget _buildProductDetail() {
    if (_product == null) {
      return const Center(child: Text('产品不存在'));
    }

    final product = _product!;
    final images = product.getAllImages();

    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 产品图片轮播
          _buildImageCarousel(images),

          // 产品信息
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 类别和名称
                _buildProductHeader(product),

                const SizedBox(height: 16),

                // 价格信息
                _buildPriceSection(product),

                const SizedBox(height: 16),

                // 库存和配送信息
                _buildStockAndShipping(product),

                const SizedBox(height: 16),

                // 数量选择器
                _buildQuantitySelector(),

                const SizedBox(height: 24),

                // 操作按钮
                _buildActionButtons(),

                const SizedBox(height: 24),

                // 产品详情选项卡
                _buildProductTabs(),

                const SizedBox(height: 24),

                // 相关产品
                if (_relatedProducts.isNotEmpty) _buildRelatedProducts(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageCarousel(List<String> images) {
    if (images.isEmpty) {
      return Container(
        height: 300,
        color: Colors.grey[200],
        child: const Center(
          child: Icon(Icons.image, size: 64, color: Colors.grey),
        ),
      );
    }

    return SizedBox(
      height: 300,
      child: Stack(
        children: [
          // 图片轮播
          PageView.builder(
            controller: _imagePageController,
            onPageChanged: (index) {
              setState(() {
                _selectedImageIndex = index;
              });
            },
            itemCount: images.length,
            itemBuilder: (context, index) {
              return GestureDetector(
                onTap: () => _showFullscreenImage(images[index]),
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(color: Colors.grey[100]),
                  child: Image.network(
                    images[index],
                    fit: BoxFit.contain,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: Colors.grey[300],
                        child: const Icon(
                          Icons.image,
                          size: 64,
                          color: Colors.grey,
                        ),
                      );
                    },
                  ),
                ),
              );
            },
          ),

          // 图片指示器
          if (images.length > 1)
            Positioned(
              bottom: 16,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  images.length,
                  (index) => Container(
                    width: 8,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _selectedImageIndex == index
                          ? Colors.white
                          : Colors.white.withValues(alpha: 0.5),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProductHeader(Product product) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // 类别标签
        if (product.category != null)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.blue[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              _getCategoryLabel(product.category!),
              style: TextStyle(
                color: Colors.blue[600],
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),

        const SizedBox(height: 8),

        // 产品名称
        Text(
          product.name,
          style: const TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Color(0xFF1D1D1F),
          ),
        ),

        const SizedBox(height: 8),

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
                    size: 16,
                    color: index < (product.rating ?? 0).floor()
                        ? Colors.amber
                        : Colors.grey,
                  );
                }),
              ),
              const SizedBox(width: 8),
              Text(
                '${(product.rating ?? 0).toStringAsFixed(1)} (${product.reviewCount ?? 0} 评价)',
                style: const TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ],
          ),
      ],
    );
  }

  Widget _buildPriceSection(Product product) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.baseline,
          textBaseline: TextBaseline.alphabetic,
          children: [
            Text(
              '¥${product.price.toStringAsFixed(2)}',
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1D1D1F),
              ),
            ),
            if (product.originalPrice != null) ...[
              const SizedBox(width: 12),
              Text(
                '¥${product.originalPrice!.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 16,
                  color: Colors.grey,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            ],
          ],
        ),
        if (product.discountPercentage != null) ...[
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.red[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              '节省 ¥${(product.originalPrice! - product.price).toStringAsFixed(2)} (${product.discountPercentage!.toInt()}% 折扣)',
              style: TextStyle(
                color: Colors.red[600],
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildStockAndShipping(Product product) {
    return Column(
      children: [
        // 库存状态
        Row(
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: product.hasStock ? Colors.green : Colors.red,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              product.hasStock ? '有库存' : '缺货',
              style: TextStyle(
                color: product.hasStock ? Colors.green : Colors.red,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),

        const SizedBox(height: 8),

        // 配送信息
        Row(
          children: [
            Icon(Icons.local_shipping, size: 16, color: Colors.green[600]),
            const SizedBox(width: 8),
            Text(
              '满¥200包邮，预计1-3天送达',
              style: TextStyle(color: Colors.green[600], fontSize: 14),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildQuantitySelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '数量',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey[300] ?? Colors.grey),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: _quantity > 1
                        ? () => _onQuantityChanged(-1)
                        : null,
                    icon: const Icon(Icons.remove),
                    iconSize: 20,
                  ),
                  SizedBox(
                    width: 40,
                    child: Text(
                      '$_quantity',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: _quantity < (_product?.stock ?? 99)
                        ? () => _onQuantityChanged(1)
                        : null,
                    icon: const Icon(Icons.add),
                    iconSize: 20,
                  ),
                ],
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionButtons() {
    return Column(
      children: [
        // 添加到购物车按钮
        SizedBox(
          width: double.infinity,
          height: 48,
          child: ElevatedButton(
            onPressed: _product?.hasStock == true && !_isAddToCartLoading
                ? _addToCart
                : null,
            style: ElevatedButton.styleFrom(
              backgroundColor: _addedToCart ? Colors.green : Colors.blue,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
            ),
            child: _isAddToCartLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : _addedToCart
                ? const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.check, size: 20),
                      SizedBox(width: 8),
                      Text('已添加到购物车'),
                    ],
                  )
                : const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.shopping_cart, size: 20),
                      SizedBox(width: 8),
                      Text('添加到购物车'),
                    ],
                  ),
          ),
        ),

        const SizedBox(height: 12),

        // 立即购买按钮
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton(
            onPressed: _product?.hasStock == true && !_isBuyNowLoading
                ? _buyNow
                : null,
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.blue, width: 2),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(24),
              ),
            ),
            child: _isBuyNowLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.blue),
                    ),
                  )
                : const Text(
                    '立即购买',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildProductTabs() {
    return Column(
      children: [
        // 选项卡标题
        Container(
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(24),
          ),
          child: TabBar(
            controller: _tabController,
            indicator: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            labelColor: Colors.black,
            unselectedLabelColor: Colors.grey,
            tabs: const [
              Tab(text: '详情'),
              Tab(text: '配送'),
              Tab(text: '评价'),
            ],
          ),
        ),

        const SizedBox(height: 16),

        // 选项卡内容
        SizedBox(
          height: 400,
          child: TabBarView(
            controller: _tabController,
            children: [
              _buildDetailsTab(),
              _buildShippingTab(),
              _buildReviewsTab(),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDetailsTab() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 产品描述
          if (_product?.description != null) ...[
            const Text(
              '产品描述',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text(
              _product!.description ?? '',
              style: const TextStyle(
                fontSize: 14,
                color: Colors.grey,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 16),
          ],

          // 产品特性
          const Text(
            '产品特性',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          _buildFeatureItem('高品质材料'),
          _buildFeatureItem('精美设计'),
          _buildFeatureItem('多功能'),
          _buildFeatureItem('环保材质'),

          const SizedBox(height: 16),

          // 规格参数
          const Text(
            '规格参数',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              children: [
                _buildSpecItem('品牌', '高品质品牌'),
                _buildSpecItem('型号', 'Pro 2023'),
                _buildSpecItem('尺寸', '中等'),
                _buildSpecItem('材质', '高品质材料'),
                _buildSpecItem('保修', '一年'),
                _buildSpecItem('产地', '中国'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(String feature) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.blue[100],
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.check, size: 16, color: Colors.blue[600]),
          ),
          const SizedBox(width: 12),
          Text(feature),
        ],
      ),
    );
  }

  Widget _buildSpecItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.grey, fontSize: 14)),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildShippingTab() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '配送信息',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              '我们提供全国配送服务。标准配送时间为1-3个工作日，偏远地区可能需要额外1-3天。订单满200元免费配送，配送费为15元。',
              style: TextStyle(fontSize: 14, color: Colors.grey, height: 1.5),
            ),
          ),

          const SizedBox(height: 16),

          const Text(
            '退换政策',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[50],
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              '商品签收后7天内，如发现质量问题，可申请退换货。退换货时请保持商品原包装完整，不影响二次销售。',
              style: TextStyle(fontSize: 14, color: Colors.grey, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewsTab() {
    final reviews = [
      {
        'name': '张先生',
        'rating': 5,
        'date': '2023年12月15日',
        'comment': '非常满意的购物体验，产品质量超出预期，快递很快，包装也很好，会继续支持！',
      },
      {
        'name': '李女士',
        'rating': 4,
        'date': '2023年11月28日',
        'comment': '整体不错，使用了一周感觉质量可靠，就是价格稍贵了点，希望有更多优惠活动。',
      },
      {
        'name': '王先生',
        'rating': 5,
        'date': '2023年10月17日',
        'comment': '朋友推荐购买的，确实名不虚传，各方面都很好，尤其是做工和质感，非常推荐！',
      },
    ];

    return ListView.builder(
      itemCount: reviews.length,
      itemBuilder: (context, index) {
        final review = reviews[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    review['name'] as String,
                    style: const TextStyle(fontWeight: FontWeight.w500),
                  ),
                  Text(
                    review['date'] as String,
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: List.generate(5, (i) {
                  return Icon(
                    i < (review['rating'] as int)
                        ? Icons.star
                        : Icons.star_border,
                    size: 16,
                    color: i < (review['rating'] as int)
                        ? Colors.amber
                        : Colors.grey,
                  );
                }),
              ),
              const SizedBox(height: 8),
              Text(
                review['comment'] as String,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                  height: 1.5,
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRelatedProducts() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '相关推荐',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 200,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _relatedProducts.length,
            itemBuilder: (context, index) {
              final product = _relatedProducts[index];
              return Container(
                width: 150,
                margin: const EdgeInsets.only(right: 16),
                child: GestureDetector(
                  onTap: () {
                    if (product.id != null) {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (context) =>
                              ProductDetailPage(productId: product.id!),
                        ),
                      );
                    }
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        height: 120,
                        decoration: BoxDecoration(
                          color: Colors.grey[100],
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child:
                            product.image != null && product.image!.isNotEmpty
                            ? ClipRRect(
                                borderRadius: BorderRadius.circular(12),
                                child: Image.network(
                                  product.image!,
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
                      const SizedBox(height: 8),
                      Text(
                        product.name,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '¥${product.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  void _showFullscreenImage(String imageUrl) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          backgroundColor: Colors.black,
          appBar: AppBar(
            backgroundColor: Colors.transparent,
            elevation: 0,
            iconTheme: const IconThemeData(color: Colors.white),
          ),
          body: Center(
            child: InteractiveViewer(
              child: Image.network(
                imageUrl,
                fit: BoxFit.contain,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    color: Colors.grey[800],
                    child: const Icon(
                      Icons.image,
                      size: 64,
                      color: Colors.grey,
                    ),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }

  String _getCategoryLabel(String category) {
    const categoryMap = {
      'electronics': '电子产品',
      'clothing': '服装',
      'home-kitchen': '家居厨房',
      'books': '图书',
    };

    return categoryMap[category] ?? category;
  }
}

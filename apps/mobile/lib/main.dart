import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/product_provider.dart';
import 'models/product.dart';
import 'pages/product_detail_page.dart';

void main() {
  runApp(const ShoppingApp());
}

class ShoppingApp extends StatelessWidget {
  const ShoppingApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ProductProvider()..init()),
      ],
      child: MaterialApp(
        title: '购物系统',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF2563EB),
            brightness: Brightness.light,
          ),
          useMaterial3: true,
          appBarTheme: const AppBarTheme(centerTitle: true, elevation: 0),
        ),
        home: const ShoppingHomePage(),
      ),
    );
  }
}

class ShoppingHomePage extends StatefulWidget {
  const ShoppingHomePage({super.key});

  @override
  State<ShoppingHomePage> createState() => _ShoppingHomePageState();
}

class _ShoppingHomePageState extends State<ShoppingHomePage> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = <Widget>[
    HomeTab(),
    CategoriesTab(),
    CartTab(),
    ProfileTab(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: '首页'),
          BottomNavigationBarItem(icon: Icon(Icons.category), label: '分类'),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_cart),
            label: '购物车',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: '我的'),
        ],
      ),
    );
  }
}

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  @override
  void initState() {
    super.initState();
    // 页面加载时自动获取推荐产品
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        final productProvider = context.read<ProductProvider>();
        productProvider.init(); // 确保API服务初始化
        productProvider.fetchRecommendedProducts();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('购物系统'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {
              // TODO: 实现搜索功能
            },
          ),
          IconButton(
            icon: const Icon(Icons.notifications),
            onPressed: () {
              // TODO: 实现通知功能
            },
          ),
        ],
      ),
      body: Consumer<ProductProvider>(
        builder: (context, productProvider, child) {
          return RefreshIndicator(
            onRefresh: () async {
              await productProvider.fetchRecommendedProducts();
            },
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                children: [
                  // 轮播图区域
                  _buildCarouselSection(),

                  // 商店标语
                  _buildStoreHeadline(),

                  // 产品展示区域
                  _buildProductShowcase(productProvider),

                  // 促销活动区域
                  _buildPromoSection(),

                  // 快捷功能区域
                  _buildQuickActions(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // 轮播图区域
  Widget _buildCarouselSection() {
    return const CarouselWidget();
  }

  // 商店标语
  Widget _buildStoreHeadline() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 40, horizontal: 24),
      color: const Color(0xFFF5F5F7),
      child: const Text(
        '所有产品都经过精心设计，为您提供卓越的用户体验',
        style: TextStyle(fontSize: 20, color: Color(0xFF1D1D1F)),
        textAlign: TextAlign.center,
      ),
    );
  }

  // 产品展示区域
  Widget _buildProductShowcase(ProductProvider productProvider) {
    if (productProvider.isLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (productProvider.error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text(
                '加载失败: ${productProvider.error}',
                textAlign: TextAlign.center,
                style: const TextStyle(fontSize: 16),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  productProvider.fetchRecommendedProducts();
                },
                child: const Text('重试'),
              ),
            ],
          ),
        ),
      );
    }

    if (productProvider.recommendedProducts.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(32.0),
          child: Text(
            '暂无推荐商品',
            style: TextStyle(fontSize: 16, color: Colors.grey),
          ),
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 主要产品展示（大卡片）
          if (productProvider.recommendedProducts.isNotEmpty)
            _buildHeroCard(productProvider.recommendedProducts[0]),

          const SizedBox(height: 16),

          // 双列产品展示
          if (productProvider.recommendedProducts.length >= 3)
            Row(
              children: [
                Expanded(
                  child: _buildDualCard(productProvider.recommendedProducts[1]),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildDualCard(productProvider.recommendedProducts[2]),
                ),
              ],
            ),
        ],
      ),
    );
  }

  // 主要产品卡片
  Widget _buildHeroCard(Product product) {
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
          color: Colors.black,
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.description ?? '',
                    style: const TextStyle(color: Colors.white70, fontSize: 18),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _HeroButton(text: '了解更多', isPrimary: false),
                      const SizedBox(width: 16),
                      _HeroButton(text: '购买', isPrimary: true),
                    ],
                  ),
                ],
              ),
            ),
            if (product.image != null && product.image!.isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(28),
                ),
                child: Image.network(
                  product.image!,
                  width: double.infinity,
                  height: 200,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 200,
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
          ],
        ),
      ),
    );
  }

  // 双列产品卡片
  Widget _buildDualCard(Product product) {
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
          color: const Color(0xFFFAFAFA),
          borderRadius: BorderRadius.circular(28),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.1),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(
                      color: Color(0xFF1D1D1F),
                      fontSize: 24,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    product.description ?? '',
                    style: const TextStyle(
                      color: Color(0xFF1D1D1F),
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 16),
                  TextButton(
                    onPressed: () {
                      if (product.id != null && product.id!.isNotEmpty) {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) =>
                                ProductDetailPage(productId: product.id!),
                          ),
                        );
                      }
                    },
                    child: const Text(
                      '了解更多 →',
                      style: TextStyle(color: Colors.blue, fontSize: 14),
                    ),
                  ),
                ],
              ),
            ),
            if (product.image != null && product.image!.isNotEmpty)
              ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(28),
                ),
                child: Image.network(
                  product.image!,
                  width: double.infinity,
                  height: 150,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 150,
                      color: Colors.grey[300],
                      child: const Icon(
                        Icons.image,
                        size: 48,
                        color: Colors.grey,
                      ),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }

  // 促销活动区域
  Widget _buildPromoSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '特别活动',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildPromoCard(
                  title: '母亲节礼物',
                  description: '为您的母亲选择完美礼物',
                  image: 'assets/mothers-day.png',
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildPromoCard(
                  title: '以旧换新',
                  description: '新设备最高可享95折优惠',
                  image: 'assets/trade-in.jpg',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  // 促销卡片
  Widget _buildPromoCard({
    required String title,
    required String description,
    required String image,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFFFAFAFA),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    color: Color(0xFF1D1D1F),
                    fontSize: 20,
                    fontWeight: FontWeight.w500,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  description,
                  style: const TextStyle(
                    color: Color(0xFF1D1D1F),
                    fontSize: 14,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () {
                    // TODO: 跳转到活动页面
                  },
                  child: const Text(
                    '立即购买 →',
                    style: TextStyle(color: Colors.blue, fontSize: 14),
                  ),
                ),
              ],
            ),
          ),
          Container(
            height: 120,
            decoration: BoxDecoration(
              color: Colors.grey[300],
              borderRadius: const BorderRadius.vertical(
                bottom: Radius.circular(28),
              ),
            ),
            child: const Center(
              child: Icon(Icons.image, size: 48, color: Colors.grey),
            ),
          ),
        ],
      ),
    );
  }

  // 快捷功能区域
  Widget _buildQuickActions() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '快捷功能',
            style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 16),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: 4,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            children: [
              _buildQuickAction(Icons.local_offer, '优惠券'),
              _buildQuickAction(Icons.star, '收藏夹'),
              _buildQuickAction(Icons.history, '浏览记录'),
              _buildQuickAction(Icons.location_on, '收货地址'),
              _buildQuickAction(Icons.support_agent, '客服'),
              _buildQuickAction(Icons.settings, '设置'),
              _buildQuickAction(Icons.help, '帮助'),
              _buildQuickAction(Icons.info, '关于'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAction(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(25),
          ),
          child: Icon(icon, color: Colors.blue[600]),
        ),
        const SizedBox(height: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 12),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

// 轮播图组件
class CarouselWidget extends StatefulWidget {
  const CarouselWidget({super.key});

  @override
  State<CarouselWidget> createState() => _CarouselWidgetState();
}

class _CarouselWidgetState extends State<CarouselWidget> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  Timer? _timer;

  final List<CarouselItem> _carouselItems = [
    CarouselItem(
      image: 'assets/hero-apple-style.jpg',
      title: '新品上市',
      subtitle: '智能生活',
      description: '发现更多智能便捷的生活方式',
      primaryButtonText: '立即购买',
      secondaryButtonText: '了解更多',
    ),
    CarouselItem(
      image: 'assets/hero_apple_event_september.jpg',
      title: '秋季新品',
      subtitle: '创新科技',
      description: '体验最新科技带来的无限可能',
      primaryButtonText: '立即购买',
      secondaryButtonText: '了解更多',
    ),
    CarouselItem(
      image: 'assets/promo_iphone_tradein.jpg',
      title: '以旧换新',
      subtitle: '优惠活动',
      description: '新设备最高可享95折优惠',
      primaryButtonText: '立即参与',
      secondaryButtonText: '了解更多',
    ),
    CarouselItem(
      image: 'assets/promo_macbook_air_avail.jpg',
      title: 'MacBook Air',
      subtitle: '轻薄便携',
      description: '强大的性能，轻薄的设计',
      primaryButtonText: '立即购买',
      secondaryButtonText: '了解更多',
    ),
  ];

  @override
  void initState() {
    super.initState();
    _startAutoPlay();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startAutoPlay() {
    _timer = Timer.periodic(const Duration(seconds: 4), (timer) {
      if (_currentPage < _carouselItems.length - 1) {
        _pageController.nextPage(
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      } else {
        _pageController.animateToPage(
          0,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 300,
      child: Stack(
        children: [
          // 轮播图页面
          PageView.builder(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            itemCount: _carouselItems.length,
            itemBuilder: (context, index) {
              return _buildCarouselPage(_carouselItems[index]);
            },
          ),
          // 指示器
          Positioned(
            bottom: 20,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _carouselItems.length,
                (index) => Container(
                  width: 8,
                  height: 8,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _currentPage == index
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

  Widget _buildCarouselPage(CarouselItem item) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        image: DecorationImage(
          image: AssetImage(item.image),
          fit: BoxFit.cover,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [Colors.transparent, Colors.black.withValues(alpha: 0.3)],
          ),
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                item.title,
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                item.subtitle,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                item.description,
                style: const TextStyle(color: Colors.white70, fontSize: 18),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  _HeroButton(text: item.secondaryButtonText, isPrimary: false),
                  const SizedBox(width: 16),
                  _HeroButton(text: item.primaryButtonText, isPrimary: true),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// 轮播图数据模型
class CarouselItem {
  final String image;
  final String title;
  final String subtitle;
  final String description;
  final String primaryButtonText;
  final String secondaryButtonText;

  CarouselItem({
    required this.image,
    required this.title,
    required this.subtitle,
    required this.description,
    required this.primaryButtonText,
    required this.secondaryButtonText,
  });
}

// Hero 按钮组件
class _HeroButton extends StatelessWidget {
  final String text;
  final bool isPrimary;

  const _HeroButton({required this.text, required this.isPrimary});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
      decoration: BoxDecoration(
        color: isPrimary ? Colors.white : Colors.transparent,
        border: Border.all(color: Colors.white, width: 1),
        borderRadius: BorderRadius.circular(25),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: isPrimary ? Colors.black : Colors.white,
          fontSize: 16,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

class CategoriesTab extends StatelessWidget {
  const CategoriesTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('商品分类')),
      body: const Center(child: Text('分类页面 - 开发中')),
    );
  }
}

class CartTab extends StatelessWidget {
  const CartTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('购物车')),
      body: const Center(child: Text('购物车页面 - 开发中')),
    );
  }
}

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('个人中心')),
      body: const Center(child: Text('个人中心页面 - 开发中')),
    );
  }
}

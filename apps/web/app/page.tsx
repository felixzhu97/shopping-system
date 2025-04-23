import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ProductCard } from '@/components/product-card';
import { Navbar } from '@/components/navbar';
import { Product } from '@/lib/types';
import * as api from '@/lib/api';

// 修改为从API获取数据的组件
async function FeaturedProducts() {
  try {
    // 使用api模块中的getProducts函数
    const products = await api.getProducts();
    const featuredProducts = products.slice(0, 6); // 只获取前6个产品作为特色产品展示

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {featuredProducts.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('获取产品数据时出错:', error);
    // 出现错误时显示友好的错误消息
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">无法加载产品</h3>
        <p className="text-gray-500">请稍后再试</p>
      </div>
    );
  }
}

// 快速链接组件
function QuickLinks() {
  const links = [
    { name: '查找门店', href: '/stores', icon: '/icons/store.svg' },
    { name: '订单状态', href: '/account/orders', icon: '/icons/order.svg' },
    { name: '购物帮助', href: '/help', icon: '/icons/help.svg' },
    { name: '退货', href: '/returns', icon: '/icons/return.svg' },
    { name: '收藏夹', href: '/account/saved', icon: '/icons/heart.svg' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-10">
      {links.map(link => (
        <Link key={link.name} href={link.href} className="flex flex-col items-center group">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-gray-200 transition-colors">
            <span className="text-2xl">{link.name.charAt(0)}</span>
          </div>
          <span className="text-sm text-gray-700 group-hover:text-gray-900">{link.name}</span>
        </Link>
      ))}
    </div>
  );
}

// 获取类别产品数据的组件
async function CategoryShowcase() {
  try {
    // 获取不同类别的产品数据
    const electronics = await api.getProducts('electronics');
    const clothing = await api.getProducts('clothing');
    const homeKitchen = await api.getProducts('home-kitchen');
    const books = await api.getProducts('books');

    // 类别数据结构
    const categories = [
      {
        id: 'electronics',
        name: '电子产品',
        description: '探索最新科技产品，体验科技带来的便利与乐趣',
        items: electronics.slice(0, 9),
        image: '/electronics.jpg',
        color: 'bg-blue-50',
        titleColor: 'text-blue-600',
      },
      {
        id: 'clothing',
        name: '服装',
        description: '时尚穿搭，展现个性，彰显您的独特魅力',
        items: clothing.slice(0, 9),
        image: '/clothing.jpg',
        color: 'bg-purple-50',
        titleColor: 'text-purple-600',
      },
      {
        id: 'home-kitchen',
        name: '家居厨房',
        description: '打造舒适生活空间，让家更有温度',
        items: homeKitchen.slice(0, 9),
        image: '/home-kitchen.jpg',
        color: 'bg-amber-50',
        titleColor: 'text-amber-600',
      },
      {
        id: 'books',
        name: '图书',
        description: '知识的海洋，尽在掌握，开启智慧之门',
        items: books.slice(0, 9),
        image: '/books.jpg',
        color: 'bg-green-50',
        titleColor: 'text-green-600',
      },
    ];

    return (
      <div className="space-y-24">
        {categories.map(category => (
          <div key={category.id} className="mb-16">
            <h3 className={`text-3xl font-semibold mb-6 ${category.titleColor}`}>
              {category.name}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-11 gap-4">
              {/* 第一个卡片：分类简介 */}
              <div
                className={`col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-2 xl:col-span-2 rounded-2xl overflow-hidden ${category.color} hover:shadow-md transition-shadow`}
              >
                <Link href={`/products?category=${category.id}`} className="block h-full">
                  <div className="p-6 flex flex-col h-full">
                    <h4 className="text-2xl font-semibold mb-3">{category.name}</h4>
                    <p className="text-sm text-gray-600 mb-6">{category.description}</p>
                    <div className="mt-auto">
                      <div className="h-40 w-full overflow-hidden rounded-xl mb-4">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div
                        className={`${category.titleColor.replace('text-', 'text-')} hover:underline text-sm font-medium`}
                      >
                        了解更多 &gt;
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* 中间9个商品卡片 */}
              {category.items.map((item: Product) => (
                <div
                  key={item.id}
                  className="col-span-1 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <Link href={`/products/${item.id}`} className="block h-full">
                    <div className="p-4">
                      <div className="h-36 w-full overflow-hidden rounded-xl mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <h4 className="text-sm font-medium line-clamp-1">{item.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">¥{item.price.toFixed(2)}</p>
                    </div>
                  </Link>
                </div>
              ))}

              {/* 最后一个卡片：跳转到分类 */}
              <div className="col-span-1 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <Link href={`/products?category=${category.id}`} className="block h-full">
                  <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                      <span className={`text-xl ${category.titleColor}`}>&gt;</span>
                    </div>
                    <h4 className="text-lg font-medium mb-2">查看所有</h4>
                    <p className="text-sm text-gray-600">{category.name}</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error('获取类别产品数据时出错:', error);
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">无法加载类别数据</h3>
        <p className="text-gray-500">请稍后再试</p>
      </div>
    );
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section - Apple Style */}
        <section className="relative bg-black">
          <div className="w-full">
            {/* 视频背景，如果没有视频可以用高清图片代替 */}
            <div
              className="w-full h-[50vh] bg-cover bg-center"
              style={{ backgroundImage: 'url(/hero-apple-style.jpg)' }}
            >
              {/* 渐变遮罩，增加文字可读性 */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

              {/* 内容区域 */}
              <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
                <h2 className="text-lg md:text-xl text-white/90 font-medium mb-2">全新上市</h2>
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">智能科技生活</h1>
                <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8">
                  发现更智能、更便捷的生活方式
                </p>

                <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="rounded-full px-8 py-6 bg-white text-black hover:bg-white/90 text-base"
                  >
                    <Link href="/products">立即购买</Link>
                  </Button>
                  <Link
                    href="/about"
                    className="text-white text-lg font-medium hover:underline flex items-center"
                  >
                    了解更多 <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="sr-only">快速链接</h2>
            <QuickLinks />
          </div>
        </section>

        {/* Store Headline */}
        <section className="py-16 px-4">
          <div className="container mx-auto px-4 flex flex-col md:flex-row md:justify-between md:items-end">
            <div className="max-w-[600px]">
              <h2 className="text-5xl font-semibold text-gray-800">购物系统.</h2>
              <p className="text-4xl font-semibold text-gray-500 mt-2">
                以最好的方式购买您喜爱的产品。
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-2">
                  <img src="/avatar.png" alt="专家头像" className="w-8 h-8 rounded-full mr-2" />
                  <span className="text-gray-700">需要购物帮助？</span>
                </div>
                <Link href="/help" className="text-blue-500 hover:underline flex items-center">
                  咨询专家 <span className="ml-1">→</span>
                </Link>
                <div className="flex items-center mt-4">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 8l4 4-4 4M8 12h8"></path>
                  </svg>
                  <Link href="/stores" className="text-blue-500 hover:underline flex items-center">
                    查找门店位置 <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <Suspense fallback={<div className="text-center py-8">加载类别数据中...</div>}>
              <CategoryShowcase />
            </Suspense>
          </div>
        </section>

        {/* Featured Products */}
        <section className="w-full py-16 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold">精选商品</h2>
                <p className="max-w-[700px] text-gray-600 text-lg">
                  查看我们最受欢迎的商品，为您提供高品质、好价格的产品选择。
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-6xl">
              <Suspense fallback={<div className="text-center">加载中...</div>}>
                <FeaturedProducts />
              </Suspense>
            </div>
            <div className="flex justify-center mt-10">
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link href="/products">浏览所有产品</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-12 text-gray-600">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">了解我们</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    关于我们
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    招贤纳士
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    新闻中心
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">与我们合作</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    销售商品
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    成为会员
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    广告投放
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">支付方式</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    会员卡
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    积分支付
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    充值余额
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">帮助中心</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    我的账户
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    我的订单
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    配送政策
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    退换货说明
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-gray-900">
                    帮助
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-500">© 2025 购物系统. 版权所有.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

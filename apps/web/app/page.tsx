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
        description: '探索最新科技产品',
        items: electronics.slice(0, 2),
        image: '/electronics.jpg',
        color: 'bg-blue-50',
      },
      {
        id: 'clothing',
        name: '服装',
        description: '时尚穿搭，展现个性',
        items: clothing.slice(0, 2),
        image: '/clothing.jpg',
        color: 'bg-purple-50',
      },
      {
        id: 'home-kitchen',
        name: '家居厨房',
        description: '打造舒适生活空间',
        items: homeKitchen.slice(0, 2),
        image: '/home-kitchen.jpg',
        color: 'bg-amber-50',
      },
      {
        id: 'books',
        name: '图书',
        description: '知识的海洋，尽在掌握',
        items: books.slice(0, 2),
        image: '/books.jpg',
        color: 'bg-green-50',
      },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {categories.map(category => (
          <div
            key={category.id}
            className={`rounded-2xl overflow-hidden shadow-sm ${category.color} hover:shadow-md transition-shadow`}
          >
            <Link href={`/products?category=${category.id}`}>
              <div className="p-6">
                <h3 className="text-2xl font-semibold mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <div className="h-48 w-full overflow-hidden rounded-xl mb-4">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-blue-600 hover:underline text-sm font-medium">购物 &gt;</div>
              </div>
            </Link>
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
        {/* Hero Section */}
        <section className="relative bg-black">
          <div
            className="h-[500px] w-full bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero-banner.jpg)' }}
          >
            <div className="container mx-auto px-4 flex items-center h-full">
              <div className="max-w-lg text-center mx-auto text-white">
                <h1 className="text-5xl font-bold tracking-tight mb-6">购物系统</h1>
                <p className="text-xl mb-8">以最好的方式购买您喜爱的产品</p>
                <div className="flex justify-center gap-4">
                  <Button asChild variant="default" size="lg" className="rounded-full px-8">
                    <Link href="/products">立即购物</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-full px-8 bg-transparent text-white border-white hover:bg-white/10"
                  >
                    <Link href="/about">了解更多</Link>
                  </Button>
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

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">分类浏览</h2>
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

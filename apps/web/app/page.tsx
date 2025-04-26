import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Product } from '@/lib/types';
import * as api from '@/lib/api';

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
        items: electronics.slice(0, 8),
        image: '/electronics.jpg',
        color: 'bg-blue-50',
        titleColor: 'text-blue-600',
      },
      {
        id: 'clothing',
        name: '服装',
        description: '时尚穿搭，展现个性，彰显您的独特魅力',
        items: clothing.slice(0, 8),
        image: '/clothing.jpg',
        color: 'bg-purple-50',
        titleColor: 'text-purple-600',
      },
      {
        id: 'home-kitchen',
        name: '家居厨房',
        description: '打造舒适生活空间，让家更有温度',
        items: homeKitchen.slice(0, 8),
        image: '/home-kitchen.jpg',
        color: 'bg-amber-50',
        titleColor: 'text-amber-600',
      },
      {
        id: 'books',
        name: '图书',
        description: '知识的海洋，尽在掌握，开启智慧之门',
        items: books.slice(0, 8),
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

            <div className="container max-w-[1040px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* 第一个卡片：分类简介 */}
                <div
                  className={`rounded-2xl overflow-hidden ${category.color} hover:shadow-md transition-shadow`}
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

                {/* 商品卡片 */}
                {category.items.slice(0, 6).map((item: Product) => (
                  <div
                    key={item.id}
                    className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
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
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-100 shadow-sm hover:shadow-md transition-shadow">
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
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
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
                    href="/products"
                    className="text-white text-lg font-medium hover:underline flex items-center"
                  >
                    了解更多 <span className="ml-1">→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Store Headline */}
        <section className="py-16 px-4">
          <div className="container max-w-[1040px] mx-auto flex flex-col md:flex-row md:justify-between md:items-end">
            <div className="max-w-[600px]">
              <h2 className="text-5xl font-semibold text-gray-800">购物系统.</h2>
              <p className="text-4xl font-semibold text-gray-500 mt-2">
                以最好的方式购买您喜爱的产品。
              </p>
            </div>
            <div className="mt-8 md:mt-0">
              <div className="flex flex-col items-end">
                <div className="flex items-center mb-2">
                  <img
                    src="/specialist_avatar.png"
                    alt="专家头像"
                    className="w-8 h-8 rounded-full mr-2"
                  />
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
          <div className="container max-w-[1040px] mx-auto">
            <Suspense fallback={<div className="text-center py-8">加载类别数据中...</div>}>
              <CategoryShowcase />
            </Suspense>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-8">
          <div className="container max-w-[1040px] mx-auto">
            <h2 className="text-3xl font-semibold mb-6 text-gray-900">快速链接</h2>
            <div className="flex flex-wrap gap-3">
              {[
                { name: '查找门店', href: '/stores' },
                { name: '订单状态', href: '/account/orders' },
                { name: '购物帮助', href: '/help' },
                { name: '退货', href: '/returns' },
                { name: '收藏夹', href: '/account/saved' },
              ].map(link => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="border border-gray-300 rounded-full px-5 py-2 text-sm inline-flex items-center hover:border-gray-800 transition-colors"
                >
                  <span>{link.name}</span>
                  <span className="ml-1">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

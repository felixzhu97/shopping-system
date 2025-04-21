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
    const featuredProducts = products.slice(0, 5); // 只获取前4个产品作为特色产品展示

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div
            className="h-[400px] w-full bg-cover bg-center"
            style={{ backgroundImage: 'url(/hero-banner.jpg)' }}
          >
            <div className="container mx-auto px-4 py-24">
              <div className="max-w-xl bg-white/80 p-6 rounded-lg">
                <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
                  Shop the best deals
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Discover amazing products at unbeatable prices. Free shipping on qualified orders.
                </p>
                <Button asChild size="lg">
                  <Link href="/products">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">精选产品</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  查看我们最受欢迎的商品，为您提供高品质、好价格的产品选择。
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-1">
              <Suspense fallback={<div className="text-center">加载中...</div>}>
                <FeaturedProducts />
              </Suspense>
            </div>
            <div className="flex justify-center">
              <a
                href="/products"
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
              >
                浏览所有产品
              </a>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Electronics', image: '/electronics.jpg' },
                { name: 'Clothing', image: '/clothing.jpg' },
                { name: 'Home & Kitchen', image: '/home-kitchen.jpg' },
                { name: 'Books', image: '/books.jpg' },
              ].map(category => (
                <Card key={category.name} className="overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-40 object-cover"
                    />
                  </CardContent>
                  <CardFooter className="p-4">
                    <Link
                      href={`/products?category=${category.name.toLowerCase().replace(' & ', '-')}`}
                      className="text-sm font-medium hover:underline w-full text-center"
                    >
                      {category.name}
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Get to Know Us</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Press Releases
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Make Money with Us</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Sell products
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Become an Affiliate
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Advertise Your Products
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Payment Products</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Business Card
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Shop with Points
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Reload Your Balance
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Let Us Help You</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Your Account
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Your Orders
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Shipping Rates & Policies
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Returns & Replacements
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Help
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">© 2025 Amazon Clone. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

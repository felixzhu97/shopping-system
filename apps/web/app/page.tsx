import Link from 'next/link';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ProductCard } from '@/components/product-card';
import { Navbar } from '@/components/navbar';
import { featuredProducts } from '@/lib/products';
import { Product } from '@/lib/types';

// 修改为从API获取数据的组件
async function FeaturedProducts() {
  // 使用服务器组件获取数据
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/products`;
    console.log('正在请求API:', apiUrl);

    const response = await fetch(apiUrl, {
      next: { revalidate: 3600 }, // 每小时重新验证一次
    });

    if (!response.ok) {
      console.error('API响应错误:', response.status, response.statusText);
      throw new Error(`获取产品数据失败: ${response.status}`);
    }

    const products = await response.json();
    const featuredProducts = products.slice(0, 4); // 只获取前4个产品作为特色产品展示

    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {featuredProducts.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('获取产品数据时出错:', error);
    throw error;
  }
}

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-200 h-[400px] w-full">
            <div className="container mx-auto px-4 py-24">
              <div className="max-w-xl">
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
              {['Electronics', 'Clothing', 'Home & Kitchen', 'Books'].map(category => (
                <Card key={category} className="overflow-hidden">
                  <CardContent className="p-0">
                    <img
                      src={`/placeholder.svg?height=200&width=300&text=${category}`}
                      alt={category}
                      className="w-full h-40 object-cover"
                    />
                  </CardContent>
                  <CardFooter className="p-4">
                    <Link
                      href={`/products?category=${category.toLowerCase().replace(' & ', '-')}`}
                      className="text-sm font-medium hover:underline w-full text-center"
                    >
                      {category}
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

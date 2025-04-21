'use client';

import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { useCart } from '@/lib/cart-context';

function SuccessContent() {
  const router = useRouter();
  const { cartItems } = useCart();

  // 如果直接访问此页面（不是从结账页来），重定向到首页
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cartItems.length > 0) {
        router.push('/cart');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [cartItems.length, router]);

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 mb-8">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold mb-4">订单提交成功！</h1>
      <p className="text-xl text-gray-600 mb-8">
        感谢您的购买！我们已经收到您的订单，并将尽快处理。
      </p>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="font-semibold text-lg mb-3">订单信息</h2>
        <p className="text-gray-600 mb-2">订单号: #ORD-{Date.now().toString().slice(-6)}</p>
        <p className="text-gray-600 mb-2">下单时间: {new Date().toLocaleString('zh-CN')}</p>
        <p className="text-gray-600">我们已向您的邮箱发送了订单确认邮件，请查收。</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
        <Button asChild size="lg" variant="default">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            返回首页
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            继续购物
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-16">
        <Suspense fallback={<div>加载中...</div>}>
          <SuccessContent />
        </Suspense>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 购物系统. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}

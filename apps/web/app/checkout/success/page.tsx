'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Package,
  ArrowRightCircle,
  ReceiptText,
  Home,
  ShoppingBag,
  Phone,
  HelpCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Separator } from '@/components/ui/separator';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  // 使用useEffect确保只在客户端渲染
  useEffect(() => {
    // 可以在这里添加一些额外的逻辑，例如清除本地存储的购物车数据等
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // 防止用户刷新页面后丢失订单成功状态
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* 顶部成功消息 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <div className="flex items-center justify-center flex-col text-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">谢谢您的订购</h1>
              <p className="text-gray-500 mt-2 md:text-lg">您的订单已成功提交，我们将尽快处理</p>
            </div>
          </div>

          {/* 订单信息卡片 */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            {/* 顶部标题 */}
            <div className="border-b border-gray-100 p-6">
              <h2 className="font-medium text-lg text-gray-900">订单详情</h2>
            </div>

            {/* 订单细节 */}
            <div className="divide-y divide-gray-100">
              {/* 发货细节 */}
              <div className="p-6 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">标准配送</h3>
                  <p className="text-gray-500 text-sm">预计1-3个工作日送达</p>
                  {orderId && (
                    <Link
                      href={`/orders/${orderId}`}
                      className="text-blue-600 text-sm mt-2 hover:underline cursor-pointer"
                    >
                      跟踪订单状态
                    </Link>
                  )}
                </div>
              </div>

              {/* 订单确认 */}
              <div className="p-6 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <ReceiptText className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">确认邮件已发送</h3>
                  <p className="text-gray-500 text-sm">
                    我们已向您的邮箱发送了订单确认邮件，包含详细的订单信息
                  </p>
                </div>
              </div>

              {/* 下一步 */}
              <div className="p-6 flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <ArrowRightCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">等待发货通知</h3>
                  <p className="text-gray-500 text-sm">
                    商品准备就绪后，我们会通过邮件通知您发货信息
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 帮助与支持 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
            <h3 className="font-medium text-lg text-gray-900 mb-4">帮助与支持</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
                <Phone className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">联系客户服务</h4>
                  <p className="text-gray-500 text-sm">工作日 9:00-18:00</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <div>
                  <h4 className="font-medium text-gray-900">订单常见问题</h4>
                  <p className="text-gray-500 text-sm">查看帮助中心</p>
                </div>
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="w-full sm:w-auto rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Link href="/products">
                <ShoppingBag className="h-4 w-4 mr-2" />
                继续购物
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto rounded-full border-gray-300 hover:bg-gray-100 transition-colors"
            >
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                返回首页
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

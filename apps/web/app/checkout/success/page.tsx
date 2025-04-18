'use client';

import Link from 'next/link';
import { CheckCircle, Home, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';

export default function OrderSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-24 w-24 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">订单提交成功！</h1>
          <p className="text-lg text-muted-foreground mb-8">
            感谢您的购买！您的订单已经成功提交，我们将尽快处理并安排配送。
          </p>
          <div className="space-y-4">
            <div className="bg-muted p-6 rounded-lg text-left">
              <h2 className="text-xl font-semibold mb-4">订单详情</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">订单编号:</span>
                  <span className="font-medium">ORD-{Math.floor(Math.random() * 1000000)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">订单日期:</span>
                  <span className="font-medium">{new Date().toLocaleDateString('zh-CN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">支付方式:</span>
                  <span className="font-medium">信用卡</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">预计送达:</span>
                  <span className="font-medium">3-5个工作日</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  返回首页
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  继续购物
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              订单确认邮件已发送到您的邮箱。如有任何问题，请联系我们的客服团队。
            </p>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 购物系统. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}

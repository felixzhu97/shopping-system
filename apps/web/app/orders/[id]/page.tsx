'use client';

import { Usable, use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, Truck, CheckCircle, Clock, XCircle, Home, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/lib/types';
import { getOrderById } from '@/lib/api/orders';
import Image from '@/components/ui/image';

export default function OrderDetailPage({ params }: { params: Usable<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = use(params);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const order = await getOrderById(id);
        setOrder(order);
      } catch (error) {
        console.error('获取订单详情失败', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'processing':
        return '处理中';
      case 'shipped':
        return '已发货';
      case 'delivered':
        return '已送达';
      case 'cancelled':
        return '已取消';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-semibold mb-4">订单不存在</h1>
            <p className="text-gray-500 mb-8">您访问的订单不存在或已被删除</p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/orders">返回订单列表</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
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

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/orders" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回订单列表
              </Link>
            </Button>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <span className="font-semibold text-lg text-gray-900">订单 #{order.id}</span>
                <span className="text-xs text-yellow-600 font-medium ml-2">
                  {getStatusText(order.status)}
                </span>
              </div>
              <div className="text-right min-w-[90px]">
                <div className="font-bold text-xl text-gray-900">¥{order.totalAmount}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-0 overflow-hidden">
              {/* 商品列表 */}
              <div className="divide-y divide-gray-100">
                {order.items.map(item => (
                  <div key={item.productId} className="flex items-center gap-4 px-6 py-4">
                    <img
                      src={item.image || item.product?.image}
                      alt={item.name || item.product?.name}
                      className="w-16 h-16 object-cover rounded-xl bg-gray-100 border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {item.name || item.product?.name}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5">数量: {item.quantity}</div>
                    </div>
                    <div className="font-semibold text-right text-gray-800 min-w-[60px]">
                      ¥{(item.price ?? item.product?.price ?? 0) * item.quantity}
                    </div>
                  </div>
                ))}
              </div>
              {/* 订单信息分区 */}
              <div className="border-t px-6 py-4 grid grid-cols-2 gap-4 bg-gray-50">
                <div>
                  <div className="text-xs text-gray-500 mb-1">订单编号</div>
                  <div className="text-sm text-gray-900">#{order.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">下单时间</div>
                  <div className="text-sm text-gray-900">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">订单总额</div>
                  <div className="text-base font-bold text-gray-900">¥{order.totalAmount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

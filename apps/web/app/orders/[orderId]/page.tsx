'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { Order } from '@/lib/types';
import { getOrderById } from '@/lib/api/orders';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const order = await getOrderById(orderId as string);
        setOrder(order);
      } catch (error) {
        toast({
          title: '获取订单失败',
          description: '无法加载订单信息，请稍后再试',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, toast]);

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
            <p className="text-gray-500 mb-8">无法找到您请求的订单信息</p>
            <div className="flex justify-center gap-4">
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
            <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-800">
              <Link href="/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回订单列表
              </Link>
            </Button>
          </div>

          {/* 订单状态卡片 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4">
              {getStatusIcon(order.status)}
              <div>
                <h2 className="text-lg font-semibold">订单状态</h2>
                <p className="text-gray-500">{getStatusText(order.status)}</p>
              </div>
            </div>
          </div>

          {/* 订单商品列表 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">订单商品</h2>
            <div className="space-y-4">
              {order.items.map(item => (
                <div key={item.productId} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-gray-500">数量: {item.quantity}</p>
                  </div>
                  <p className="font-medium">¥{item.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 配送信息 */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">配送信息</h2>
            <div className="space-y-2 text-gray-600">
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city} {order.shippingAddress.province}{' '}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Button asChild variant="ghost" className="mb-4">
              <Link href="/orders" className="flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回订单列表
              </Link>
            </Button>

            {/* 订单状态卡片 */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <h1 className="font-semibold text-xl text-gray-900">订单 #{order.id}</h1>
                    <span className="text-sm text-gray-500">
                      下单时间：{new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-2xl text-gray-900">
                    ¥{order.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {getStatusText(order.status)}
                  </div>
                </div>
              </div>

              {/* 订单进度条 */}
              <div className="relative mt-8">
                <div className="absolute left-0 top-[14px] w-full h-1 bg-gray-200 rounded"></div>
                <div className="relative flex justify-between">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${
                        ['pending', 'processing', 'shipped', 'delivered'].includes(order.status)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-gray-500">待处理</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${
                        ['processing', 'shipped', 'delivered'].includes(order.status)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Package className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-gray-500">处理中</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${
                        ['shipped', 'delivered'].includes(order.status)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <Truck className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-gray-500">已发货</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${
                        order.status === 'delivered'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <span className="text-xs text-gray-500">已送达</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 订单详情卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 收货信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">收货信息</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">收货人</div>
                    <div className="font-medium">{order.shippingAddress.fullName}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">联系电话</div>
                    <div className="font-medium">{order.shippingAddress.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">收货地址</div>
                    <div className="font-medium">
                      {order.shippingAddress.address}, {order.shippingAddress.city}{' '}
                      {order.shippingAddress.postalCode}
                    </div>
                  </div>
                </div>
              </div>

              {/* 支付信息 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">支付信息</h2>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">支付方式</div>
                    <div className="font-medium">
                      {order.paymentMethod === 'credit-card' && '信用卡'}
                      {order.paymentMethod === 'alipay' && '支付宝'}
                      {order.paymentMethod === 'wechat' && '微信支付'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">支付状态</div>
                    <div className="font-medium text-green-600">已支付</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">支付时间</div>
                    <div className="font-medium">{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* 订单金额 */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">订单金额</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">商品总额</span>
                    <span className="font-medium">¥{order.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">运费</span>
                    <span className="font-medium">¥0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">优惠金额</span>
                    <span className="font-medium text-red-500">-¥0.00</span>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">实付金额</span>
                      <span className="font-bold text-xl text-blue-600">
                        ¥{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 商品清单 */}
            <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
              <h2 className="text-lg font-semibold p-6 border-b">商品清单</h2>
              <div className="divide-y divide-gray-100">
                {order.items.map(item => (
                  <div key={item.productId} className="flex items-center gap-4 p-6">
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.image || item.product?.image}
                        alt={item.name || item.product?.name}
                        className="object-cover rounded-xl"
                        wrapperClassName="w-20 h-20"
                        width={80}
                        height={80}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900">
                        {item.name || item.product?.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        单价: ¥{(item.price ?? item.product?.price ?? 0).toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">数量: {item.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ¥{((item.price ?? item.product?.price ?? 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

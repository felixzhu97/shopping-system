'use client';

import { CheckCircle, Clock, Home, Package, Truck, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getUserOrders } from '@/lib/api/orders';
import { Order } from '@/lib/types';
import { useUserId } from '@/lib/store/userStore';
import { useTranslation } from 'react-i18next';

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const userId = useUserId();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!userId) throw new Error(t('common.please_login'));
        const orders = await getUserOrders(userId);
        setOrders(orders);
      } catch (error) {
        console.error('获取订单失败', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
        return t('common.pending');
      case 'processing':
        return t('common.processing');
      case 'shipped':
        return t('common.shipped');
      case 'delivered':
        return t('common.delivered');
      case 'cancelled':
        return t('common.cancelled');
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

  if (orders.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl font-semibold mb-4">{t('common.no_orders')}</h1>
            <p className="text-gray-500 mb-8">{t('common.no_orders_message')}</p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/products">{t('common.browse_products')}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  {t('common.return_to_home')}
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
          <h1 className="text-2xl font-semibold mb-8">{t('common.my_orders')}</h1>
          <div className="space-y-6">
            {orders.map(order => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01] p-0 group border border-gray-100"
              >
                {/* 订单头部 */}
                <div className="flex items-center justify-between px-6 pt-6 pb-2">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <div className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {t('common.order')} #{order.id}
                      </div>
                      <div className="text-xs text-yellow-600 font-medium flex items-center gap-1 mt-0.5">
                        {getStatusText(order.status)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-[90px]">
                    <div className="font-bold text-lg text-gray-900">¥{order.totalAmount}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {/* 商品列表 */}
                <div className="px-6 pb-4 pt-2">
                  {order.items.map(item => (
                    <div
                      key={item.productId}
                      className="flex items-center gap-4 py-2 border-b last:border-b-0"
                    >
                      <img
                        src={item.image || item.product?.image}
                        alt={item.name || item.product?.name}
                        className="w-14 h-14 object-cover rounded-xl bg-gray-100 border shadow-md hover:shadow-lg transition-all duration-300 ease-out"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.name || item.product?.name}
                        </div>
                        <div className="text-gray-500 text-xs mt-0.5">
                          {t('common.quantity')}: {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold text-right text-gray-800 min-w-[60px]">
                        ¥{(item.price ?? item.product?.price ?? 0) * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

'use client';

import { Usable, use, useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Home,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Receipt,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { Order } from '@/lib/types';
import { getOrderById, cancelOrder } from '@/lib/api/orders';
import Image from '@/components/ui/image';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { paymentMethods } from '@/components/payment-method';
import { useTranslation } from 'react-i18next';

// 收货信息组件
interface ShippingInfoProps {
  shippingAddress: Order['shippingAddress'];
}
const ShippingInfo = ({ shippingAddress }: ShippingInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Home className="h-5 w-5 mr-2 text-blue-600" />
        {t('common.shipping_info')}
      </h2>
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">{t('common.recipient')}</div>
          <div className="font-medium">{shippingAddress.fullName}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">{t('common.phone')}</div>
          <div className="font-medium">{shippingAddress.phone}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">{t('common.shipping_address')}</div>
          <div className="font-medium">
            {shippingAddress.address}, {shippingAddress.city} {shippingAddress.province},{' '}
            {shippingAddress.postalCode}
          </div>
        </div>
      </div>
    </div>
  );
};

// 支付信息组件
interface PaymentInfoProps {
  paymentMethod: Order['paymentMethod'];
  createdAt: string;
}
const PaymentInfo = ({ paymentMethod, createdAt }: PaymentInfoProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
        {t('common.payment_info')}
      </h2>
      <div className="space-y-3">
        <div>
          <div className="text-sm text-gray-500">{t('common.payment_method')}</div>
          <div className="font-medium">{paymentMethods[paymentMethod]}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">{t('common.payment_status')}</div>
          <div className="font-medium text-green-600">{t('common.paid')}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">{t('common.payment_time')}</div>
          <div className="font-medium">{new Date(createdAt).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

// 订单金额组件
interface OrderAmountProps {
  totalAmount: number;
}
const OrderAmount = ({ totalAmount }: OrderAmountProps) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Receipt className="h-5 w-5 mr-2 text-blue-600" />
        {t('common.order_amount')}
      </h2>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-500">{t('common.product_total')}</span>
          <span className="font-medium">¥{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t('common.shipping_fee')}</span>
          <span className="font-medium">¥0.00</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">{t('common.discount_amount')}</span>
          <span className="font-medium text-red-500">-¥0.00</span>
        </div>
        <div className="pt-3 border-t">
          <div className="flex justify-between">
            <span className="font-medium">{t('common.total_amount_paid')}</span>
            <span className="font-bold text-xl text-blue-600">¥{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 商品清单组件
import type { OrderItem } from '@/lib/types';
interface OrderItemsListProps {
  items: OrderItem[];
}
const OrderItemsList = ({ items }: OrderItemsListProps) => {
  const { t } = useTranslation();

  return (
    <div className="divide-y divide-gray-100">
      {items.map(item => (
        <div
          key={item.productId}
          className="flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="relative w-20 h-20 flex-shrink-0">
            <Image
              src={item.image || item.product?.image}
              alt={item.name || item.product?.name}
              className="object-cover rounded-xl"
              wrapperClassName="w-20 h-20"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900">{item.name || item.product?.name}</div>
            <div className="text-sm text-gray-500 mt-1">
              {t('common.price')}: ¥{(item.price ?? item.product?.price ?? 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              {t('common.quantity')}: {item.quantity}
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-gray-900">
              ¥{((item.price ?? item.product?.price ?? 0) * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function OrderDetailPage({ params }: { params: Usable<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const { toast } = useToast();
  const { id } = use(params);
  const { t } = useTranslation();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getOrderById(id)
      .then(order => {
        if (isMounted) setOrder(order);
      })
      .catch(error => {
        if (isMounted) {
          console.error('获取订单详情失败', error);
          toast({
            title: t('common.get_order_failed'),
            description: t('common.please_try_again_later'),
            variant: 'destructive',
          });
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id]);

  // useMemo 缓存金额和状态文本
  const orderAmount = useMemo(() => {
    if (!order) return { total: 0, amountText: '' };
    return {
      total: order.totalAmount.toFixed(2),
      amountText: `¥${order.totalAmount.toFixed(2)}`,
    };
  }, [order]);

  const statusText = useMemo(() => {
    if (!order) return '';
    switch (order.status) {
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
      default:
        return '';
    }
  }, [order]);

  // useCallback 优化事件
  const handleCancelOrder = useCallback(async () => {
    if (!order) return;
    setIsCancelling(true);
    try {
      await cancelOrder(order.id);
      setOrder({ ...order, status: 'cancelled' });
      toast({
        title: t('common.order_cancelled'),
        description: t('common.your_order_has_been_successfully_cancelled'),
      });
    } catch (error) {
      toast({
        title: t('common.cancel_order_failed'),
        description: t('common.please_try_again_later'),
        variant: 'destructive',
      });
    } finally {
      setIsCancelling(false);
    }
  }, [order, toast]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="space-y-6">
              <Skeleton className="h-[200px] w-full rounded-2xl" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-[180px] rounded-2xl" />
                <Skeleton className="h-[180px] rounded-2xl" />
                <Skeleton className="h-[180px] rounded-2xl" />
              </div>
              <Skeleton className="h-[300px] rounded-2xl" />
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
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-sm p-12">
              <div className="flex justify-center mb-6">
                <AlertCircle className="h-12 w-12 text-gray-400" />
              </div>
              <h1 className="text-2xl font-semibold mb-4">{t('common.order_not_found')}</h1>
              <p className="text-gray-500 mb-8">
                {t('common.the_order_you_visited_does_not_exist_or_has_been_deleted')}
              </p>
              <div className="flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/orders">{t('common.return_to_order_list')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    {t('common.return_to_home')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const canCancel = order.status === 'pending';

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <Button asChild variant="ghost" size="lg" className="rounded-full">
                <Link href="/orders" className="flex items-center">
                  <ArrowLeft className="mr-2 h-5 w-5" />
                  {t('common.return_to_order_list')}
                </Link>
              </Button>
              {canCancel && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full"
                      disabled={isCancelling}
                    >
                      {isCancelling ? t('common.cancelling') : t('common.cancel_order')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('common.confirm_cancel_order')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t(
                          'common.cancelling_an_order_will_make_it_impossible_to_recover_it_if_you_have_paid_the_refund_will_be_returned_to_your_payment_account_within_3_to_5_working_days'
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('common.return')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleCancelOrder}>
                        {t('common.confirm_cancel_order')}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* 订单状态卡片 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h1 className="font-semibold text-xl">
                        {t('common.order')} #{order.id}
                      </h1>
                      <span className="text-sm opacity-90">
                        {t('common.order_time')}: {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-2xl">{orderAmount.amountText}</div>
                    <div className="text-sm font-medium opacity-90">{statusText}</div>
                  </div>
                </div>

                {/* 订单进度条 */}
                <div className="relative mt-8">
                  <div className="absolute left-0 top-[14px] w-full h-1 bg-white/20 rounded"></div>
                  <div className="relative flex justify-between">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 
                        ${
                          ['pending', 'processing', 'shipped', 'delivered'].includes(order.status)
                            ? 'bg-white text-blue-600'
                            : 'bg-white/30 text-white'
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="text-xs">{t('common.pending')}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 
                        ${
                          ['processing', 'shipped', 'delivered'].includes(order.status)
                            ? 'bg-white text-blue-600'
                            : 'bg-white/30 text-white'
                        }`}
                      >
                        <Package className="h-4 w-4" />
                      </div>
                      <span className="text-xs">{t('common.processing')}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 
                        ${
                          ['shipped', 'delivered'].includes(order.status)
                            ? 'bg-white text-blue-600'
                            : 'bg-white/30 text-white'
                        }`}
                      >
                        <Truck className="h-4 w-4" />
                      </div>
                      <span className="text-xs">{t('common.shipped')}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 
                        ${
                          order.status === 'delivered'
                            ? 'bg-white text-blue-600'
                            : 'bg-white/30 text-white'
                        }`}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-xs">{t('common.delivered')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 订单详情卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <ShippingInfo shippingAddress={order.shippingAddress} />
              <PaymentInfo paymentMethod={order.paymentMethod} createdAt={order.createdAt} />
              <OrderAmount totalAmount={order.totalAmount} />
            </div>

            {/* 商品清单 */}
            <div className="bg-white rounded-2xl shadow-sm mt-6 overflow-hidden">
              <h2 className="text-lg font-semibold p-6 border-b flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                {t('common.product_list')}
              </h2>
              <OrderItemsList items={order.items} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

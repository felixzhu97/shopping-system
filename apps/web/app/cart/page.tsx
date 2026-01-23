'use client';

import { memo, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CreditCard, Package, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

import { CartItem } from '@/components/cart-item';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import {
  useCartItems,
  useCartUpdateQuantity,
  useCartRemoveFromCart,
  useCartClearCart,
  useCartIsLoading,
  useCartError,
} from '@/lib/store/cartStore';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

// 加载状态的骨架屏组件
const LoadingSkeleton = memo(() => (
  <div className="space-y-8">
    <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
      <div className="flex items-center justify-between pb-6 border-b">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>

      <div className="py-8 space-y-8">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-6">
            <Skeleton className="h-24 w-24 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex items-center justify-between mt-4">
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-white rounded-2xl shadow-sm p-8">
      <Skeleton className="h-7 w-40 mb-6" />
      <div className="space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Separator />
        <div className="flex justify-between">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  </div>
));

// 空购物车组件
const EmptyCart = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-4">
        <ShoppingBag className="w-full h-full text-gray-400" />
      </div>
      <h2 className="text-xl font-medium text-gray-900 mb-2">{t('common.your_cart_is_empty')}</h2>
      <p className="text-gray-600 mb-6">{t('common.please_add_products_to_cart')}</p>
      <Link href="/products">
        <Button className="rounded-full">
          {t('common.browse_products')}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
});

// 订单摘要组件
const OrderSummary = memo(function OrderSummary({
  subtotal,
  shipping,
  tax,
  total,
  onCheckout,
}: {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  onCheckout: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
      <h2 className="font-medium text-lg mb-6">{t('common.order_summary')}</h2>
      <div className="space-y-4">
        <div className="flex justify-between text-gray-600">
          <span>{t('common.subtotal')}</span>
          <span>¥{subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>{t('common.shipping')}</span>
          <span className={shipping === 0 ? 'text-green-600' : ''}>
            {shipping === 0 ? t('common.free') : `¥${shipping.toFixed(2)}`}
          </span>
        </div>
        {shipping === 0 && (
          <div className="text-xs text-green-600 -mt-2">{t('common.you_have_free_shipping')}</div>
        )}
        <div className="flex justify-between text-gray-600">
          <span>{t('common.tax')}</span>
          <span>¥{tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-medium text-lg">
          <span>{t('common.total')}</span>
          <span>¥{total.toFixed(2)}</span>
        </div>

        <div className="pt-4 space-y-4">
          <Button
            className="w-full rounded-full h-12 text-base bg-blue-600 hover:bg-blue-700"
            onClick={onCheckout}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {t('common.checkout')}
          </Button>

          <div className="bg-gray-50 p-4 rounded-xl text-sm">
            <div className="flex items-start">
              <Package className="h-5 w-5 text-gray-700 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">{t('common.shipping_description')}</p>
                <p className="text-gray-600 mt-1">{t('common.order_over_200_free_shipping')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// 购物车列表组件
const CartList = memo(function CartList({
  items,
  onUpdateQuantity,
  onRemove,
  onClear,
}: {
  items: any[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
      <div className="flex items-center justify-between pb-6 border-b">
        <h2 className="font-medium text-lg">
          {t('common.product_list')} <span className="text-gray-500 ml-1">({items.length})</span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {t('common.clear_cart')}
        </Button>
      </div>

      <div className="py-6 divide-y">
        {items.map(item => (
          <CartItem
            key={item.productId}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
});

// 页面头部组件
const PageHeader = memo(() => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-semibold text-gray-900">{t('common.cart')}</h1>
      <Link
        href="/products"
        className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('common.continue_shopping')}
      </Link>
    </div>
  );
});

export default function CartPage() {
  const items = useCartItems();
  const updateQuantity = useCartUpdateQuantity();
  const removeFromCart = useCartRemoveFromCart();
  const clearCart = useCartClearCart();
  const isLoading = useCartIsLoading();
  const error = useCartError();
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useTranslation();

  // 显示错误提示
  useEffect(() => {
    if (error) {
      toast({
        title: t('common.error'),
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const { subtotal, shipping, tax, total } = useMemo(() => {
    const subtotal = items.reduce((total, item) => {
      const price = item.product?.price || 0;
      return total + price * item.quantity;
    }, 0);
    const shipping = subtotal > 200 ? 0 : 15; // 订单满200元免运费
    const tax = subtotal * 0.06; // 6%税率
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
  }, [items.length]);

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: t('common.cart_is_empty'),
        description: t('common.please_add_products_to_cart'),
        variant: 'destructive',
      });
      return;
    }

    // 跳转到结账页面
    router.push('/checkout');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <PageHeader />

          {isLoading ? (
            <LoadingSkeleton />
          ) : items.length > 0 ? (
            <>
              <CartList
                items={items}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                onClear={clearCart}
              />
              <OrderSummary
                subtotal={subtotal}
                shipping={shipping}
                tax={tax}
                total={total}
                onCheckout={handleCheckout}
              />
            </>
          ) : (
            <EmptyCart />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

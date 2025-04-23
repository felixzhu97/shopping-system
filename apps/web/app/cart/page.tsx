'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, CreditCard, ShoppingBag, Package, ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { CartItem } from '@/components/cart-item';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { useCart } from '@/lib/cart-context';
import { cn } from '@/lib/utils';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, isLoading, error } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  // 显示错误提示
  useEffect(() => {
    if (error) {
      toast({
        title: '出错了',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const shipping = subtotal > 200 ? 0 : 15; // 订单满200元免运费
  const tax = subtotal * 0.06; // 6%税率
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: '购物车为空',
        description: '请先添加商品到购物车',
        variant: 'destructive',
      });
      return;
    }

    // 跳转到结账页面
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-semibold text-gray-900 mb-8">购物袋</h1>
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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">购物袋</h1>
            <Link
              href="/products"
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              继续购物
            </Link>
          </div>

          {cartItems.length > 0 ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-8">
                <div className="flex items-center justify-between pb-6 border-b">
                  <h2 className="font-medium text-lg">
                    商品清单 <span className="text-gray-500 ml-1">({cartItems.length})</span>
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearCart()}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    清空购物袋
                  </Button>
                </div>

                <div className="py-6 divide-y">
                  {cartItems.map(item => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
                <h2 className="font-medium text-lg mb-6">订单摘要</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>小计</span>
                    <span>¥{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>运费</span>
                    <span className={shipping === 0 ? 'text-green-600' : ''}>
                      {shipping === 0 ? '免费' : `¥${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <div className="text-xs text-green-600 -mt-2">您已获得免费配送</div>
                  )}
                  <div className="flex justify-between text-gray-600">
                    <span>税费</span>
                    <span>¥{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium text-lg">
                    <span>总计</span>
                    <span>¥{total.toFixed(2)}</span>
                  </div>

                  <div className="pt-4 space-y-4">
                    <Button
                      className="w-full rounded-full h-12 text-base bg-blue-600 hover:bg-blue-700"
                      onClick={handleCheckout}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      前往结算
                    </Button>

                    <div className="bg-gray-50 p-4 rounded-xl text-sm">
                      <div className="flex items-start">
                        <Package className="h-5 w-5 text-gray-700 mr-2 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-gray-900">配送说明</p>
                          <p className="text-gray-600 mt-1">
                            标准配送时间为1-3个工作日，订单满¥200享受免费配送服务。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-6">
                <ShoppingBag className="h-10 w-10 text-gray-500" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">您的购物袋是空的</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                看起来您还没有添加任何商品到购物袋，现在就开始购物吧！
              </p>
              <Button asChild size="lg" className="rounded-full px-8 bg-blue-600 hover:bg-blue-700">
                <Link href="/products">
                  浏览商品
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

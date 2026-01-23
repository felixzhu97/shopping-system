'use client';

import React, { useEffect, Suspense } from 'react';
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
import { useTranslation } from 'react-i18next';

// 骨架屏组件
const SuccessPageSkeleton = () => (
  <div className="max-w-3xl mx-auto animate-pulse">
    <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
      <div className="flex items-center justify-center flex-col text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-gray-200 mb-4" />
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-6 w-64 bg-gray-200 rounded" />
      </div>
    </div>
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-100">
        <div className="h-6 w-32 bg-gray-200 rounded" />
      </div>
      <div className="divide-y divide-gray-100">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 主要内容组件
const SuccessContent = ({ orderId }: { orderId: string | null }) => {
  const { t } = useTranslation();

  return (
    <div className="max-w-3xl mx-auto">
      {/* 顶部成功消息 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
        <div className="flex items-center justify-center flex-col text-center mb-6">
          <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {t('common.thank_you_for_your_order')}
          </h1>
          <p className="text-gray-500 mt-2 md:text-lg">
            {t(
              'common.your_order_has_been_successfully_submitted_and_we_will_process_it_as_soon_as_possible'
            )}
          </p>
        </div>
      </div>

      {/* 订单信息卡片 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
        {/* 顶部标题 */}
        <div className="border-b border-gray-100 p-6">
          <h2 className="font-medium text-lg text-gray-900">{t('common.order_details')}</h2>
        </div>

        {/* 订单细节 */}
        <div className="divide-y divide-gray-100">
          {/* 发货细节 */}
          <div className="p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">{t('common.standard_shipping')}</h3>
              <p className="text-gray-500 text-sm">{t('common.expected_delivery_time')}</p>
              {orderId && (
                <Link
                  href={`/orders/${orderId}`}
                  className="text-blue-600 text-sm mt-2 hover:underline cursor-pointer"
                >
                  {t('common.track_order_status')}
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
              <h3 className="font-medium text-gray-900 mb-1">{t('common.email_sent')}</h3>
              <p className="text-gray-500 text-sm">
                {t(
                  'common.we_have_sent_an_order_confirmation_email_to_your_email_address_containing_detailed_order_information'
                )}
              </p>
            </div>
          </div>

          {/* 下一步 */}
          <div className="p-6 flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ArrowRightCircle className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 mb-1">
                {t('common.waiting_for_shipping_notification')}
              </h3>
              <p className="text-gray-500 text-sm">
                {t('common.we_will_notify_you_of_shipping_information_after_the_goods_are_ready')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 帮助与支持 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 mb-6">
        <h3 className="font-medium text-lg text-gray-900 mb-4">{t('common.help_and_support')}</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
            <Phone className="h-5 w-5 text-gray-500" />
            <div>
              <h4 className="font-medium text-gray-900">{t('common.contact_customer_service')}</h4>
              <p className="text-gray-500 text-sm">{t('common.working_hours')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
            <HelpCircle className="h-5 w-5 text-gray-500" />
            <div>
              <h4 className="font-medium text-gray-900">{t('common.order_common_questions')}</h4>
              <p className="text-gray-500 text-sm">{t('common.view_help_center')}</p>
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
          <Link href="/products" prefetch>
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t('common.continue_shopping')}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full sm:w-auto rounded-full border-gray-300 hover:bg-gray-100 transition-colors"
        >
          <Link href="/" prefetch>
            <Home className="h-4 w-4 mr-2" />
            {t('common.return_to_home')}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // 模拟页面内容加载
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timer);
    };
  }, [orderId]);

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Suspense fallback={<SuccessPageSkeleton />}>
          {isLoading ? <SuccessPageSkeleton /> : <SuccessContent orderId={orderId} />}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

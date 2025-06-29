'use client';

import Link from 'next/link';
import Image from '@/components/ui/image';
import { Product } from '@/lib/types';
import * as api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useTranslation } from 'react-i18next';

// 大型展示卡片组件
const HeroCard = ({
  product,
  color = 'bg-black',
  textColor = 'text-white',
}: {
  product: Product;
  color?: string;
  textColor?: string;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={`${color} rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ease-out hover:scale-[1.01]`}
    >
      <div className="block relative">
        <div className="pt-12 px-8 text-center">
          <h2 className={`text-[40px] font-medium ${textColor} mb-1`}>{product?.name}</h2>
          <p className={`text-[21px] ${textColor}/90 mb-3`}>{product?.description}</p>
          <div className="flex justify-center gap-4 text-[17px]">
            <Button
              asChild
              variant="default"
              size="lg"
              className="rounded-full px-8 py-6 bg-white text-black hover:bg-white/90 text-base"
            >
              <Link href={`/products/${product?.id}`}>{t('common.learn_more')}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 py-6 bg-black text-white hover: text-base"
            >
              <Link href={`/products/${product?.id}`}>{t('common.buy')}</Link>
            </Button>
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <Image
            src={product?.image}
            alt={product?.name}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

// 双列展示卡片组件
const DualCard = ({ product, color = 'bg-white' }: { product: Product; color?: string }) => {
  const { t } = useTranslation();
  return (
    <div
      className={`${color} rounded-[28px] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]`}
    >
      <div className="block relative">
        <div className="pt-8 px-6 text-center">
          <h2 className="text-[32px] font-medium text-[#1d1d1f] mb-1">{product?.name}</h2>
          <p className="text-[17px] text-[#1d1d1f]/90 mb-3">{product?.description}</p>
          <div className="flex justify-center gap-4 text-[14px]">
            <Link href={`/products/${product?.id}`} className="text-blue-500 hover:underline">
              {t('common.learn_more')} <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Image
            src={product?.image}
            alt={product?.name}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

// 促销卡片组件
const PromoCard = ({
  title,
  description,
  image,
  link,
  color = 'bg-white',
}: {
  title: string;
  description: string;
  image: string;
  link: string;
  color?: string;
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={`${color} rounded-[28px] overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]`}
    >
      <div className="block relative">
        <div className="pt-8 px-6 text-center">
          <h2 className="text-[32px] font-medium text-[#1d1d1f] mb-1">{title}</h2>
          <p className="text-[17px] text-[#1d1d1f]/90 mb-3">{description}</p>
          <div className="flex justify-center gap-4 text-[14px]">
            <Link href={link} className="text-blue-500 hover:underline">
              {t('common.buy_now')} <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Image src={image} alt={title} className="w-full h-auto object-cover" loading="lazy" />
        </div>
      </div>
    </div>
  );
};

// 主页展示组件
const CategoryShowcase = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchElectronics = async () => {
      try {
        const products = await api.getProducts('electronics');
        const featuredProducts = products.filter(Boolean).slice(0, 3);

        setFeaturedProducts(featuredProducts);
        setLoading(false);
      } catch (error) {
        console.error('获取产品数据时出错:', error);
        setLoading(false);
      }
    };
    fetchElectronics();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (featuredProducts.length < 3) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">{t('common.no_products_found')}</h3>
        <p className="text-gray-500">{t('common.please_try_again')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-6">
      {/* 主要产品展示 */}
      <div className="container max-w-[1040px] mx-auto">
        <HeroCard product={featuredProducts[0]} color="bg-black" textColor="text-white" />
      </div>

      {/* 双列产品展示 */}
      <div className="container max-w-[1040px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <DualCard product={featuredProducts[1]} color="bg-[#fafafa]" />
        <DualCard product={featuredProducts[2]} color="bg-[#fafafa]" />
      </div>

      {/* 促销活动展示 */}
      <div className="container max-w-[1040px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
        <PromoCard
          title={t('common.mothers_day_gift')}
          description={t('common.choose_the_perfect_gift_for_your_mother')}
          image="/mothers-day.png"
          link="/products"
          color="bg-[#fafafa]"
        />
        <PromoCard
          title={t('common.trade_in')}
          description={t('common.get_up_to_95_discount_on_new_devices')}
          image="/trade-in.jpg"
          link="/products"
          color="bg-[#fafafa]"
        />
      </div>
    </div>
  );
};

export default CategoryShowcase;

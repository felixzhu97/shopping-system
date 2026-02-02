'use client';

import Link from 'next/link';
import Image from '@/components/ui/image';
import { Product } from '@/lib/types';
import * as api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
              className="rounded-full px-8 py-6 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/40 text-base"
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

function ShowcaseSkeleton() {
  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-[1040px] space-y-6">
        <div className="h-[520px] rounded-[28px] bg-white/70 shadow-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[360px] rounded-[28px] bg-white/70 shadow-lg animate-pulse" />
          <div className="h-[360px] rounded-[28px] bg-white/70 shadow-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[360px] rounded-[28px] bg-white/70 shadow-lg animate-pulse" />
          <div className="h-[360px] rounded-[28px] bg-white/70 shadow-lg animate-pulse" />
        </div>
      </div>
    </section>
  );
}

const CategoryShowcase = () => {
  const { t } = useTranslation();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const featured = featuredProducts.slice(0, 3);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const products = await api.getProducts('electronics');
        setFeaturedProducts(products.slice(0, 3));
      } catch (error) {
        console.error('Failed to load featured products', error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  if (loading) {
    return <ShowcaseSkeleton />;
  }

  if (featuredProducts.length < 3) {
    return (
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-[1040px] text-center py-10">
          <h3 className="text-lg font-medium mb-2">{t('common.no_products_found')}</h3>
          <p className="text-gray-500">{t('common.please_try_again')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 pb-16">
      <div className="mx-auto max-w-[1040px] flex items-end justify-between gap-4 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
            {t('common.featured')}
          </h2>
          <p className="text-sm md:text-base text-[#1d1d1f]/70 mt-1">
            {t('common.new_products')}
          </p>
        </div>
        <Link href="/products" className="text-sm text-blue-600 hover:underline">
          {t('common.all_products')}
        </Link>
      </div>

      <div className="mx-auto max-w-[1040px] space-y-6">
        <HeroCard product={featured[0]} color="bg-black" textColor="text-white" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DualCard product={featured[1]} color="bg-[#fafafa]" />
          <DualCard product={featured[2]} color="bg-[#fafafa]" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </section>
  );
};

export default CategoryShowcase;

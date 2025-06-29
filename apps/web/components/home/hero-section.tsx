'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const HeroSection = memo(() => {
  const { t } = useTranslation();
  return (
    <section className="relative bg-black">
      <div className="w-full">
        <div
          className="w-full h-[50vh] bg-cover bg-center"
          style={{ backgroundImage: 'url(/hero-apple-style.jpg)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

          <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
            <h2 className="text-lg md:text-xl text-white/90 font-medium mb-2">
              {t('common.new_products')}
            </h2>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
              {t('common.smart_life')}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-32">
              {t('common.find_more_smart_and_convenient_life')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 bg-black text-white hover: text-base"
              >
                <Link href="/products">{t('common.learn_more')}</Link>
              </Button>
              <Button
                asChild
                variant="default"
                size="lg"
                className="rounded-full px-8 py-6 bg-white text-black hover:bg-white/90 text-base"
              >
                <Link href="/products">{t('common.buy_now')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

export default HeroSection;

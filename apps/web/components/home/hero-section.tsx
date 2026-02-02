'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const HeroSection = memo(() => {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-black">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-apple-style.jpg)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80" />

      <div className="relative mx-auto flex min-h-[520px] max-w-[1040px] flex-col items-center justify-center px-6 py-16 text-center">
        <h2 className="text-base md:text-lg text-white/90 font-medium mb-2">
          {t('common.new_products')}
        </h2>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-4">
          {t('common.smart_life')}
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10">
          {t('common.find_more_smart_and_convenient_life')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full px-8 py-6 bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/40 text-base"
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
    </section>
  );
});

export default HeroSection;

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

// 动态导入组件
const HeroSection = dynamic(() => import('@/components/home/hero-section'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

const StoreHeadline = dynamic(() => import('@/components/home/store-headline'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

const CategoryShowcase = dynamic(() => import('@/components/home/category-showcase'), {
  loading: () => <LoadingSpinner />,
  ssr: true,
});

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner />}>
          <HeroSection />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <StoreHeadline />
        </Suspense>

        <Suspense fallback={<LoadingSpinner />}>
          <CategoryShowcase />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

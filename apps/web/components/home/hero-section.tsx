import Link from 'next/link';
import { Button } from '@/components/ui/button';

const HeroSection = () => (
  <section className="relative bg-black">
    <div className="w-full">
      <div
        className="w-full h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: 'url(/hero-apple-style.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

        <div className="relative h-full flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-lg md:text-xl text-white/90 font-medium mb-2">全新上市</h2>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">智能科技生活</h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mb-8">
            发现更智能、更便捷的生活方式
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center mt-4">
            <Button
              asChild
              variant="default"
              size="lg"
              className="rounded-full px-8 py-6 bg-white text-black hover:bg-white/90 text-base"
            >
              <Link href="/products">立即购买</Link>
            </Button>
            <Link
              href="/products"
              className="text-white text-lg font-medium hover:underline flex items-center"
            >
              了解更多 <span className="ml-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;

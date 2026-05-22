import { Footer } from '@/components/footer';
import CategoryShowcase from '@/components/home/category-showcase';
import HeroSection from '@/components/home/hero-section';
import StoreHeadline from '@/components/home/store-headline';
import { Navbar } from '@/components/navbar';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StoreHeadline />
        <CategoryShowcase />
      </main>
      <Footer />
    </div>
  );
}

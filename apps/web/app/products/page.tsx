'use client';

import { Suspense, useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/product-card';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Product } from '@/lib/types';
import { cn } from '@/lib/utils/utils';
import { useProductStore } from '@/lib/store/productStore';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';
import { useTranslation } from 'react-i18next';

// 改造后的产品网格，以Apple Store风格展示
function AppleStyleProductGrid({ products }: { products: Product[] }) {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isBatchLoading, setIsBatchLoading] = useState(false);
  const PAGE_SIZE = 12; // 每批加载的产品数量，增加到12个以适应网格

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // 初始加载第一批产品
  useEffect(() => {
    if (products.length > 0) {
      setVisibleProducts(products.slice(0, PAGE_SIZE));
      setHasMore(products.length > PAGE_SIZE);
    }
  }, [products]);

  // 当滚动到底部时加载更多产品
  useEffect(() => {
    if (inView && hasMore && !isBatchLoading) {
      setIsBatchLoading(true);
      setTimeout(() => {
        const nextBatch = products.slice(
          visibleProducts.length,
          visibleProducts.length + PAGE_SIZE
        );
        setVisibleProducts(prev => [...prev, ...nextBatch]);
        setHasMore(visibleProducts.length + nextBatch.length < products.length);
        setIsBatchLoading(false);
      }, 500); // 模拟加载延迟
    }
  }, [inView, hasMore, products, visibleProducts, isBatchLoading]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6">
        {visibleProducts.map((product, index) => (
          <ProductCard key={`${product.id}-${index}`} product={product} />
        ))}
      </div>
      {/* 只在加载更多时显示 loading */}
      {hasMore && (
        <div ref={ref} className="py-8 mt-4 flex justify-center">
          {isBatchLoading ? (
            <div className="flex space-x-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </>
  );
}

// 为每个类别添加一个水平标题组件
function CategoryHeader({ category }: { category: string }) {
  const { t } = useTranslation();
  const categoryInfo = {
    electronics: {
      title: t('common.electronics'),
      description: t('common.electronics_description'),
      color: 'text-[#1d1d1f]',
      bgColor: 'bg-white',
    },
    clothing: {
      title: t('common.clothing'),
      description: t('common.clothing_description'),
      color: 'text-[#1d1d1f]',
      bgColor: 'bg-white',
    },
    'home-kitchen': {
      title: t('common.home_kitchen'),
      description: t('common.home_kitchen_description'),
      color: 'text-[#1d1d1f]',
      bgColor: 'bg-white',
    },
    books: {
      title: t('common.books'),
      description: t('common.books_description'),
      color: 'text-[#1d1d1f]',
      bgColor: 'bg-white',
    },
    default: {
      title: t('common.all_products'),
      description: t('common.all_products_description'),
      color: 'text-[#1d1d1f]',
      bgColor: 'bg-white',
    },
  };

  const info = categoryInfo[category as keyof typeof categoryInfo] || categoryInfo.default;

  return (
    <div className={cn('py-20')}>
      <div className="container mx-auto px-4 text-center">
        <h1 className={cn('text-[48px] font-semibold mb-4 tracking-tight', info.color)}>
          {info.title}
        </h1>
        <p className="text-[21px] text-[#1d1d1f] opacity-80 max-w-2xl mx-auto">
          {info.description}
        </p>
      </div>
    </div>
  );
}

// 将使用useSearchParams的逻辑移到专门的Client组件中
function ClientProductsList() {
  const searchParams = useSearchParams();
  const { productsByCategory, productsLoadedByCategory, isLoading, error, fetchProducts } =
    useProductStore();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { t } = useTranslation();

  // 获取所有查询参数
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'featured';
  const query = searchParams.get('q') || '';

  useEffect(() => {
    fetchProducts(category);
  }, [category, fetchProducts]);

  // 过滤和排序产品
  useEffect(() => {
    const products = productsByCategory[category] || [];
    let result = [...products];
    if (query) {
      result = result.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
    }
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }
    setFilteredProducts(result);
  }, [productsByCategory, category, query, sort]);

  // 优先显示骨架屏
  if (isLoading || !productsLoadedByCategory[category]) {
    return <ProductsGridSkeleton />;
  }

  if (!isLoading && productsLoadedByCategory[category] && filteredProducts.length === 0) {
    return (
      <div className="col-span-full py-12 text-center">
        <h3 className="text-lg font-medium mb-2">{t('common.no_products_found')}</h3>
        <p className="text-muted-foreground">{t('common.please_try_again')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="text-xl font-medium text-red-500 mb-2">{t('common.loading_error')}</div>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>{t('common.try_again')}</Button>
      </div>
    );
  }

  return <AppleStyleProductGrid products={filteredProducts} />;
}

// 外层组件不直接使用useSearchParams，只负责包装Suspense
function ProductsList() {
  return (
    <Suspense fallback={<ProductsGridSkeleton />}>
      <ClientProductsList />
    </Suspense>
  );
}

// 客户端产品页面组件，处理所有使用useSearchParams的逻辑
function ClientProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [currentSort, setCurrentSort] = useState('featured');
  const { t } = useTranslation();

  // 获取所有查询参数
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'featured';
  const query = searchParams.get('q') || '';

  // 当URL参数变化时更新排序状态
  useEffect(() => {
    setCurrentSort(sort);
  }, [sort]);

  // 处理排序变更
  const handleSortChange = useCallback(
    (newSort: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        params.set('sort', newSort);
        router.push(`/products?${params.toString()}`);
        setCurrentSort(newSort);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />

      {/* Apple风格分类标题 */}
      <CategoryHeader category={category} />

      <main className="flex-1 container mx-auto pb-16">
        {/* 搜索和筛选工具栏 */}
        <div className="flex justify-end mb-8 px-6">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">{t('common.sort_by')}:</span>
            <Select value={currentSort} onValueChange={handleSortChange} disabled={isPending}>
              <SelectTrigger className="w-40 rounded-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">{t('common.featured')}</SelectItem>
                <SelectItem value="price-asc">{t('common.price_asc')}</SelectItem>
                <SelectItem value="price-desc">{t('common.price_desc')}</SelectItem>
                <SelectItem value="rating">{t('common.rating')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <ProductsList />
      </main>

      <Footer />
    </div>
  );
}

// 外部组件只负责设置页面结构和Suspense边界
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
          <Navbar />
          <div className="py-8 mb-10 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
              <Skeleton className="h-10 w-[200px] mx-auto mb-4" />
              <Skeleton className="h-6 w-[400px] mx-auto" />
            </div>
          </div>
          <main className="flex-1 container mx-auto px-4 pb-16">
            <div className="mb-8 overflow-x-auto">
              <div className="flex space-x-6 pb-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-20 rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
              <Skeleton className="h-10 w-[300px]" />
              <Skeleton className="h-10 w-[150px]" />
            </div>
            <ProductsGridSkeleton />
          </main>
        </div>
      }
    >
      <ClientProductsPage />
    </Suspense>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
    </div>
  );
}

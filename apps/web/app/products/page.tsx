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
import { AppleProductCard } from '@/components/apple-product-card';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Product } from '@/lib/types';
import * as api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useProductStore } from '@/lib/product-store';
import { ProductCardSkeleton } from '@/components/product-card-skeleton';

// 分类名称映射表，将URL参数映射为友好的中文名称
const getCategoryLabel = (categorySlug: string): string => {
  const categoryMap: Record<string, string> = {
    electronics: '电子产品',
    clothing: '服装',
    'home-kitchen': '家居厨房',
    books: '图书',
  };

  return (
    categoryMap[categorySlug] ||
    categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace('-', ' & ')
  );
};

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
    setVisibleProducts(products.slice(0, PAGE_SIZE));
    setHasMore(products.length > PAGE_SIZE);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
        {visibleProducts.map((product, index) => (
          <AppleProductCard key={`${product.id}-${index}`} product={product} />
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
  const categoryInfo = {
    electronics: {
      title: '电子产品',
      description: '探索最新科技产品，体验科技带来的便利与乐趣',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    clothing: {
      title: '服装',
      description: '时尚穿搭，展现个性，彰显您的独特魅力',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    'home-kitchen': {
      title: '家居厨房',
      description: '打造舒适生活空间，让家更有温度',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    books: {
      title: '图书',
      description: '知识的海洋，尽在掌握，开启智慧之门',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    default: {
      title: '全部商品',
      description: '浏览我们的所有精选商品',
      color: 'text-gray-900',
      bgColor: 'bg-gray-50',
    },
  };

  const info = categoryInfo[category as keyof typeof categoryInfo] || categoryInfo.default;

  return (
    <div className={cn('py-8 mb-10', info.bgColor)}>
      <div className="container mx-auto px-4 text-center">
        <h1 className={cn('text-4xl font-semibold mb-4', info.color)}>{info.title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{info.description}</p>
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
        <h3 className="text-lg font-medium mb-2">未找到产品</h3>
        <p className="text-muted-foreground">请尝试调整您的搜索或筛选条件</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="text-xl font-medium text-red-500 mb-2">加载出错</div>
        <p className="text-gray-500 mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>重试</Button>
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

  // 获取所有查询参数
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'featured';
  const query = searchParams.get('q') || '';

  // 当URL参数变化时更新排序状态
  useEffect(() => {
    setCurrentSort(sort);
  }, [sort]);

  // 处理分类变更
  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      startTransition(() => {
        // 清除所有参数，只保留类别
        const params = new URLSearchParams();
        if (newCategory !== 'all') {
          params.set('category', newCategory);
        }
        // 切换类别时重置搜索和排序，使用默认值
        router.push(`/products?${params.toString()}`);
        // 同步更新UI状态
        setCurrentSort('featured');
      });
    },
    [router]
  );

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

  // 处理价格筛选
  const handlePriceFilter = useCallback(
    (minPrice: string, maxPrice: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        router.push(`/products?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  // Apple风格的分类导航菜单
  const categories = [
    { id: 'all', name: '全部' },
    { id: 'electronics', name: '电子产品' },
    { id: 'clothing', name: '服装' },
    { id: 'home-kitchen', name: '家居厨房' },
    { id: 'books', name: '图书' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />

      {/* Apple风格分类标题 */}
      <CategoryHeader category={category} />

      <main className="flex-1 container mx-auto px-4 pb-16">
        {/* 搜索和筛选工具栏 */}
        <div className="flex justify-end mb-8">
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">排序方式:</span>
            <Select value={currentSort} onValueChange={handleSortChange} disabled={isPending}>
              <SelectTrigger className="w-40 rounded-full bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">推荐</SelectItem>
                <SelectItem value="price-asc">价格: 从低到高</SelectItem>
                <SelectItem value="price-desc">价格: 从高到低</SelectItem>
                <SelectItem value="rating">评分最高</SelectItem>
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

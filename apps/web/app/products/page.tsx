'use client';

import { Suspense, useState, useEffect, useCallback, useTransition } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Product } from '@/lib/types';
import * as api from '@/lib/api';

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

// 虚拟列表的产品网格
function VirtualizedProductGrid({ products }: { products: Product[] }) {
  const [visibleProducts, setVisibleProducts] = useState<Product[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 8; // 每批加载的产品数量

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
    if (inView && hasMore) {
      const nextBatch = products.slice(visibleProducts.length, visibleProducts.length + PAGE_SIZE);

      if (nextBatch.length > 0) {
        // 使用 setTimeout 避免阻塞主线程
        setTimeout(() => {
          setVisibleProducts(prev => [...prev, ...nextBatch]);
          setHasMore(visibleProducts.length + nextBatch.length < products.length);
        }, 100);
      } else {
        setHasMore(false);
      }
    }
  }, [inView, hasMore, products, visibleProducts]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* 加载指示器 */}
      {hasMore && (
        <div ref={ref} className="py-4 mt-4 flex justify-center">
          <div className="flex space-x-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// 使用搜索参数的产品列表组件
function ProductsList() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取所有查询参数
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'featured';
  const query = searchParams.get('q') || '';

  // 获取产品数据
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const data = await api.getProducts(category || undefined);
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('获取产品数据失败:', err);
        setError('获取产品数据失败，请稍后再试');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  // 过滤和排序产品
  useEffect(() => {
    let result = [...products];

    // 过滤查询
    if (query) {
      result = result.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
    }

    // 排序产品
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
      // 默认是"featured"，无需排序
    }

    setFilteredProducts(result);
  }, [products, query, sort]);

  if (isLoading) {
    return <ProductsGridSkeleton />;
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

  if (filteredProducts.length === 0) {
    return (
      <div className="col-span-full py-12 text-center">
        <h3 className="text-lg font-medium mb-2">未找到产品</h3>
        <p className="text-muted-foreground">请尝试调整您的搜索或筛选条件</p>
      </div>
    );
  }

  return <VirtualizedProductGrid products={filteredProducts} />;
}

// 筛选和分类控制组件
function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 获取当前查询参数
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'featured';
  const query = searchParams.get('q') || '';

  // 处理分类变更
  const handleCategoryChange = useCallback(
    (newCategory: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (newCategory === 'all') {
          params.delete('category');
        } else {
          params.set('category', newCategory);
        }
        router.push(`/products?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  // 处理排序变更
  const handleSortChange = useCallback(
    (newSort: string) => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        params.set('sort', newSort);
        router.push(`/products?${params.toString()}`);
      });
    },
    [router, searchParams]
  );

  return (
    <div className="sticky top-0 z-10 bg-background pb-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {category !== 'all' ? getCategoryLabel(category) : '所有产品'}
        </h1>

        <div className="flex flex-wrap gap-4 items-center">
          {/* 分类选择 */}
          <Select value={category} onValueChange={handleCategoryChange} disabled={isPending}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              <SelectItem value="electronics">电子产品</SelectItem>
              <SelectItem value="clothing">服装</SelectItem>
              <SelectItem value="home-kitchen">家居厨房</SelectItem>
              <SelectItem value="books">图书</SelectItem>
            </SelectContent>
          </Select>

          {/* 排序选择 */}
          <Select value={sort} onValueChange={handleSortChange} disabled={isPending}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="排序方式" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">推荐</SelectItem>
              <SelectItem value="price-asc">价格从低到高</SelectItem>
              <SelectItem value="price-desc">价格从高到低</SelectItem>
              <SelectItem value="rating">评分</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// 产品网格骨架屏
function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden shadow-md">
          <Skeleton className="h-48 w-full" />
          <div className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <main className="container py-6">
      <Suspense fallback={<div>加载筛选条件...</div>}>
        <ProductFilters />
      </Suspense>

      <Suspense fallback={<ProductsGridSkeleton />}>
        <ProductsList />
      </Suspense>
    </main>
  );
}

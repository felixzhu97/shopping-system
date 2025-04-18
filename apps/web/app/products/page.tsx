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

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 获取所有查询参数
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'featured';
  const query = searchParams.get('q') || '';

  // 预加载相关分类数据
  useEffect(() => {
    const preloadCategories = async () => {
      const categories = ['electronics', 'clothing', 'home-kitchen', 'books'];

      // 预加载当前类别之外的其他类别
      for (const cat of categories) {
        if (cat !== category) {
          try {
            // 使用低优先级获取数据
            setTimeout(() => {
              api.getProducts(cat);
            }, 1000);
          } catch (err) {
            // 忽略预加载错误
            console.log('预加载数据失败:', err);
          }
        }
      }
    };

    preloadCategories();
  }, [category]);

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">筛选条件</h2>
                  <SlidersHorizontal className="h-5 w-5" />
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-2">分类</h3>
                    <div className="space-y-1">
                      {[
                        { id: 'all', label: '全部' },
                        { id: 'electronics', label: '电子产品' },
                        { id: 'clothing', label: '服装' },
                        { id: 'home-kitchen', label: '家居厨房' },
                        { id: 'books', label: '图书' },
                      ].map(cat => (
                        <div key={cat.id} className="flex items-center">
                          <input
                            type="radio"
                            id={cat.id}
                            name="category"
                            className="mr-2"
                            checked={cat.id === 'all' ? !category : category === cat.id}
                            onChange={() => handleCategoryChange(cat.id)}
                          />
                          <label htmlFor={cat.id} className="text-sm">
                            {cat.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">价格范围</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="最低价"
                        className="text-sm"
                        defaultValue={searchParams.get('minPrice') || ''}
                        onChange={e => {
                          const minPrice = e.target.value;
                          const maxPrice = searchParams.get('maxPrice') || '';
                          handlePriceFilter(minPrice, maxPrice);
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="最高价"
                        className="text-sm"
                        defaultValue={searchParams.get('maxPrice') || ''}
                        onChange={e => {
                          const maxPrice = e.target.value;
                          const minPrice = searchParams.get('minPrice') || '';
                          handlePriceFilter(minPrice, maxPrice);
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">评分</h3>
                    <div className="space-y-1">
                      {[4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`rating-${rating}`}
                            className="mr-2"
                            defaultChecked={searchParams.get('rating') === rating.toString()}
                            onChange={e => {
                              startTransition(() => {
                                const params = new URLSearchParams(searchParams);
                                if (e.target.checked) {
                                  params.set('rating', rating.toString());
                                } else {
                                  params.delete('rating');
                                }
                                router.push(`/products?${params.toString()}`);
                              });
                            }}
                          />
                          <label htmlFor={`rating-${rating}`} className="text-sm">
                            {rating}+ 星
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    disabled={isPending}
                    onClick={() => router.push('/products')}
                  >
                    {isPending ? '处理中...' : '清除所有筛选'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">
                {category
                  ? category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' & ')
                  : '所有产品'}
              </h1>

              <Select defaultValue={sort} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">精选</SelectItem>
                  <SelectItem value="price-asc">价格: 从低到高</SelectItem>
                  <SelectItem value="price-desc">价格: 从高到低</SelectItem>
                  <SelectItem value="rating">评分最高</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Suspense fallback={<ProductsGridSkeleton />}>
              <ProductsList />
            </Suspense>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 购物系统. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}

function ProductsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <Skeleton className="h-[300px] w-full" />
              <div className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
}

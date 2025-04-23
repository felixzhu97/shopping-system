'use client';

import { Suspense, useState, useEffect, useCallback, useTransition } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';

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
import { Footer } from '@/components/footer';
import { Product } from '@/lib/types';
import * as api from '@/lib/api';
import { cn } from '@/lib/utils';
import { useCart } from '@/lib/cart-context';

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
  const PAGE_SIZE = 12; // 每批加载的产品数量，增加到12个以适应网格
  const { addToCart } = useCart();
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

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

  // 处理添加到购物车功能
  const handleAddToCart = (product: Product) => {
    setAddingToCartId(product.id);
    try {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      });
      setTimeout(() => setAddingToCartId(null), 1000);
    } catch (err) {
      console.error('添加到购物车失败:', err);
      setAddingToCartId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
        {visibleProducts.map(product => (
          <div key={product.id} className="flex flex-col">
            <Link href={`/products/${product.id}`} className="group">
              <div className="bg-white rounded-2xl p-4 mb-3 aspect-square flex items-center justify-center overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
                />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-900 mb-1">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  {product.description?.substring(0, 60)}...
                </p>
                <p className="text-lg font-medium text-gray-900">¥{product.price.toFixed(2)}</p>
              </div>
            </Link>
            <div className="mt-auto pt-4 flex justify-center">
              <Button
                variant="default"
                size="sm"
                className={cn(
                  'rounded-full px-6',
                  addingToCartId === product.id
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                )}
                onClick={() => handleAddToCart(product)}
                disabled={addingToCartId === product.id}
              >
                {addingToCartId === product.id ? '已添加 ✓' : '加入购物车'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 加载指示器 */}
      {hasMore && (
        <div ref={ref} className="py-8 mt-4 flex justify-center">
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

  // 处理搜索查询变更
  const handleSearchChange = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const searchQuery = formData.get('q') as string;

      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (searchQuery) {
          params.set('q', searchQuery);
        } else {
          params.delete('q');
        }
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
        {/* Apple风格水平分类菜单 */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-6 pb-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={cn(
                  'whitespace-nowrap px-4 py-2 text-sm font-medium rounded-full transition-colors',
                  cat.id === (category || 'all')
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-800 hover:bg-gray-100'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索和筛选工具栏 */}
        <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
          <form onSubmit={handleSearchChange} className="flex-1 flex gap-2 max-w-md">
            <Input
              name="q"
              defaultValue={query}
              placeholder="搜索产品..."
              className="rounded-full bg-white"
            />
            <Button type="submit" variant="outline" className="rounded-full">
              搜索
            </Button>
          </form>

          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">排序方式:</span>
            <Select value={sort} onValueChange={handleSortChange} disabled={isPending}>
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

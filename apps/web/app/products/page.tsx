import { Suspense } from 'react';
import { SlidersHorizontal } from 'lucide-react';

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

// 从API获取产品数据的组件
async function ProductsList({
  category,
  sort,
  query,
}: {
  category?: string;
  sort: string;
  query: string;
}) {
  // 从API获取产品
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products${category ? `?category=${category}` : ''}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error('获取产品数据失败');
  }

  let products: Product[] = await response.json();

  // 过滤查询
  if (query) {
    products = products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()));
  }

  // 排序产品
  switch (sort) {
    case 'price-asc':
      products.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      products.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      products.sort((a, b) => b.rating - a.rating);
      break;
    // 默认是"featured"，无需排序
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.length > 0 ? (
        products.map(product => <ProductCard key={product.id} product={product} />)
      ) : (
        <div className="col-span-full py-12 text-center">
          <h3 className="text-lg font-medium mb-2">未找到产品</h3>
          <p className="text-muted-foreground">请尝试调整您的搜索或筛选条件</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; q?: string };
}) {
  const category = searchParams.category;
  const sort = searchParams.sort || 'featured';
  const query = searchParams.q || '';

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
                      {['All', 'Electronics', 'Clothing', 'Home & Kitchen', 'Books'].map(cat => (
                        <div key={cat} className="flex items-center">
                          <input
                            type="radio"
                            id={cat.toLowerCase()}
                            name="category"
                            className="mr-2"
                            defaultChecked={
                              cat === 'All'
                                ? !category
                                : category === cat.toLowerCase().replace(' & ', '-')
                            }
                          />
                          <label htmlFor={cat.toLowerCase()} className="text-sm">
                            {cat}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">价格范围</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="number" placeholder="最低价" className="text-sm" />
                      <Input type="number" placeholder="最高价" className="text-sm" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">评分</h3>
                    <div className="space-y-1">
                      {[4, 3, 2, 1].map(rating => (
                        <div key={rating} className="flex items-center">
                          <input type="checkbox" id={`rating-${rating}`} className="mr-2" />
                          <label htmlFor={`rating-${rating}`} className="text-sm">
                            {rating}+ 星
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full">应用筛选</Button>
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

              <Select defaultValue={sort}>
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
              <ProductsList category={category} sort={sort} query={query} />
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

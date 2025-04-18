import Link from 'next/link';
import { ChevronRight, Minus, Plus, ShoppingCart, Star, Truck } from 'lucide-react';
import { Suspense } from 'react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/navbar';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// 从API获取单个产品数据
async function ProductDetail({ id }: { id: string }) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/${id}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return null;
    }

    const product: Product = await response.json();

    // 获取相关产品（同一类别）
    const relatedResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products?category=${product.category}`,
      { next: { revalidate: 3600 } }
    );

    let relatedProducts: Product[] = [];
    if (relatedResponse.ok) {
      const allRelated = await relatedResponse.json();
      relatedProducts = allRelated.filter((p: Product) => p.id !== id).slice(0, 4);
    }

    return (
      <>
        {/* 产品详情 */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* 产品图片 */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="aspect-square overflow-hidden rounded-md">
              <img
                src={product.image || `/placeholder.svg?height=600&width=600&text=${product.name}`}
                alt={product.name}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          {/* 产品信息 */}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>

            <div className="flex items-center mt-2 mb-4">
              <div className="flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
              </div>
              <span className="ml-2 text-sm text-muted-foreground">
                {product.rating.toFixed(1)} ({product.reviewCount} 评价)
              </span>
            </div>

            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-3xl font-bold">¥{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  ¥{product.originalPrice.toFixed(2)}
                </span>
              )}
              {product.originalPrice && (
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  节省 ¥{(product.originalPrice - product.price).toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-6 space-y-6">
              <div className="flex items-center text-sm text-green-600">
                <Truck className="h-4 w-4 mr-2" />
                <span>订单满¥200免运费</span>
              </div>

              <div className="space-y-2">
                <div className="font-medium">数量</div>
                <div className="flex items-center border rounded w-fit">
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none">
                    <Minus className="h-4 w-4" />
                    <span className="sr-only">减少数量</span>
                  </Button>
                  <span className="w-12 text-center">1</span>
                  <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">增加数量</span>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="sm:flex-1">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  加入购物车
                </Button>
                <Button size="lg" variant="secondary" className="sm:flex-1">
                  立即购买
                </Button>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium mb-2">产品描述</h3>
                <p className="text-muted-foreground">
                  {product.description ||
                    '这款优质产品提供卓越的品质和价值。适合日常使用，它将耐用性与优雅的设计相结合。由高品质材料制成，经久耐用，同时保持其时尚外观。'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 产品选项卡 */}
        <div className="mt-12">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="details">详情</TabsTrigger>
              <TabsTrigger value="specifications">规格</TabsTrigger>
              <TabsTrigger value="reviews">评价</TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
              <div className="prose max-w-none">
                <p>
                  体验{product.name}
                  的卓越品质和性能。该产品以用户为中心设计，将创新功能与可靠的功能相结合，每次都能提供卓越的体验。
                </p>
                <p>
                  无论您是专业用户还是普通用户，{product.name}
                  都能适应您的需求，在任何情况下都能提供一致的结果。它的直观设计使其易于使用，而其坚固的结构确保它经得起时间的考验。
                </p>
                <ul>
                  <li>优质材料</li>
                  <li>符合人体工程学的舒适设计</li>
                  <li>多功能性</li>
                  <li>持久耐用</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">尺寸</h3>
                  <p className="text-sm">26.7 x 18.3 x 9.1 厘米</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">重量</h3>
                  <p className="text-sm">0.54 千克</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">材质</h3>
                  <p className="text-sm">高级铝合金和聚合物</p>
                </div>
                <div className="bg-muted/40 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">保修</h3>
                  <p className="text-sm">1年有限保修</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {[
                  {
                    name: '张明',
                    rating: 5,
                    date: '2个月前',
                    comment: '非常喜欢这个产品！它超出了我所有的期望，让我的生活变得更加便捷。',
                  },
                  {
                    name: '李华',
                    rating: 4,
                    date: '3个月前',
                    comment: '价格合理，品质优良。绝对会推荐给朋友和家人。',
                  },
                  {
                    name: '王芳',
                    rating: 3,
                    date: '4个月前',
                    comment: '产品质量不错。功能符合描述，但没有特别出色的地方。不过配送很快。',
                  },
                ].map((review, index) => (
                  <div key={index} className="border-b pb-6 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{review.name}</h4>
                        <div className="flex items-center mt-1">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'fill-gray-200 text-gray-200'
                                }`}
                              />
                            ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{review.comment}</p>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* 相关产品 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">相关产品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error('获取产品数据失败:', error);
    return null;
  }
}

// 加载中状态
function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-10 w-1/3" />
          <div className="space-y-3 pt-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <nav className="flex mb-6 text-sm">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                首页
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href={`/products`} className="text-muted-foreground hover:text-foreground">
                产品
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">产品详情</span>
            </li>
          </ol>
        </nav>

        <Suspense fallback={<LoadingSkeleton />}>
          <ProductDetail id={params.id} />
        </Suspense>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 购物系统. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}

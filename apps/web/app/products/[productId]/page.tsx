'use client';

import Link from 'next/link';
import { ChevronRight, Minus, Plus, ShoppingCart, Star, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/navbar';
import { ProductCard } from '@/components/product-card';
import { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/lib/cart-context';
import * as api from '@/lib/api';
import { Image } from '@/components/ui/image';

function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
      <Skeleton className="aspect-square w-full" />
      <div className="space-y-4">
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-10 w-1/3" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    </div>
  );
}

// 产品详情组件
function ProductDetail({ productId }: { productId: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const productData = await api.getProduct(productId);
        setProduct(productData);

        // 获取相关产品
        const allProducts = await api.getProducts(productData.category);
        const related = allProducts.filter((p: Product) => p.id !== productId).slice(0, 4);
        setRelatedProducts(related);

        setError(null);
      } catch (err) {
        console.error('获取产品数据失败:', err);
        setError('获取产品数据失败，请稍后再试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setIsActionLoading(true);

      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
      });

      toast({
        title: '已添加到购物车',
        description: `${product.name} × ${quantity} 已成功添加到购物车`,
        duration: 3000,
      });

      setQuantity(1);
    } catch (err) {
      toast({
        title: '添加失败',
        description: '添加商品到购物车时出错，请稍后再试',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;

    try {
      setIsActionLoading(true);

      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image,
      });

      router.push('/checkout');
    } catch (err) {
      toast({
        title: '操作失败',
        description: '处理您的请求时出错，请稍后再试',
        variant: 'destructive',
        duration: 3000,
      });
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="text-center py-12">
        <div className="text-xl font-medium text-gray-900 mb-2">产品不存在或发生错误</div>
        <p className="text-gray-500 mb-6">{error || '无法加载产品信息'}</p>
        <Button asChild>
          <Link href="/products">返回产品列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* 产品详情 */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* 产品图片 */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="aspect-square overflow-hidden rounded-md relative">
            {isLoading ? (
              <Skeleton className="absolute inset-0 z-10" />
            ) : (
              <Image
                src={product.image}
                alt={product.name}
                className="h-full w-full object-contain"
                fallbackAlt={product.name}
              />
            )}
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
                      i < Math.floor(product.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">
              {(product.rating || 0).toFixed(1)} ({product.reviewCount || 0} 评价)
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">减少数量</span>
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-none"
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (product.stock || 99)}
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">增加数量</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="sm:flex-1"
                onClick={handleAddToCart}
                disabled={isActionLoading || !product.inStock}
              >
                {isActionLoading ? (
                  <>加载中...</>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    加入购物车
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="sm:flex-1"
                onClick={handleBuyNow}
                disabled={isActionLoading || !product.inStock}
              >
                {isActionLoading ? '加载中...' : '立即购买'}
              </Button>
            </div>

            {!product.inStock && <div className="text-red-500 font-medium">该商品当前缺货</div>}

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
          <TabsList className="w-full border-b pb-px">
            <TabsTrigger value="details">详细信息</TabsTrigger>
            <TabsTrigger value="shipping">配送与退货</TabsTrigger>
            <TabsTrigger value="reviews">用户评价</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">产品特点</h4>
                <ul className="mt-2 space-y-1 list-disc list-inside text-muted-foreground">
                  <li>优质材料，耐用性强</li>
                  <li>精美设计，注重细节</li>
                  <li>多功能用途，提升使用体验</li>
                  <li>环保制造，符合现代标准</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium">规格参数</h4>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">品牌</span>
                    <span>优质品牌</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">型号</span>
                    <span>PRO-2023</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">尺寸</span>
                    <span>适中</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">材质</span>
                    <span>高级材料</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">保修</span>
                    <span>1年</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-muted-foreground">产地</span>
                    <span>中国</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="shipping" className="pt-4">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">配送信息</h4>
                <p className="mt-2 text-muted-foreground">
                  我们提供全国范围内的配送服务。标准配送时间为1-3个工作日，偏远地区可能需要额外1-2天。订单满200元享受免费配送，否则配送费为15元。
                </p>
              </div>
              <div>
                <h4 className="font-medium">退货政策</h4>
                <p className="mt-2 text-muted-foreground">
                  自收到商品之日起30天内，如产品未使用且保持原包装完好，可申请无理由退货。部分特殊商品可能不支持退货，详情请参考商品描述。退货运费由买家承担。
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="pt-4">
            <div className="space-y-6">
              {[
                {
                  name: '张先生',
                  rating: 5,
                  date: '2023年12月15日',
                  comment:
                    '非常满意的购物体验，产品质量超出预期，快递很快，包装也很好，会继续支持！',
                },
                {
                  name: '李女士',
                  rating: 4,
                  date: '2023年11月28日',
                  comment:
                    '整体不错，使用了一周感觉质量可靠，就是价格稍贵了点，希望有更多优惠活动。',
                },
                {
                  name: '王先生',
                  rating: 5,
                  date: '2023年10月17日',
                  comment:
                    '朋友推荐购买的，确实名不虚传，各方面都很好，尤其是做工和质感，非常推荐！',
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
          {relatedProducts && relatedProducts.length > 0 ? (
            relatedProducts.map(product => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">暂无相关产品</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function ProductPage({ params }: { params: { productId: string } }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* 面包屑导航 */}
        <nav className="text-sm mb-6">
          <ol className="flex items-center space-x-1">
            <li>
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                首页
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Link href="/products" className="text-muted-foreground hover:text-foreground">
                产品
              </Link>
            </li>
            <li className="flex items-center space-x-1">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">详情</span>
            </li>
          </ol>
        </nav>

        <ProductDetail productId={params.productId} />
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 购物系统. 保留所有权利.</p>
        </div>
      </footer>
    </div>
  );
}

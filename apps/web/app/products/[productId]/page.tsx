'use client';

import Link from 'next/link';
import { Check, Minus, Plus, Search, ShoppingCart, Star, Truck } from 'lucide-react';
import type { Usable } from 'react';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Navbar } from '@/components/navbar';
import { ProductCard } from '@/components/product-card';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { useCartAddToCart } from '@/lib/store/cartStore';
import { cn } from '@/lib/utils/utils';
import { useProductStore } from '@/lib/store/productStore';
import Image from '@/components/ui/image';

function LoadingSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
      <div className="aspect-square rounded-3xl overflow-hidden bg-gray-100">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-6 w-3/5" />
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <div className="space-y-4 pt-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

// Apple风格的产品详情组件
function ProductDetail({ productId }: { productId: string }) {
  const { product, relatedProducts, isLoading, error, fetchProduct, fetchRelatedProducts } =
    useProductStore();
  const [isAddToCartLoading, setIsAddToCartLoading] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const addToCart = useCartAddToCart();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchProduct(productId);
  }, [productId, fetchProduct]);

  useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      fetchRelatedProducts(product.category, product.id);
    }
  }, [product, fetchRelatedProducts]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      setIsAddToCartLoading(true);
      await addToCart(product, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      toast({
        title: '已添加到购物车',
        description: `${product.name} × ${quantity} 已成功添加到购物车`,
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: '添加失败',
        description: '添加商品到购物车时出错，请稍后再试',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsAddToCartLoading(false);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      setIsBuyNowLoading(true);
      router.push('/checkout');
    } catch (err) {
      toast({
        title: '操作失败',
        description: '处理您的请求时出错，请稍后再试',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsBuyNowLoading(false);
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
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/products">返回产品列表</Link>
        </Button>
      </div>
    );
  }

  // 模拟产品多张图片
  const productImages = [
    product.image,
    `https://picsum.photos/seed/${product.id}-1/800/800`,
    `https://picsum.photos/seed/${product.id}-2/800/800`,
  ];

  // 处理图片点击 - 用于移动设备
  const handleImageClick = () => {
    setFullscreenImage(true);
  };

  // 关闭全屏图片
  const handleCloseFullscreen = () => {
    setFullscreenImage(false);
  };

  return (
    <>
      {/* 全屏图片展示 - 移动设备使用 */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={handleCloseFullscreen}
        >
          <div className="relative w-full max-w-3xl">
            <button
              className="absolute top-2 right-2 bg-white/20 rounded-full p-2"
              onClick={handleCloseFullscreen}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <Image
              src={selectedImage || product.image}
              alt={product.name}
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* Apple风格产品详情 */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* 产品图片部分，左侧 */}
        <div className="space-y-4">
          <div
            className="aspect-square bg-[#fafafa] rounded-3xl overflow-hidden flex items-center justify-center p-8 relative cursor-zoom-in"
            onClick={handleImageClick}
            ref={imageContainerRef}
          >
            <Image
              src={selectedImage || product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300"
              loading="lazy"
            />

            {/* 点击查看大图提示 */}
            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 text-xs text-gray-600 shadow-sm">
              <Search className="h-3 w-3" />
              <span>点击查看大图</span>
            </div>
          </div>

          {/* 缩略图导航 */}
          <div className="flex justify-center gap-4">
            {productImages.map((img, index) => (
              <button
                key={index}
                className={cn(
                  'w-20 h-20 rounded-xl overflow-hidden border-2 bg-[#fafafa]',
                  selectedImage === img ? 'border-blue-500' : 'border-transparent'
                )}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img}
                  alt={`${product.name} 视图 ${index + 1}`}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        {/* 产品信息部分，右侧 */}
        <div className="flex flex-col">
          {/* 类别和名称 */}
          <div className="mb-6">
            <div className="text-sm text-blue-600 font-medium mb-1">
              {getCategoryLabel(product.category)}
            </div>
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">{product.name}</h1>

            {/* 评分 */}
            <div className="flex items-center mt-3">
              <div className="flex items-center">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating || 0)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-200 text-gray-200'
                      }`}
                    />
                  ))}
              </div>
              <span className="ml-2 text-sm text-gray-500">
                {(product.rating || 0).toFixed(1)} ({product.reviewCount || 0} 评价)
              </span>
            </div>
          </div>

          {/* 价格区域 */}
          <div className="mb-8">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-medium">¥{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-lg text-gray-500 line-through">
                  ¥{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.originalPrice && (
              <div className="mt-1 text-sm text-green-600">
                节省 ¥{(product.originalPrice - product.price).toFixed(2)} (
                {Math.round((1 - product.price / product.originalPrice) * 100)}% 优惠)
              </div>
            )}
          </div>

          {/* 产品描述 */}
          <div className="mb-8 text-gray-600">
            <p>
              {product.description ||
                '这款优质产品提供卓越的品质和价值。适合日常使用，它将耐用性与优雅的设计相结合。由高品质材料制成，经久耐用，同时保持其时尚外观。'}
            </p>
          </div>

          {/* 库存和配送信息 */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center text-sm">
              <div
                className={cn(
                  'w-4 h-4 rounded-full mr-2 flex items-center justify-center',
                  product.inStock ? 'bg-green-500' : 'bg-red-500'
                )}
              >
                {product.inStock && <Check className="h-3 w-3 text-white" />}
              </div>
              <span>{product.inStock ? '现货' : '缺货'}</span>
            </div>

            <div className="flex items-center text-sm text-green-600">
              <Truck className="h-4 w-4 mr-2" />
              <span>订单满¥200免运费，预计{product.inStock ? '1-3天内发货' : '暂时无法发货'}</span>
            </div>
          </div>

          {/* 数量选择器 */}
          <div className="mb-8">
            <div className="font-medium mb-2">数量</div>
            <div className="inline-flex items-center border border-gray-300 rounded-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-gray-600"
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
                className="h-10 w-10 rounded-full text-gray-600"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= (product.stock || 99)}
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">增加数量</span>
              </Button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col gap-4 mt-auto">
            <Button
              size="lg"
              className={cn(
                'rounded-full h-14 text-base transition-all duration-300',
                addedToCart ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
              )}
              onClick={handleAddToCart}
              disabled={isAddToCartLoading || !product.inStock}
            >
              {isAddToCartLoading ? (
                <>加载中...</>
              ) : addedToCart ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  已添加到购物车
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  加入购物车
                </>
              )}
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="rounded-full h-14 text-base border-2"
              onClick={handleBuyNow}
              disabled={isBuyNowLoading || !product.inStock}
            >
              {isBuyNowLoading ? '加载中...' : '立即购买'}
            </Button>

            {!product.inStock && (
              <div className="text-red-500 font-medium text-center mt-2">该商品当前缺货</div>
            )}
          </div>
        </div>
      </div>

      {/* 产品详情选项卡 - Apple风格 */}
      <div className="mt-16 max-w-4xl mx-auto">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-100 rounded-full p-1 h-12">
            <TabsTrigger value="details" className="rounded-full data-[state=active]:bg-white">
              详细信息
            </TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-full data-[state=active]:bg-white">
              配送与退货
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-white">
              用户评价
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-4">产品特点</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>优质材料，耐用性强</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>精美设计，注重细节</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>多功能用途，提升使用体验</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>环保制造，符合现代标准</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-4">规格参数</h3>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">品牌</span>
                        <span className="font-medium">优质品牌</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <span className="text-gray-500">型号</span>
                        <span className="font-medium">PRO-2023</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <span className="text-gray-500">尺寸</span>
                        <span className="font-medium">适中</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">材质</span>
                        <span className="font-medium">高级材料</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <span className="text-gray-500">保修</span>
                        <span className="font-medium">1年</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <span className="text-gray-500">产地</span>
                        <span className="font-medium">中国</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shipping" className="pt-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-4">配送信息</h3>
                <p className="text-gray-600 bg-gray-50 rounded-2xl p-6">
                  我们提供全国范围内的配送服务。标准配送时间为1-3个工作日，偏远地区可能需要额外1-2天。订单满200元享受免费配送，否则配送费为15元。
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-4">退货政策</h3>
                <p className="text-gray-600 bg-gray-50 rounded-2xl p-6">
                  自收到商品之日起30天内，如产品未使用且保持原包装完好，可申请无理由退货。部分特殊商品可能不支持退货，详情请参考商品描述。退货运费由买家承担。
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-8">
            <div className="space-y-8">
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
                <div key={index} className="bg-gray-50 rounded-2xl p-6">
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
                    <span className="text-sm text-gray-500">{review.date}</span>
                  </div>
                  <p className="mt-4 text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 相关产品 - Apple风格 */}
      <div className="mt-20">
        <h2 className="text-3xl font-semibold text-center mb-12">更多推荐</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relatedProducts && relatedProducts.length > 0 ? (
            relatedProducts.map(product => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-500">暂无相关产品</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// 获取类别友好名称
function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    electronics: '电子产品',
    clothing: '服装',
    'home-kitchen': '家居厨房',
    books: '图书',
  };

  return (
    categoryMap[category] ||
    category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' & ')
  );
}

export default function ProductPage({ params }: { params: Usable<{ productId: string }> }) {
  const { productId } = use(params);
  return (
    <div className="flex flex-col min-h-screen bg-[#f5f5f7]">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <ProductDetail productId={productId} />
      </main>

      <Footer />
    </div>
  );
}

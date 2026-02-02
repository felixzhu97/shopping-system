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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
        title: t('common.added_to_cart'),
        description: `${product.name} × ${quantity} ${t('common.added_to_cart_message')}`,
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: t('common.add_to_cart_failed'),
        description: t('common.add_to_cart_failed_message'),
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
      await addToCart(product, quantity);
      router.push('/checkout');
    } catch (err) {
      toast({
        title: t('common.operation_failed'),
        description: t('common.operation_failed_message'),
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
        <div className="text-xl font-medium text-gray-900 mb-2">
          {t('common.product_not_found')}
        </div>
        <p className="text-gray-500 mb-6">{error || t('common.product_not_found_message')}</p>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link href="/products">{t('common.return_to_product_list')}</Link>
        </Button>
      </div>
    );
  }

  const productImages = [
    product.image,
    `https://picsum.photos/seed/${product.id}-1/800/800`,
    `https://picsum.photos/seed/${product.id}-2/800/800`,
  ];

  const handleImageClick = () => {
    setFullscreenImage(true);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage(false);
  };

  return (
    <>
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

      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        <div className="space-y-4">
          <div
            className="aspect-square bg-[#fafafa] rounded-3xl overflow-hidden flex items-center justify-center p-8 relative cursor-zoom-in shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
            onClick={handleImageClick}
            ref={imageContainerRef}
          >
            <Image
              src={selectedImage || product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain transition-all duration-300"
              loading="lazy"
            />

            <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 text-xs text-gray-600 shadow-sm">
              <Search className="h-3 w-3" />
              <span>{t('common.click_to_view_large_image')}</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            {productImages.map((img, index) => (
              <button
                key={index}
                className={cn(
                  'w-20 h-20 rounded-xl overflow-hidden border-2 bg-[#fafafa] shadow-md hover:shadow-lg transition-all duration-300 ease-out hover:scale-105',
                  selectedImage === img ? 'border-blue-500' : 'border-transparent'
                )}
                onClick={() => setSelectedImage(img)}
              >
                <Image
                  src={img}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-contain p-2"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-6">
            <div className="text-sm text-blue-600 font-medium mb-1">
              {getCategoryLabel(product.category)}
            </div>
            <h1 className="text-4xl font-semibold text-gray-900 tracking-tight">{product.name}</h1>

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
                {(product.rating || 0).toFixed(1)} ({product.reviewCount || 0} {t('common.reviews')}
                )
              </span>
            </div>
          </div>

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
                {t('common.save')} ¥{(product.originalPrice - product.price).toFixed(2)} (
                {Math.round((1 - product.price / product.originalPrice) * 100)}%{' '}
                {t('common.discount')})
              </div>
            )}
          </div>

          <div className="mb-8 text-gray-600">
            <p>{product.description || t('common.product_description')}</p>
          </div>

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
              <span>{product.inStock ? t('common.in_stock') : t('common.out_of_stock')}</span>
            </div>

            <div className="flex items-center text-sm text-green-600">
              <Truck className="h-4 w-4 mr-2" />
              <span>
                {t('common.order_free_shipping')}¥200 {t('common.expected_delivery_time')}
                {product.inStock ? t('common.in_stock') : t('common.out_of_stock')}
              </span>
            </div>
          </div>

          <div className="mb-8">
            <div className="font-medium mb-2">{t('common.quantity')}</div>
            <div className="inline-flex items-center border border-gray-300 rounded-full">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full text-gray-600"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
                <span className="sr-only">{t('common.decrease_quantity')}</span>
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
                <span className="sr-only">{t('common.increase_quantity')}</span>
              </Button>
            </div>
          </div>

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
                <>{t('common.loading')}...</>
              ) : addedToCart ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  {t('common.added_to_cart')}
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {t('common.add_to_cart')}
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
              {isBuyNowLoading ? t('common.loading') : t('common.buy_now')}
            </Button>

            {!product.inStock && (
              <div className="text-red-500 font-medium text-center mt-2">
                {t('common.out_of_stock')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-4xl mx-auto">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-gray-100 rounded-full p-1 h-12">
            <TabsTrigger value="details" className="rounded-full data-[state=active]:bg-white">
              {t('common.details')}
            </TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-full data-[state=active]:bg-white">
              {t('common.shipping_and_return')}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full data-[state=active]:bg-white">
              {t('common.user_reviews')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="pt-8">
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-medium mb-4">{t('common.product_features')}</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{t('common.high_quality_material')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{t('common.beautiful_design')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{t('common.multi_function')}</span>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                      <Check className="h-4 w-4" />
                    </div>
                    <span>{t('common.environmental_protection')}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-4">{t('common.specification_parameters')}</h3>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('common.brand')}</span>
                        <span className="font-medium">{t('common.high_quality_brand')}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <span className="text-gray-500">{t('common.model')}</span>
                        <span className="font-medium">{t('common.pro_2023')}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <span className="text-gray-500">{t('common.size')}</span>
                        <span className="font-medium">{t('common.medium')}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t('common.material')}</span>
                        <span className="font-medium">{t('common.high_quality_material')}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <span className="text-gray-500">{t('common.warranty')}</span>
                        <span className="font-medium">{t('common.one_year')}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-4 flex justify-between">
                        <span className="text-gray-500">{t('common.origin')}</span>
                        <span className="font-medium">{t('common.china')}</span>
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
                <h3 className="text-xl font-medium mb-4">{t('common.shipping_information')}</h3>
                <p className="text-gray-600 bg-gray-50 rounded-2xl p-6">
                  {t('common.we_provide_national_delivery_service')}
                  {t('common.standard_delivery_time')}
                  {t('common.remote_areas_may_require_additional_1-3_days')}
                  {t('common.free_delivery_for_orders_over_200_yuan')}
                  {t('common.delivery_fee_is_15_yuan')}
                </p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-4">{t('common.return_policy')}</h3>
                <p className="text-gray-600 bg-gray-50 rounded-2xl p-6">
                  {t('common.return_policy_description')}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="pt-8">
            <div className="space-y-8">
              {[
                {
                  name: 'Alex',
                  rating: 5,
                  date: 'Dec 15, 2023',
                  comment:
                    'Great shopping experience. The product quality exceeded my expectations, delivery was fast, and the packaging was solid.',
                },
                {
                  name: 'Sophia',
                  rating: 4,
                  date: 'Nov 28, 2023',
                  comment:
                    'Overall good. After a week of use it feels reliable, but the price is a bit high. Hope to see more promotions.',
                },
                {
                  name: 'Michael',
                  rating: 5,
                  date: 'Oct 17, 2023',
                  comment:
                    'Recommended by a friend and it lives up to the hype. Great build quality and feel. Highly recommended.',
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

      <div className="mt-20">
        <h2 className="text-3xl font-semibold text-center mb-12">
          {t('common.more_recommendations')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {relatedProducts && relatedProducts.length > 0 ? (
            relatedProducts.map(product => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-500">{t('common.no_related_products')}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function getCategoryLabel(category: string): string {
  const categoryMap: Record<string, string> = {
    electronics: 'Electronics',
    clothing: 'Clothing',
    'home-kitchen': 'Home & Kitchen',
    books: 'Books',
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

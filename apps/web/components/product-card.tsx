'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import type { Product } from '@/lib/types';
import { useCartStore } from '@/lib/stores/cartStore';
import { Image } from '@/components/ui/image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCartStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // 确保产品ID是字符串
  const productId = String(product.id);

  const handleAddToCart = async () => {
    if (!product.inStock) return;

    setIsLoading(true);

    try {
      // 将商品添加到购物车
      await addToCart({
        id: productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      });

      // 显示添加成功的通知
      toast({
        title: '已添加到购物车',
        description: `${product.name} 已成功添加到购物车`,
        duration: 3000,
      });
    } catch (error) {
      console.error('添加到购物车失败:', error);
      toast({
        title: '添加失败',
        description: '添加商品到购物车时出错，请稍后再试',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="group flex flex-col">
      <Link href={`/products/${productId}`} className="flex flex-col flex-1">
        <div className="relative mb-4 overflow-hidden rounded-xl bg-gray-100 p-6">
          <Image
            src={product.image}
            alt={product.name}
            className="mx-auto h-48 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            fallbackAlt={product.name}
            loading={'lazy'}
          />
        </div>
        <div className="flex flex-col space-y-1 text-center">
          <h3 className="text-sm font-medium text-gray-600">{product.name}</h3>
          <p className="text-base font-semibold">¥{product.price.toFixed(2)}</p>
          {product.originalPrice && (
            <p className="text-xs text-gray-500">
              原价: <span className="line-through">¥{product.originalPrice.toFixed(2)}</span>
            </p>
          )}
          {product.rating && (
            <div className="mx-auto mt-1 flex items-center justify-center space-x-1 text-xs text-gray-500">
              <span className="font-medium">{product.rating.toFixed(1)}</span>
              <span>★</span>
              <span>({product.reviewCount || 0}条评价)</span>
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4">
        <Button
          variant="outline"
          className="w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-100"
          onClick={handleAddToCart}
          disabled={isLoading || !product.inStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.inStock ? '加入购物车' : '缺货'}
        </Button>
      </div>
    </div>
  );
}

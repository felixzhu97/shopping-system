'use client';

import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { useCart } from '@/lib/cart-context';
import { Image } from '@/components/ui/image';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!product.inStock) return;

    setIsLoading(true);

    try {
      // 将商品添加到购物车
      await addToCart({
        id: product.id,
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
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <Link href={`/products/${product.id}`}>
          <div className="aspect-square overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform hover:scale-105"
              fallbackAlt={product.name}
            />
          </div>
          <div className="p-4">
            <h3 className="font-medium line-clamp-1">{product.name}</h3>
            <div className="flex items-center gap-0.5 mt-1">
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
              <span className="text-xs text-gray-500 ml-1">({product.reviewCount || 0})</span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold">¥{product.price.toFixed(2)}</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ¥{product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </Link>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isLoading || !product.inStock}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.inStock ? '加入购物车' : '缺货'}
        </Button>
      </CardFooter>
    </Card>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils/utils';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

const CartItem = React.memo(function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState<string | null>(null);

  // 处理数量变化
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);
    if (newQuantity === quantity) return;

    setIsUpdating(true);
    setError(null);

    try {
      setQuantity(newQuantity);
      onUpdateQuantity(item.productId, newQuantity);
    } catch (err) {
      setError('更新数量失败');
      // 恢复原始数量
      setQuantity(item.quantity);
      console.error('更新购物车数量失败:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理移除商品
  const handleRemove = () => {
    setIsRemoving(true);
    setError(null);

    try {
      onRemove(item.productId);
    } catch (err) {
      setError('移除商品失败');
      console.error('从购物车移除商品失败:', err);
      setIsRemoving(false);
    }
  };

  if (!item.product) {
    return null;
  }

  return (
    <div className={`py-6 ${isRemoving ? 'opacity-50' : ''} transition-opacity`}>
      <div className="flex items-start gap-6">
        <Link
          href={`/products/${item.productId}`}
          className="relative h-24 w-24 overflow-hidden rounded-xl bg-[#f5f5f7] p-2 flex-shrink-0 transition-transform hover:scale-105"
        >
          <Image
            src={item.product.image}
            alt={item.product.name}
            className="h-full w-full object-contain"
            fallbackAlt={item.product.name}
            width={96}
            height={96}
          />
        </Link>

        <div className="flex-1 space-y-1">
          <Link
            href={`/products/${item.productId}`}
            className="font-medium text-gray-900 hover:text-blue-600 transition-colors"
          >
            {item.product.name}
          </Link>

          <div className="text-sm text-gray-500">单价: ¥{item.product.price.toFixed(2)}</div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
            <div className="inline-flex items-center border border-gray-300 rounded-full overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 rounded-none text-gray-600',
                  quantity <= 1 ? 'opacity-50' : 'hover:bg-gray-100'
                )}
                onClick={() => handleQuantityChange(-1)}
                disabled={isUpdating || quantity <= 1}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">减少数量</span>
              </Button>
              <span className="w-10 text-center text-sm font-medium">
                {isUpdating ? <Skeleton className="h-4 w-4 mx-auto" /> : quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none text-gray-600 hover:bg-gray-100"
                onClick={() => handleQuantityChange(1)}
                disabled={isUpdating}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">增加数量</span>
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-600 hover:text-red-600 transition-colors"
                onClick={handleRemove}
                disabled={isRemoving}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="text-sm">{isRemoving ? '移除中...' : '移除'}</span>
              </Button>

              <div className="font-medium">¥{(item.product.price * quantity).toFixed(2)}</div>
            </div>
          </div>

          {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
        </div>
      </div>
    </div>
  );
});

export { CartItem };

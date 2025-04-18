'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Minus, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CartItem as CartItemType } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState<string | null>(null);

  // 处理数量变化
  const handleQuantityChange = async (delta: number) => {
    const newQuantity = Math.max(1, quantity + delta);

    if (newQuantity === quantity) return;

    setIsUpdating(true);
    setError(null);

    try {
      setQuantity(newQuantity);
      await onUpdateQuantity(item.id, newQuantity);
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
  const handleRemove = async () => {
    setIsRemoving(true);
    setError(null);

    try {
      await onRemove(item.id);
    } catch (err) {
      setError('移除商品失败');
      console.error('从购物车移除商品失败:', err);
      setIsRemoving(false);
    }
  };

  return (
    <div className={`py-6 ${isRemoving ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-4">
        <Link
          href={`/products/${item.id}`}
          className="relative h-24 w-24 overflow-hidden rounded-md border flex-shrink-0"
        >
          {item.image ? (
            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
              无图片
            </div>
          )}
        </Link>

        <div className="flex-1 space-y-1">
          <Link href={`/products/${item.id}`} className="font-medium hover:underline">
            {item.name}
          </Link>
          <div className="text-base font-medium">¥{item.price.toFixed(2)}</div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <div className="inline-flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => handleQuantityChange(-1)}
                disabled={isUpdating || quantity <= 1}
              >
                <Minus className="h-3 w-3" />
                <span className="sr-only">减少数量</span>
              </Button>
              <span className="w-8 text-center text-sm">
                {isUpdating ? <Skeleton className="h-4 w-4 mx-auto" /> : quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none"
                onClick={() => handleQuantityChange(1)}
                disabled={isUpdating}
              >
                <Plus className="h-3 w-3" />
                <span className="sr-only">增加数量</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-muted-foreground"
              onClick={handleRemove}
              disabled={isRemoving}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {isRemoving ? '移除中...' : '移除'}
            </Button>
          </div>

          {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
        </div>

        <div className="font-medium">¥{(item.price * quantity).toFixed(2)}</div>
      </div>
    </div>
  );
}

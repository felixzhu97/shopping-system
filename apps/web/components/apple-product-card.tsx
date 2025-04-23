'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';

interface AppleProductCardProps {
  product: Product;
  showDescription?: boolean;
}

export function AppleProductCard({ product, showDescription = true }: AppleProductCardProps) {
  // 确保产品ID是字符串
  const productId = String(product.id);

  return (
    <div className="flex flex-col">
      <Link href={`/products/${productId}`} className="group relative">
        {/* 商品图片区域 */}
        <div className="aspect-square bg-[#fafafa] rounded-2xl p-4 mb-3 flex items-center justify-center overflow-hidden relative">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform group-hover:scale-105"
          />
        </div>

        {/* 商品信息 */}
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-900 mb-1">{product.name}</h3>
          {showDescription && product.description && (
            <p className="text-sm text-gray-600 mb-1 line-clamp-2">
              {product.description.substring(0, 60)}...
            </p>
          )}
          <div className="flex items-center justify-center gap-2">
            <p className="text-lg font-medium text-gray-900">¥{product.price.toFixed(2)}</p>
            {product.originalPrice && (
              <p className="text-sm text-gray-500 line-through">
                ¥{product.originalPrice.toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

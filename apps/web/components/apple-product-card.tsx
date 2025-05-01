'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import Image from '@/components/ui/image';

interface AppleProductCardProps {
  product: Product;
  showDescription?: boolean;
}

export function AppleProductCard({ product }: AppleProductCardProps) {
  // 确保产品ID是字符串
  const productId = String(product.id);

  return (
    <div className="flex flex-col bg-white rounded-[28px] p-8 hover:scale-[1.02] transition-transform duration-300 shadow-sm">
      <Link href={`/products/${productId}`} className="group">
        {/* 商品图片区域 */}
        <div className="aspect-square flex items-center justify-center overflow-hidden relative mb-6">
          <Image
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain"
            loading="lazy"
          />
        </div>

        {/* 商品信息 */}
        <div className="text-center">
          <h3 className="text-[21px] font-normal text-[#1d1d1f] mb-2 text-left">{product.name}</h3>
          <p className="text-[14px] font-normal text-sm text-gray-500 text-left">
            ¥{product.price.toFixed(2)}
          </p>
        </div>
      </Link>
    </div>
  );
}

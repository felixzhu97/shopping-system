'use client';

import Link from 'next/link';
import { Image } from '@/components/ui/image';

import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // 确保产品ID是字符串
  const productId = String(product.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      <Link href={`/products/${productId}`} className="block">
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
          <Image
            src={product.image}
            alt={product.name}
            className="object-cover hover:scale-105 transition-transform duration-300 aspect-square"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h3 className="text-md font-medium mb-2">{product.name}</h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-regular text-gray-500">
              ¥{product.price.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

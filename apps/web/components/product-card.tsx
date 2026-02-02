'use client';

import Link from 'next/link';
import { Image } from '@/components/ui/image';

import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const productId = String(product.id);
  const priceText = typeof product.price === 'number' ? product.price.toLocaleString() : '--';

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.01]">
      <Link href={`/products/${productId}`} className="block">
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
          <Image
            src={product.image}
            alt={product.name}
            className="object-cover transition-transform duration-300 aspect-square"
            loading="lazy"
          />
        </div>
        <div className="p-4">
          <h3 className="text-md font-medium mb-2">{product.name}</h3>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-regular text-gray-500">
              ¥{priceText}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

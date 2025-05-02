'use client';

import Link from 'next/link';
import { Image } from '@/components/ui/image';
import { Star } from 'lucide-react';

import type { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // 确保产品ID是字符串
  const productId = String(product.id);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm">
      <Link href={`/products/${productId}`} className="block">
        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
          <Image
            src={product.image}
            alt={product.name}
            className="object-cover hover:scale-105 transition-transform duration-300 aspect-square"
          />
        </div>
        <div className="p-4">
          <div className="flex items-center gap-1 mb-2 text-sm">
            {renderStars(product.rating || 0)}
            <span className="text-gray-500">({product.rating || 0})</span>
          </div>
          <h3 className="text-md font-medium mb-2">{product.name}</h3>
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-gray-500 line-clamp-1">{product.description}</span>
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold">¥{product.price.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}

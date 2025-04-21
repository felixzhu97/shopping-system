import React from 'react';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { Image } from '@/components/ui/image';

// 定义产品类型
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
}

// 获取产品详情数据
async function getProduct(productId: string): Promise<Product> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/products/${productId}`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('产品获取失败');

    return res.json();
  } catch (error) {
    console.error('获取产品详情失败:', error);
    throw error;
  }
}

export default async function ProductPage({ params }: { params: { productId: string } }) {
  let product: Product;

  try {
    product = await getProduct(params.productId);
  } catch (error) {
    return notFound();
  }

  const discount =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* 产品图片 */}
        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            fallbackAlt={product.category}
          />
        </div>

        {/* 产品信息 */}
        <div className="flex flex-col space-y-4">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-gray-500">{product.category}</p>
          </div>

          {/* 价格信息 */}
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold">¥{product.price.toLocaleString()}</span>
            {discount > 0 && (
              <>
                <span className="text-gray-400 line-through">
                  ¥{product.originalPrice.toLocaleString()}
                </span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium">
                  节省 {discount}%
                </span>
              </>
            )}
          </div>

          {/* 评分信息 */}
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.rating.toFixed(1)} ({product.reviewCount} 评价)
            </span>
          </div>

          {/* 库存状态 */}
          <div>
            {product.inStock ? (
              <span className="text-green-600">有库存 ({product.stock})</span>
            ) : (
              <span className="text-red-600">缺货</span>
            )}
          </div>

          {/* 产品描述 */}
          <div>
            <h2 className="text-xl font-semibold mb-2">产品描述</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* 购买按钮 */}
          <div className="pt-4">
            <Button size="lg" className="w-full md:w-auto" disabled={!product.inStock}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              加入购物车
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

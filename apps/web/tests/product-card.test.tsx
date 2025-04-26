import { render, screen } from '@testing-library/react';
import { ProductCard } from '../components/product-card';
import { describe, it, expect } from 'vitest';
import { CartProvider } from '../lib/cart-context';
import type { Product } from '@/lib/types';

describe('ProductCard', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Product',
    price: 999.99,
    image: '/test-image.jpg',
    description: 'Test Description',
    rating: 4.5,
    reviewCount: 100,
    category: 'electronics',
    inStock: true,
    stock: 10,
  };

  it('渲染产品名称和价格', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/¥999.99/)).toBeInTheDocument();
  });

  it('渲染产品评分和评论数', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByText('4.5')).toBeInTheDocument();
    const reviewCountElement = screen.getByText(/100/, { exact: false });
    expect(reviewCountElement).toBeInTheDocument();
  });

  it('渲染"添加到购物车"按钮', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByRole('button', { name: /加入购物车/i })).toBeInTheDocument();
  });

  it('正确显示产品图片', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    const image = screen.getByRole('img', { name: 'Test Product' });
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });
});

import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';
import { describe, it, expect } from 'vitest';
import type { Product } from '@/lib/types';

// 模拟产品数据
const mockProduct: Product = {
  id: '1',
  name: '测试产品',
  price: 99.99,
  rating: 4.5,
  reviewCount: 123,
  image: '/test-image.jpg',
  description: '这是一个测试产品的描述',
  category: '测试分类',
  inStock: true,
};

describe('ProductCard', () => {
  it('渲染产品名称和价格', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('测试产品')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('渲染产品评分和评论数', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('(123)')).toBeInTheDocument();
  });

  it('渲染"添加到购物车"按钮', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('正确显示产品图片', () => {
    render(<ProductCard product={mockProduct} />);
    
    const image = screen.getByAltText('测试产品');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });
}); 
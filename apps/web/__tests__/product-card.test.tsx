import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product-card';
import { vi, beforeEach, describe, it, expect } from 'vitest';

// Mock the Image component
vi.mock('@/components/ui/image', () => ({
  Image: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const mockProduct = {
  id: '1',
  name: '测试商品',
  description: '这是一个测试商品的描述',
  price: 99.99,
  image: '/test-product.jpg',
  category: 'test',
  stock: 5,
};

describe('ProductCard', () => {
  it('should render product information correctly', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('测试商品')).toBeInTheDocument();
    expect(screen.getByText('¥99.99')).toBeInTheDocument();
  });

  it('should render product image', () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('测试商品');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-product.jpg');
  });

  it('should have a link to the product page', () => {
    render(<ProductCard product={mockProduct} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/1');
  });
});

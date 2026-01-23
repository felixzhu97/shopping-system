import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product-card';
import { vi, beforeEach, describe, it, expect } from 'vitest';

// Mock the Image component
vi.mock('@/components/ui/image', () => ({
  Image: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const mockProduct = {
  id: '1',
  name: 'iPhone 15 Pro',
  description: '新一代 iPhone，搭载 A17 Pro 芯片',
  price: 999.99,
  image: '/iphone-15-pro.jpg',
  category: 'electronics',
  stock: 10,
};

const productWithOriginalPrice = {
  ...mockProduct,
  originalPrice: 1099.99,
};

describe('ProductCard', () => {
  it('should render product basic information', () => {
    render(<ProductCard product={mockProduct} />);

    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.getByText('¥999.99')).toBeInTheDocument();
  });

  it('should render product image', () => {
    render(<ProductCard product={mockProduct} />);

    const image = screen.getByAltText('iPhone 15 Pro');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/iphone-15-pro.jpg');
  });

  it('should have a link to the product page', () => {
    render(<ProductCard product={mockProduct} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/1');
  });
});

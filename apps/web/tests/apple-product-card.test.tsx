import { render, screen } from '@testing-library/react';
import { ProductCard } from '@/components/product-card';
import { CartProvider } from '../lib/cart-context';

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
  it('渲染产品基本信息', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    expect(screen.getByText('iPhone 15 Pro')).toBeInTheDocument();
    expect(screen.getByText('¥999.99')).toBeInTheDocument();
    expect(screen.getByText(/新一代 iPhone，搭载 A17 Pro 芯片/)).toBeInTheDocument();
  });

  it('渲染产品图片', () => {
    render(
      <CartProvider>
        <ProductCard product={mockProduct} />
      </CartProvider>
    );

    const image = screen.getByAltText('iPhone 15 Pro');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/iphone-15-pro.jpg');
  });

  it('不显示描述当 showDescription 为 false', () => {
    render(<ProductCard product={mockProduct} showDescription={false} />);

    expect(screen.queryByText(/新一代 iPhone，搭载 A17 Pro 芯片/)).not.toBeInTheDocument();
  });

  it('显示原价（如果有）', () => {
    render(<ProductCard product={productWithOriginalPrice} />);

    expect(screen.getByText('¥1099.99')).toBeInTheDocument();
  });
});

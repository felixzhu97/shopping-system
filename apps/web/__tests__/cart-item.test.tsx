import { render, screen, fireEvent } from '@testing-library/react';
import { CartItem } from '@/components/cart-item';
import { vi, beforeEach, describe, it, expect } from 'vitest';

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

// Mock the Image component
vi.mock('@/components/ui/image', () => ({
  Image: ({ alt, src }: { alt: string; src: string }) => <img alt={alt} src={src} />,
}));

const mockItem = {
  productId: '1',
  quantity: 2,
  product: {
    id: '1',
    name: '测试商品',
    description: '测试商品描述',
    price: 99.99,
    image: '/test-image.jpg',
    category: 'test',
    stock: 10,
  },
};

describe('CartItem', () => {
  const mockOnUpdateQuantity = vi.fn();
  const mockOnRemove = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders item information correctly', () => {
    render(
      <CartItem item={mockItem} onUpdateQuantity={mockOnUpdateQuantity} onRemove={mockOnRemove} />
    );

    expect(screen.getByText('测试商品')).toBeInTheDocument();
    expect(screen.getByText('单价: ¥99.99')).toBeInTheDocument();
    expect(screen.getByText('¥199.98')).toBeInTheDocument(); // 2 * 99.99
  });

  it('calls onUpdateQuantity when increasing quantity', () => {
    render(
      <CartItem item={mockItem} onUpdateQuantity={mockOnUpdateQuantity} onRemove={mockOnRemove} />
    );

    const increaseButton = screen.getByRole('button', { name: /增加数量/i });
    fireEvent.click(increaseButton);

    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 3);
  });

  it('calls onUpdateQuantity when decreasing quantity', () => {
    render(
      <CartItem item={mockItem} onUpdateQuantity={mockOnUpdateQuantity} onRemove={mockOnRemove} />
    );

    const decreaseButton = screen.getByRole('button', { name: /减少数量/i });
    fireEvent.click(decreaseButton);

    expect(mockOnUpdateQuantity).toHaveBeenCalledWith('1', 1);
  });

  it('calls onRemove when remove button is clicked', () => {
    render(
      <CartItem item={mockItem} onUpdateQuantity={mockOnUpdateQuantity} onRemove={mockOnRemove} />
    );

    const removeButton = screen.getByText('移除');
    fireEvent.click(removeButton);

    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('disables decrease button when quantity is 1', () => {
    const itemWithMinQuantity = {
      ...mockItem,
      quantity: 1,
    };

    render(
      <CartItem
        item={itemWithMinQuantity}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    const decreaseButton = screen.getByRole('button', { name: /减少数量/i });
    expect(decreaseButton).toBeDisabled();
  });
});

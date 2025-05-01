import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartItem } from '../components/cart-item';
import { CartItem as CartItemType } from '@/lib/types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockItem: CartItemType = {
  id: '1',
  name: '测试商品',
  price: 99.99,
  quantity: 1,
  image: '/test-image.jpg',
};

const mockOnUpdateQuantity = vi.fn().mockResolvedValue(undefined);
const mockOnRemove = vi.fn().mockResolvedValue(undefined);

describe('CartItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders item information correctly', () => {
    render(
      <CartItem item={mockItem} onUpdateQuantity={mockOnUpdateQuantity} onRemove={mockOnRemove} />
    );

    expect(screen.getByText(mockItem.name)).toBeInTheDocument();
    expect(screen.getByText(`单价: ¥${mockItem.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`¥${mockItem.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('calls onUpdateQuantity when increasing quantity', async () => {
    render(
      <CartItem item={mockItem} onUpdateQuantity={mockOnUpdateQuantity} onRemove={mockOnRemove} />
    );

    const increaseButton = screen.getByRole('button', { name: /增加数量/i });
    fireEvent.click(increaseButton);

    await waitFor(() => {
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith(mockItem.id, 2);
    });
  });

  it('calls onUpdateQuantity when decreasing quantity', async () => {
    render(
      <CartItem
        item={{ ...mockItem, quantity: 2 }}
        onUpdateQuantity={mockOnUpdateQuantity}
        onRemove={mockOnRemove}
      />
    );

    const decreaseButton = screen.getByRole('button', { name: /减少数量/i });
    fireEvent.click(decreaseButton);

    await waitFor(() => {
      expect(mockOnUpdateQuantity).toHaveBeenCalledWith(mockItem.id, 1);
    });
  });

  it('calls onRemove when remove button is clicked', async () => {
    render(
      <CartItem item={mockItem} onUpdateQuantity={mockOnUpdateQuantity} onRemove={mockOnRemove} />
    );

    const removeButton = screen.getByRole('button', { name: /移除/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(mockOnRemove).toHaveBeenCalledWith(mockItem.id);
    });
  });

  it('disables decrease button when quantity is 1', () => {
    render(
      <CartItem item={mockItem} onUpdateQuantity={mockOnUpdateQuantity} onRemove={mockOnRemove} />
    );

    const decreaseButton = screen.getByRole('button', { name: /减少数量/i });
    expect(decreaseButton).toBeDisabled();
  });
});

import { render, screen } from '@testing-library/react';
import { Navbar } from '../components/navbar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import {
  useCartStore,
  useCartItems,
  useCartSubtotal,
  useCartShipping,
  useCartTax,
  useCartTotal,
  useCartIsLoading,
  useCartError,
  useCartAddToCart,
  useCartUpdateQuantity,
  useCartRemoveFromCart,
  useCartClearCart,
} from '@/lib/store/cartStore';

// 模拟 next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

// 模拟 cart-store
vi.mock('@/lib/store/cartStore', () => ({
  useCartStore: vi.fn(),
  useCartItems: vi.fn(),
  useCartSubtotal: vi.fn(),
  useCartShipping: vi.fn(),
  useCartTax: vi.fn(),
  useCartTotal: vi.fn(),
  useCartIsLoading: vi.fn(),
  useCartError: vi.fn(),
  useCartAddToCart: vi.fn(),
  useCartUpdateQuantity: vi.fn(),
  useCartRemoveFromCart: vi.fn(),
  useCartClearCart: vi.fn(),
}));

describe('Navbar', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (useCartStore as any).mockReturnValue({
      items: [],
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
    });
    (useCartItems as any).mockReturnValue([]);
    (useCartSubtotal as any).mockReturnValue(0);
    (useCartShipping as any).mockReturnValue(0);
    (useCartTax as any).mockReturnValue(0);
    (useCartTotal as any).mockReturnValue(0);
    (useCartIsLoading as any).mockReturnValue(false);
    (useCartError as any).mockReturnValue(null);
    (useCartAddToCart as any).mockReturnValue(vi.fn());
    (useCartUpdateQuantity as any).mockReturnValue(vi.fn());
    (useCartRemoveFromCart as any).mockReturnValue(vi.fn());
    (useCartClearCart as any).mockReturnValue(vi.fn());
  });

  it('should render navbar title', () => {
    render(<Navbar />);
    expect(screen.getByText('首页')).toBeInTheDocument();
  });

  it('should render navbar links', () => {
    render(<Navbar />);

    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('全部商品')).toBeInTheDocument();
    expect(screen.getByText('电子产品')).toBeInTheDocument();
    expect(screen.getByText('服装')).toBeInTheDocument();
    expect(screen.getByText('家居厨房')).toBeInTheDocument();
    expect(screen.getByText('图书')).toBeInTheDocument();
  });

  it('should contain correct href attribute in navbar links', () => {
    render(<Navbar />);

    const homeLink = screen.getByRole('link', { name: '首页' });
    expect(homeLink).toHaveAttribute('href', '/');

    const productsLink = screen.getByRole('link', { name: '全部商品' });
    expect(productsLink).toHaveAttribute('href', '/products');

    const electronicsLink = screen.getByRole('link', { name: '电子产品' });
    expect(electronicsLink).toHaveAttribute('href', '/products?category=electronics');
  });

  it('should render search input', () => {
    render(<Navbar />);

    const searchInputs = screen.getAllByPlaceholderText('搜索 产品');
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it('should render cart button', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: /购物车/i })).toBeInTheDocument();
  });

  it('should render account related links', () => {
    render(<Navbar />);

    expect(screen.getByRole('link', { name: /账户设置/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /登录/i })).toBeInTheDocument();
  });

  it('should render cart icon and quantity', () => {
    const mockItems = [
      { productId: '1', quantity: 2, product: { id: '1', name: 'Product 1', price: 10 } },
      { productId: '2', quantity: 3, product: { id: '2', name: 'Product 2', price: 20 } },
    ];

    (useCartItems as any).mockReturnValue(mockItems);

    render(<Navbar />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not show quantity when there is no cart items', () => {
    render(<Navbar />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { Navbar } from '../components/navbar';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/cart';

// 模拟 next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
  useSearchParams: vi.fn().mockReturnValue(new URLSearchParams()),
}));

// 模拟 cart-context
vi.mock('@/lib/cart-store', () => ({
  useCartStore: vi.fn(),
}));

describe('Navbar', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (useCartStore as any).mockReturnValue({
      cartItems: [],
      itemCount: 0,
      subtotal: 0,
    });
  });

  it('渲染导航栏标题', () => {
    render(<Navbar />);
    expect(screen.getByText('首页')).toBeInTheDocument();
  });

  it('渲染导航链接', () => {
    render(<Navbar />);

    expect(screen.getByText('首页')).toBeInTheDocument();
    expect(screen.getByText('全部商品')).toBeInTheDocument();
    expect(screen.getByText('电子产品')).toBeInTheDocument();
    expect(screen.getByText('服装')).toBeInTheDocument();
    expect(screen.getByText('家居厨房')).toBeInTheDocument();
    expect(screen.getByText('图书')).toBeInTheDocument();
  });

  it('导航链接包含正确的 href 属性', () => {
    render(<Navbar />);

    const homeLink = screen.getByRole('link', { name: '首页' });
    expect(homeLink).toHaveAttribute('href', '/');

    const productsLink = screen.getByRole('link', { name: '全部商品' });
    expect(productsLink).toHaveAttribute('href', '/products');

    const electronicsLink = screen.getByRole('link', { name: '电子产品' });
    expect(electronicsLink).toHaveAttribute('href', '/products?category=electronics');
  });

  it('渲染搜索框', () => {
    render(<Navbar />);

    const searchInputs = screen.getAllByPlaceholderText('搜索 产品');
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it('渲染购物车按钮', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: /购物车/i })).toBeInTheDocument();
  });

  it('渲染账户按钮', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: /账户/i })).toBeInTheDocument();
  });

  it('渲染购物车图标和数量', () => {
    (useCartStore as any).mockReturnValue({
      cartItems: [],
      itemCount: 5,
      subtotal: 0,
    });

    render(<Navbar />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('当没有购物车数量时不显示数量', () => {
    render(<Navbar />);

    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });
});

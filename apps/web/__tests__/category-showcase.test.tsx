import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CategoryShowcase from '../components/home/category-showcase';

// Mock the API
vi.mock('../lib/api', () => ({
  getProducts: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'iPhone 15',
      description: '最新iPhone',
      image: '/iphone.jpg',
    },
    {
      id: '2',
      name: 'MacBook Air',
      description: '超薄笔记本',
      image: '/macbook.jpg',
    },
    {
      id: '3',
      name: 'AirPods',
      description: '无线耳机',
      image: '/airpods.jpg',
    },
  ]),
}));

// Mock Next.js components
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('../components/ui/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

vi.mock('../components/ui/button', () => ({
  Button: ({ children, asChild, ...props }: any) =>
    asChild ? children : <button {...props}>{children}</button>,
}));

vi.mock('../components/ui/loading-spinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

describe('CategoryShowcase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component without crashing', async () => {
    render(<CategoryShowcase />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });

    // Just check that something is rendered
    expect(document.body).toBeTruthy();
  });

  it('should render featured products when data is available', async () => {
    render(<CategoryShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });

    // Check for product names
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('MacBook Air')).toBeInTheDocument();
    expect(screen.getByText('AirPods')).toBeInTheDocument();
  });

  it('should render product descriptions', async () => {
    render(<CategoryShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('最新iPhone')).toBeInTheDocument();
    });

    // Check for product descriptions
    expect(screen.getByText('最新iPhone')).toBeInTheDocument();
    expect(screen.getByText('超薄笔记本')).toBeInTheDocument();
    expect(screen.getByText('无线耳机')).toBeInTheDocument();
  });

  it('should render product images', async () => {
    render(<CategoryShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByAltText('iPhone 15')).toBeInTheDocument();
    });

    // Check for product images
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(3);

    // Check specific images
    expect(screen.getByAltText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByAltText('MacBook Air')).toBeInTheDocument();
    expect(screen.getByAltText('AirPods')).toBeInTheDocument();
  });

  it('should have proper links for products', async () => {
    render(<CategoryShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });

    // Check for links to product pages
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    // Check specific product links
    const learnMoreLinks = screen.getAllByText('了解更多');
    expect(learnMoreLinks.length).toBeGreaterThan(0);
  });

  it('should have promotional sections', async () => {
    render(<CategoryShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });

    // Check for promotional content (these are translated texts)
    expect(screen.getByText('母亲节献礼')).toBeInTheDocument();
    expect(screen.getByText('以旧换新')).toBeInTheDocument();
    expect(screen.getByText('为妈妈挑选完美礼物')).toBeInTheDocument();
    expect(screen.getByText('换购新机最高可享95折优惠')).toBeInTheDocument();
  });

  it('should display proper grid layout', async () => {
    render(<CategoryShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });

    // Check for grid layout classes
    const gridElements = document.querySelectorAll('.grid');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('should be responsive', async () => {
    render(<CategoryShowcase />);

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    });

    // Check for responsive classes
    const responsiveElements = document.querySelectorAll(
      '[class*="md:"], [class*="lg:"], [class*="xl:"]'
    );
    expect(responsiveElements.length).toBeGreaterThan(0);
  });
});

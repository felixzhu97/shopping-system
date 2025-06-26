import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('CategoryShowcase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component without crashing', async () => {
    const Comp = await CategoryShowcase();
    render(Comp);

    // Just check that something is rendered
    expect(document.body).toBeTruthy();
  });

  it('should render featured products when data is available', async () => {
    const Comp = await CategoryShowcase();
    render(Comp);

    // Check for product names
    expect(screen.getByText('iPhone 15')).toBeDefined();
    expect(screen.getByText('MacBook Air')).toBeDefined();
    expect(screen.getByText('AirPods')).toBeDefined();
  });

  it('should render product descriptions', async () => {
    const Comp = await CategoryShowcase();
    render(Comp);

    // Check for product descriptions
    expect(screen.getByText('最新iPhone')).toBeDefined();
    expect(screen.getByText('超薄笔记本')).toBeDefined();
    expect(screen.getByText('无线耳机')).toBeDefined();
  });

  it('should render product images', async () => {
    const Comp = await CategoryShowcase();
    render(Comp);

    // Check for product images
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThanOrEqual(3);

    // Check specific images
    expect(screen.getByAltText('iPhone 15')).toBeDefined();
    expect(screen.getByAltText('MacBook Air')).toBeDefined();
    expect(screen.getByAltText('AirPods')).toBeDefined();
  });

  it('should have proper links for products', async () => {
    const Comp = await CategoryShowcase();
    render(Comp);

    // Check for links to product pages
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);

    // Check specific product links
    const learnMoreLinks = screen.getAllByText('了解更多');
    expect(learnMoreLinks.length).toBeGreaterThan(0);
  });

  it('should have promotional sections', async () => {
    const Comp = await CategoryShowcase();
    render(Comp);

    // Check for promotional content
    expect(screen.getByText('母亲节献礼')).toBeDefined();
    expect(screen.getByText('以旧换新')).toBeDefined();
    expect(screen.getByText('为妈妈挑选完美礼物')).toBeDefined();
    expect(screen.getByText('换购新机最高可享95折优惠')).toBeDefined();
  });

  it('should display proper grid layout', async () => {
    const Comp = await CategoryShowcase();
    render(Comp);

    // Check for grid layout classes
    const gridElements = document.querySelectorAll('.grid');
    expect(gridElements.length).toBeGreaterThan(0);
  });

  it('should be responsive', async () => {
    const Comp = await CategoryShowcase();
    render(Comp);

    // Check for responsive classes
    const responsiveElements = document.querySelectorAll(
      '[class*="md:"], [class*="lg:"], [class*="xl:"]'
    );
    expect(responsiveElements.length).toBeGreaterThan(0);
  });
});

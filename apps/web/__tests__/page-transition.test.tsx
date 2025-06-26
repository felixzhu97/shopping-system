import { render, screen } from '@testing-library/react';
import { PageTransition } from '../components/page-transition';
import { describe, it, expect, vi } from 'vitest';
import { usePathname } from 'next/navigation';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

describe('PageTransition', () => {
  it('should render child component', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');

    render(
      <PageTransition>
        <div>测试内容</div>
      </PageTransition>
    );

    expect(screen.getByText('测试内容')).toBeInTheDocument();
  });

  it('should contain animation container', () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue('/');

    const { container } = render(
      <PageTransition>
        <div>测试内容</div>
      </PageTransition>
    );

    const animationContainer = container.firstChild;
    expect(animationContainer).toBeInTheDocument();
  });

  it('should use correct key attribute', () => {
    const testPath = '/test-path';
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue(testPath);

    const { container } = render(
      <PageTransition>
        <div>测试内容</div>
      </PageTransition>
    );

    const animationContainer = container.firstChild;
    expect(animationContainer).toBeInTheDocument();
  });
});

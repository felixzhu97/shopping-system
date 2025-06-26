import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Skeleton } from '../components/ui/skeleton';

describe('Skeleton Component', () => {
  it('should render skeleton correctly', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('should apply default styling', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('rounded-md');
    expect(skeleton).toHaveClass('bg-gray-200');
  });

  it('should apply custom className', () => {
    render(<Skeleton className="custom-skeleton" data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('custom-skeleton');
  });

  it('should render as div element by default', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.tagName).toBe('DIV');
  });

  it('should combine default and custom classes', () => {
    render(<Skeleton className="h-4 w-full" data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('h-4');
    expect(skeleton).toHaveClass('w-full');
  });

  it('should render multiple skeletons', () => {
    render(
      <div>
        <Skeleton data-testid="skeleton-1" />
        <Skeleton data-testid="skeleton-2" />
        <Skeleton data-testid="skeleton-3" />
      </div>
    );

    expect(screen.getByTestId('skeleton-1')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-2')).toBeInTheDocument();
    expect(screen.getByTestId('skeleton-3')).toBeInTheDocument();
  });

  it('should handle different sizes', () => {
    render(
      <div>
        <Skeleton className="h-4 w-4" data-testid="small" />
        <Skeleton className="h-8 w-8" data-testid="medium" />
        <Skeleton className="h-12 w-12" data-testid="large" />
      </div>
    );

    expect(screen.getByTestId('small')).toHaveClass('h-4', 'w-4');
    expect(screen.getByTestId('medium')).toHaveClass('h-8', 'w-8');
    expect(screen.getByTestId('large')).toHaveClass('h-12', 'w-12');
  });

  it('should render skeleton card layout', () => {
    render(
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" data-testid="title" />
        <Skeleton className="h-20 w-full" data-testid="content" />
        <Skeleton className="h-4 w-1/2" data-testid="footer" />
      </div>
    );

    expect(screen.getByTestId('title')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render without content', () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton.textContent).toBe('');
  });

  it('should be accessible', () => {
    render(<Skeleton aria-label="Loading content" data-testid="skeleton" />);

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-label', 'Loading content');
  });
});

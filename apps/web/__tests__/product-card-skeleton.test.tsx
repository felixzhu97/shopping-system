import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductCardSkeleton } from '../components/product-card-skeleton';

describe('ProductCardSkeleton Component', () => {
  it('should render skeleton elements', () => {
    const { container } = render(<ProductCardSkeleton />);

    // Check for skeleton elements with animate-pulse class
    const skeletonElements = container.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('should have proper skeleton structure', () => {
    const { container } = render(<ProductCardSkeleton />);

    // Check for skeleton container
    const skeletonContainer = container.querySelector('.animate-pulse');
    expect(skeletonContainer).toBeInTheDocument();
  });
});

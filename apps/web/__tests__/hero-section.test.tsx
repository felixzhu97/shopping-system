import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HeroSection from '../components/home/hero-section';

describe('HeroSection Component', () => {
  it('should render hero section content', () => {
    render(<HeroSection />);

    // Check for main heading
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('should display hero background', () => {
    const { container } = render(<HeroSection />);

    // Check for hero background div with background-image style
    const heroBackground = container.querySelector('[style*="background-image"]');
    expect(heroBackground).toBeInTheDocument();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<HeroSection />);

    // Check for hero section container
    const heroContainer = container.firstChild;
    expect(heroContainer).toHaveClass('relative');
  });
});

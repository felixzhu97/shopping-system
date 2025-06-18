import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Separator } from '../components/ui/separator';

describe('Separator Component', () => {
  it('should render separator correctly', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('role', 'separator');
  });

  it('should render horizontal separator by default', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('should render vertical separator', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('should apply custom className', () => {
    render(<Separator className="custom-separator" data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-separator');
  });

  it('should handle decorative separators', () => {
    render(<Separator decorative data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('role', 'none');
  });

  it('should render as div element', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator.tagName).toBe('DIV');
  });

  it('should handle both orientations with decorative', () => {
    const { rerender } = render(
      <Separator orientation="horizontal" decorative data-testid="separator" />
    );

    let separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    expect(separator).toHaveAttribute('role', 'none');

    rerender(<Separator orientation="vertical" decorative data-testid="separator" />);

    separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator).toHaveAttribute('role', 'none');
  });

  it('should render in content context', () => {
    render(
      <div>
        <p>Content above</p>
        <Separator data-testid="separator" />
        <p>Content below</p>
      </div>
    );

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
    expect(screen.getByText('Content above')).toBeInTheDocument();
    expect(screen.getByText('Content below')).toBeInTheDocument();
  });

  it('should render multiple separators', () => {
    render(
      <div>
        <Separator data-testid="separator-1" />
        <Separator orientation="vertical" data-testid="separator-2" />
        <Separator decorative data-testid="separator-3" />
      </div>
    );

    expect(screen.getByTestId('separator-1')).toBeInTheDocument();
    expect(screen.getByTestId('separator-2')).toBeInTheDocument();
    expect(screen.getByTestId('separator-3')).toBeInTheDocument();
  });
});

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Separator } from '../components/ui/separator';

describe('Separator Component', () => {
  it('should render separator', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toBeInTheDocument();
  });

  it('should have default horizontal orientation', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should handle vertical orientation', () => {
    render(<Separator orientation="vertical" data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'vertical');
  });

  it('should apply custom className', () => {
    render(<Separator className="custom-separator" data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveClass('custom-separator');
  });

  it('should have separator role when not decorative', () => {
    render(<Separator decorative={false} />);

    const separator = screen.getByRole('separator');
    expect(separator).toBeInTheDocument();
  });

  it('should be decorative by default', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('data-orientation', 'horizontal');
  });

  it('should handle custom props', () => {
    render(<Separator data-testid="separator" id="custom-separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator).toHaveAttribute('id', 'custom-separator');
  });

  it('should render as div element', () => {
    render(<Separator data-testid="separator" />);

    const separator = screen.getByTestId('separator');
    expect(separator.tagName).toBe('DIV');
  });
});

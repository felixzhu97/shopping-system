import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../components/ui/badge';

describe('Badge Component', () => {
  it('should render badge with text content', () => {
    render(<Badge>Test Badge</Badge>);

    const badge = screen.getByText('Test Badge');
    expect(badge).toBeInTheDocument();
  });

  it('should apply default variant styling', () => {
    render(<Badge data-testid="badge">Default</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-primary');
  });

  it('should apply secondary variant styling', () => {
    render(
      <Badge variant="secondary" data-testid="badge">
        Secondary
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-secondary');
  });

  it('should apply destructive variant styling', () => {
    render(
      <Badge variant="destructive" data-testid="badge">
        Destructive
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-destructive');
  });

  it('should apply outline variant styling', () => {
    render(
      <Badge variant="outline" data-testid="badge">
        Outline
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('border');
  });

  it('should apply custom className', () => {
    render(
      <Badge className="custom-badge" data-testid="badge">
        Custom
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('custom-badge');
  });

  it('should render as div element by default', () => {
    render(<Badge data-testid="badge">Test</Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge.tagName).toBe('DIV');
  });

  it('should handle empty content', () => {
    render(<Badge data-testid="badge"></Badge>);

    const badge = screen.getByTestId('badge');
    expect(badge).toBeInTheDocument();
    expect(badge.textContent).toBe('');
  });

  it('should render with numeric content', () => {
    render(<Badge>42</Badge>);

    const badge = screen.getByText('42');
    expect(badge).toBeInTheDocument();
  });

  it('should render with icon content', () => {
    render(
      <Badge data-testid="badge">
        <span>★</span> Star
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveTextContent('★ Star');
  });

  it('should combine variant and custom className', () => {
    render(
      <Badge variant="destructive" className="custom-class" data-testid="badge">
        Combined
      </Badge>
    );

    const badge = screen.getByTestId('badge');
    expect(badge).toHaveClass('bg-destructive');
    expect(badge).toHaveClass('custom-class');
  });

  it('should render multiple badges', () => {
    render(
      <div>
        <Badge variant="default">Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
      </div>
    );

    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.getByText('Secondary')).toBeInTheDocument();
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });
});

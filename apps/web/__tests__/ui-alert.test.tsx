import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

describe('Alert Components', () => {
  it('should render Alert correctly', () => {
    const { container } = render(
      <Alert>
        <div>Alert content</div>
      </Alert>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render AlertTitle correctly', () => {
    render(<AlertTitle>Alert Title</AlertTitle>);
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
  });

  it('should render AlertDescription correctly', () => {
    render(<AlertDescription>Alert description</AlertDescription>);
    expect(screen.getByText('Alert description')).toBeInTheDocument();
  });

  it('should apply variant styles', () => {
    const { container } = render(
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Something went wrong</AlertDescription>
      </Alert>
    );
    expect(container.firstChild).toHaveClass('border-destructive/50');
  });

  it('should render with default variant', () => {
    const { container } = render(
      <Alert>
        <AlertTitle>Default</AlertTitle>
      </Alert>
    );
    // Alert should have basic styling
    expect(container.firstChild).toHaveClass('relative');
  });
});

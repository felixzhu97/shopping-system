import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loading from '../components/Loading';

describe('Loading Component', () => {
  it('should render loading indicator', () => {
    render(<Loading />);

    const loadingElement = screen.getByText('...');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should have proper loading overlay styling', () => {
    const { container } = render(<Loading />);

    const loadingOverlay = container.firstChild as HTMLElement;
    expect(loadingOverlay).toHaveStyle({
      position: 'fixed',
      zIndex: '9999',
    });
  });
});

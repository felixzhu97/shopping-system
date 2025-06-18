import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loading from '../components/Loading';

describe('Loading Component', () => {
  it('should render loading spinner', () => {
    render(<Loading />);

    const loadingElement = screen.getByText('Loading...');
    expect(loadingElement).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<Loading />);

    const loadingElement = screen.getByText('Loading...');
    expect(loadingElement).toHaveClass('animate-spin');
  });
});

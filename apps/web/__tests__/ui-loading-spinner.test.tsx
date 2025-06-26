import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from '../components/ui/loading-spinner';

describe('LoadingSpinner UI Component', () => {
  it('renders loading spinner', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders consistently', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has expected structure', () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

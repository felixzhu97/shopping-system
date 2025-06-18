import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StoreHeadline from '../components/home/store-headline';

describe('StoreHeadline Component', () => {
  it('should render store headline text', () => {
    render(<StoreHeadline />);

    // Check for paragraph text
    const textElement = screen.getByText('以最好的方式购买您喜爱的产品');
    expect(textElement).toBeInTheDocument();
  });

  it('should have proper text content', () => {
    render(<StoreHeadline />);

    // Check for specific text content (actual Chinese text)
    const textContent = screen.getByText(/购买/);
    expect(textContent).toBeInTheDocument();
  });

  it('should have proper styling', () => {
    const { container } = render(<StoreHeadline />);

    // Check for container styling
    const headlineContainer = container.firstChild;
    expect(headlineContainer).toBeInTheDocument();
    expect(headlineContainer).toHaveClass('py-[80px]');
  });
});

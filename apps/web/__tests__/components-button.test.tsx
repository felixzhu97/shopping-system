import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '../components/Button/Button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders with custom className', () => {
    const { container } = render(<Button className="custom-button">Test</Button>);
    expect(container.firstChild).toHaveClass('custom-button');
  });

  it('renders with different variants', () => {
    render(<Button variant="default">Default</Button>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders disabled button', () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByText('Disabled');
    expect(button).toBeDisabled();
  });
});

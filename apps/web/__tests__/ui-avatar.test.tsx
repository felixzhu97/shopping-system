import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

describe('Avatar Components', () => {
  it('should render Avatar correctly', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test-avatar.jpg" alt="Test" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(container).toMatchSnapshot();
  });

  it('should render AvatarImage', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test-avatar.jpg" alt="Test Avatar" />
      </Avatar>
    );
    // Check if Avatar container is rendered
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render AvatarFallback', () => {
    render(
      <Avatar>
        <AvatarFallback>JD</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('should show fallback when image fails to load', () => {
    render(
      <Avatar>
        <AvatarImage src="/non-existent.jpg" alt="Test" />
        <AvatarFallback>FB</AvatarFallback>
      </Avatar>
    );

    // Both should exist in DOM, but fallback will be shown when image fails
    expect(screen.getByText('FB')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Avatar className="custom-class">
        <AvatarFallback>CC</AvatarFallback>
      </Avatar>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

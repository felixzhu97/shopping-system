import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from '../components/ui/progress';

describe('Progress Component', () => {
  it('should render progress bar', () => {
    render(<Progress value={50} />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<Progress value={50} className="custom-progress" />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveClass('custom-progress');
  });

  it('should handle undefined value', () => {
    render(<Progress />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render with custom props', () => {
    render(<Progress value={30} data-testid="progress-test" />);

    const progressBar = screen.getByTestId('progress-test');
    expect(progressBar).toBeInTheDocument();
  });

  it('should render progress component', () => {
    const { container } = render(<Progress value={75} />);

    expect(container.firstChild).toBeInTheDocument();
  });
});

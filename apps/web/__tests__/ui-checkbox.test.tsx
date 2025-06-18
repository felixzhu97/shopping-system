import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '../components/ui/checkbox';

describe('Checkbox Component', () => {
  it('should render checkbox correctly', () => {
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('type', 'button');
    expect(checkbox).toHaveAttribute('role', 'checkbox');
  });

  it('should handle checked state', () => {
    render(<Checkbox checked data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('should handle unchecked state', () => {
    render(<Checkbox checked={false} data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('should handle click events', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    fireEvent.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('should handle disabled state', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox disabled onCheckedChange={onCheckedChange} data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toBeDisabled();

    fireEvent.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('custom-checkbox');
  });

  it('should handle indeterminate state', () => {
    render(<Checkbox checked="indeterminate" data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveAttribute('aria-checked', 'mixed');
    expect(checkbox).toHaveAttribute('data-state', 'indeterminate');
  });

  it('should handle keyboard events', () => {
    const onCheckedChange = vi.fn();
    render(<Checkbox onCheckedChange={onCheckedChange} data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');
    fireEvent.keyDown(checkbox, { key: 'Enter' });

    expect(onCheckedChange).toHaveBeenCalledTimes(1);
  });

  it('should render with form integration', () => {
    render(
      <form>
        <label htmlFor="terms">
          <Checkbox id="terms" name="terms" />
          Accept terms and conditions
        </label>
      </form>
    );

    const checkbox = screen.getByRole('checkbox');
    const label = screen.getByText('Accept terms and conditions');

    expect(checkbox).toBeInTheDocument();
    expect(label).toBeInTheDocument();
  });

  it('should handle focus and blur events', () => {
    render(<Checkbox data-testid="checkbox" />);

    const checkbox = screen.getByTestId('checkbox');

    checkbox.focus();
    expect(document.activeElement).toBe(checkbox);

    checkbox.blur();
    expect(document.activeElement).not.toBe(checkbox);
  });
});

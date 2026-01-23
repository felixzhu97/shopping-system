import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../components/ui/switch';

describe('Switch Component', () => {
  it('should render switch', () => {
    render(<Switch />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
  });

  it('should handle checked state', () => {
    render(<Switch checked />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeChecked();
  });

  it('should handle unchecked state', () => {
    render(<Switch checked={false} />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).not.toBeChecked();
  });

  it('should handle disabled state', () => {
    render(<Switch disabled />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDisabled();
  });

  it('should call onCheckedChange when clicked', () => {
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('should apply custom className', () => {
    render(<Switch className="custom-switch" />);

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toHaveClass('custom-switch');
  });

  it('should be accessible with aria-label', () => {
    render(<Switch aria-label="Enable notifications" />);

    const switchElement = screen.getByLabelText('Enable notifications');
    expect(switchElement).toBeInTheDocument();
  });

  it('should handle form integration', () => {
    render(
      <form>
        <Switch data-testid="notifications-switch" />
      </form>
    );

    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toHaveAttribute('data-testid', 'notifications-switch');
  });

  it('should not trigger onCheckedChange when disabled', () => {
    const onCheckedChange = vi.fn();
    render(<Switch disabled onCheckedChange={onCheckedChange} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it('should toggle state when clicked', () => {
    const onCheckedChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onCheckedChange} />);

    const switchElement = screen.getByRole('switch');
    fireEvent.click(switchElement);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

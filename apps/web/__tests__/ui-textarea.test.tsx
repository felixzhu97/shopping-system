import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Textarea } from '../components/ui/textarea';

describe('Textarea Component', () => {
  it('should render textarea correctly', () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('should render with placeholder', () => {
    render(<Textarea placeholder="Enter your message" />);

    const textarea = screen.getByPlaceholderText('Enter your message');
    expect(textarea).toBeInTheDocument();
  });

  it('should handle value changes', () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;

    fireEvent.change(textarea, { target: { value: 'Hello World' } });
    expect(textarea.value).toBe('Hello World');
  });

  it('should apply custom className', () => {
    render(<Textarea className="custom-textarea" data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveClass('custom-textarea');
  });

  it('should handle disabled state', () => {
    render(<Textarea disabled data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toBeDisabled();
  });

  it('should handle readonly state', () => {
    render(<Textarea readOnly value="Read only text" data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    expect(textarea).toHaveAttribute('readonly');
    expect(textarea.value).toBe('Read only text');
  });

  it('should handle rows and cols attributes', () => {
    render(<Textarea rows={5} cols={50} data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('rows', '5');
    expect(textarea).toHaveAttribute('cols', '50');
  });

  it('should handle maxLength attribute', () => {
    render(<Textarea maxLength={100} data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');
    expect(textarea).toHaveAttribute('maxlength', '100');
  });

  it('should handle focus and blur events', () => {
    render(<Textarea data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea');

    textarea.focus();
    expect(document.activeElement).toBe(textarea);

    textarea.blur();
    expect(document.activeElement).not.toBe(textarea);
  });

  it('should render with default value', () => {
    render(<Textarea defaultValue="Default text" data-testid="textarea" />);

    const textarea = screen.getByTestId('textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Default text');
  });
});

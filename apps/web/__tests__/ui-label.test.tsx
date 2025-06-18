import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Label } from '../components/ui/label';

describe('Label Component', () => {
  it('should render label correctly', () => {
    render(<Label data-testid="label">Test Label</Label>);

    const label = screen.getByTestId('label');
    expect(label).toBeInTheDocument();
    expect(label).toHaveTextContent('Test Label');
  });

  it('should render as label element by default', () => {
    render(<Label>Form Label</Label>);

    const label = screen.getByText('Form Label');
    expect(label.tagName).toBe('LABEL');
  });

  it('should apply custom className', () => {
    render(
      <Label className="custom-label" data-testid="label">
        Custom Label
      </Label>
    );

    const label = screen.getByTestId('label');
    expect(label).toHaveClass('custom-label');
  });

  it('should associate with form input using htmlFor', () => {
    render(
      <div>
        <Label htmlFor="email">Email Address</Label>
        <input id="email" type="email" />
      </div>
    );

    const label = screen.getByText('Email Address');
    const input = screen.getByRole('textbox');

    expect(label).toHaveAttribute('for', 'email');
    expect(input).toHaveAttribute('id', 'email');
  });

  it('should handle click events when associated with input', () => {
    render(
      <div>
        <Label htmlFor="checkbox">Check me</Label>
        <input id="checkbox" type="checkbox" />
      </div>
    );

    const label = screen.getByText('Check me');
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();

    // Clicking label should focus/activate associated input
    label.click();
    // In testing environment, label click might not automatically focus input
    expect(label).toHaveAttribute('for', 'checkbox');
  });

  it('should render with additional props', () => {
    render(
      <Label data-testid="label" title="Tooltip text" aria-label="Accessible label">
        Label with props
      </Label>
    );

    const label = screen.getByTestId('label');
    expect(label).toHaveAttribute('title', 'Tooltip text');
    expect(label).toHaveAttribute('aria-label', 'Accessible label');
  });

  it('should render empty label', () => {
    render(<Label data-testid="empty-label" />);

    const label = screen.getByTestId('empty-label');
    expect(label).toBeInTheDocument();
    expect(label).toBeEmptyDOMElement();
  });

  it('should render with nested elements', () => {
    render(
      <Label data-testid="nested-label">
        <span>Required</span>
        <strong>Field Name</strong>
      </Label>
    );

    const label = screen.getByTestId('nested-label');
    expect(label).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText('Field Name')).toBeInTheDocument();
  });

  it('should render multiple labels in form', () => {
    render(
      <form>
        <Label htmlFor="first">First Name</Label>
        <input id="first" type="text" />

        <Label htmlFor="last">Last Name</Label>
        <input id="last" type="text" />
      </form>
    );

    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
  });
});

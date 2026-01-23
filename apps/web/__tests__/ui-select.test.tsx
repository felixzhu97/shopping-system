import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

describe('Select Component', () => {
  it('should render select trigger', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
      </Select>
    );

    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should display placeholder text', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Choose option" />
        </SelectTrigger>
      </Select>
    );

    expect(screen.getByText('Choose option')).toBeInTheDocument();
  });

  it('should render with custom className', () => {
    render(
      <Select>
        <SelectTrigger className="custom-class">
          <SelectValue />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toHaveClass('custom-class');
  });

  it('should render select content with items', () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
  });

  it('should handle disabled state', () => {
    render(
      <Select disabled>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('should render select item with value', () => {
    render(
      <Select defaultOpen>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="test-value">Test Item</SelectItem>
        </SelectContent>
      </Select>
    );

    const item = screen.getByText('Test Item');
    expect(item).toBeInTheDocument();
  });

  it('should handle required prop', () => {
    render(
      <Select required>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
      </Select>
    );

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeRequired();
  });

  it('should render with default value', () => {
    render(
      <Select defaultValue="default">
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="default">Default Option</SelectItem>
          <SelectItem value="other">Other Option</SelectItem>
        </SelectContent>
      </Select>
    );

    const defaultOptions = screen.getAllByText('Default Option');
    expect(defaultOptions.length).toBeGreaterThan(0);
    expect(defaultOptions[0]).toBeInTheDocument();
  });
});

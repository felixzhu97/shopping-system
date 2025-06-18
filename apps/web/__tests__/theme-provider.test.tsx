import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '../components/theme-provider';
import { describe, it, expect, vi } from 'vitest';
import { type ThemeProviderProps } from 'next-themes';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('ThemeProvider', () => {
  it('should render child component', () => {
    render(
      <ThemeProvider>
        <div>测试内容</div>
      </ThemeProvider>
    );

    expect(screen.getByText('测试内容')).toBeInTheDocument();
  });

  it('should pass props correctly', () => {
    const testProps: ThemeProviderProps = {
      attribute: 'class',
      defaultTheme: 'system',
      enableSystem: true,
    };

    const { container } = render(
      <ThemeProvider {...testProps}>
        <div>测试内容</div>
      </ThemeProvider>
    );

    // check if ThemeProvider is rendered correctly
    expect(container.firstChild).toBeInTheDocument();
  });
});

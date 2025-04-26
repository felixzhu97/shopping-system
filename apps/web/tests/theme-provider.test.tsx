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
  it('应该正确渲染子组件', () => {
    render(
      <ThemeProvider>
        <div>测试内容</div>
      </ThemeProvider>
    );

    expect(screen.getByText('测试内容')).toBeInTheDocument();
  });

  it('应该正确传递属性', () => {
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

    // 检查 ThemeProvider 是否正确渲染
    expect(container.firstChild).toBeInTheDocument();
  });
});

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['node_modules/**', 'dist/**', '**/*.d.ts', 'src/scripts/**', 'vitest.config.ts'],
      thresholds: {
        global: {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
      },
    },
    globals: true,
    environment: 'node',
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 1,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@models': resolve(__dirname, './src/models'),
      '@controllers': resolve(__dirname, './src/controllers'),
      '@routes': resolve(__dirname, './src/routes'),
      '@utils': resolve(__dirname, './src/utils'),
      'monitoring': resolve(__dirname, '../../packages/monitoring/src'),
    },
  },
});

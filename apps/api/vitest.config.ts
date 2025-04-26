import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    include: ['**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
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
    },
  },
});

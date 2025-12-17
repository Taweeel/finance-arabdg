import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setupTests.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@auth/create': path.resolve(__dirname, './test/mocks/auth-create.ts'),
      'react-router-hono-server': path.resolve(__dirname, './test/mocks/react-router-hono-server.ts'),
      'react-router-hono-server/node': path.resolve(__dirname, './test/mocks/react-router-hono-server.ts'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  cacheDir: './.vitest',
});

import {defineConfig} from 'vitest/config';

export default defineConfig({
  root: __dirname,
  cacheDir: './node_modules/.vitest',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    clearMocks: true,
  },
});

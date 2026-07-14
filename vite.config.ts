import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
      resolve: {
        alias: {
          '@': path.resolve(import.meta.dirname, '.'),
        }
      },
      server: {
        proxy: {
          '/backend': {
            target: 'http://127.0.0.1:3002',
            changeOrigin: true,
            rewrite: (requestPath) => requestPath.replace(/^\/backend/, '/api'),
          },
        },
      }
    };
});

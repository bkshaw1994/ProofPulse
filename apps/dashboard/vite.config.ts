import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@proofpulse/config': path.resolve(__dirname, '../../packages/config/src/index.ts'),
      '@proofpulse/shared-types': path.resolve(__dirname, '../../packages/shared-types/src/index.ts'),
      '@proofpulse/validation': path.resolve(__dirname, '../../packages/validation/src/index.ts')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: [
        '**/*.js',
        '**/*.jsx',
      ],
      jsxRuntime: 'automatic',
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /src|components|pages|context|services|data|backend|App\.js|index\.js/,
    exclude: [],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
}); 
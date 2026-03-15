import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@ui': path.resolve(__dirname, './src/ui'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@services': path.resolve(__dirname, './src/services'),
      '@datasets': path.resolve(__dirname, './src/datasets'),
      '@api': path.resolve(__dirname, './src/api'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 3001,
    open: true,
    proxy: {
      // Proxy /api/status → RSI cState (résout le CORS en dev, comme la Vercel function en prod)
      '/api/status': {
        target: 'https://status.robertsspaceindustries.com',
        changeOrigin: true,
        rewrite: () => '/index.json',
      },
      // Proxy /api/sc-trade → SC Trade Tools (endpoints gratuits, pas de CORS)
      '/api/sc-trade': {
        target: 'https://sc-trade.tools',
        changeOrigin: true,
        rewrite: (path) => {
          // /api/sc-trade?path=crowdsource/commodity-listings&page=0
          // → /api/crowdsource/commodity-listings?page=0
          const url = new URL(path, 'http://localhost');
          const endpoint = url.searchParams.get('path') ?? '';
          const page = url.searchParams.get('page');
          let upstream = `/api/${endpoint}`;
          if (page !== undefined && page !== null) upstream += `?page=${page}`;
          return upstream;
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,   // désactivé en prod pour réduire la taille du bundle
    chunkSizeWarningLimit: 600,  // raise la limite pour éviter le warning recharts/lucide
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Librairies vendor
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'vendor';
          if (id.includes('node_modules/recharts')) return 'charts';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/fuse.js')) return 'search';
          // Dataset lourd séparé pour réduire le bundle principal
          if (id.includes('datasets/equipment')) return 'dataset-equipment';
        },
      },
    },
  },
});

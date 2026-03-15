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

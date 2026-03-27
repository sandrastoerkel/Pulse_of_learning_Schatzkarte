import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Code Splitting: Vendor-Libs in eigene Chunks
        manualChunks: {
          // React-Kern (ändert sich selten → gut cachebar)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase + React Query (Daten-Layer)
          'vendor-data': ['@supabase/supabase-js', '@tanstack/react-query'],
          // Framer Motion (Animationen, relativ groß)
          'vendor-motion': ['framer-motion'],
        },
      },
    },
    // Warnung ab 500 kB
    chunkSizeWarningLimit: 500,
  },
  server: {
    port: 3000,
    open: true,
  },
});

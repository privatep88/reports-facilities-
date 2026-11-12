import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function reactEntryBridgePlugin(): Plugin {
  return {
    name: 'react-entry-bridge',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        if (html.includes('/src/main.tsx')) {
          return html;
        }
        return html
          .replace(/<link rel="stylesheet"[^>]*href="[^"]*assets\/[^"]*\.css"[^>]*>\s*/g, '')
          .replace(/<link rel="modulepreload"[^>]*href="[^"]*assets\/[^"]*\.js"[^>]*>\s*/g, '')
          .replace(
            /<script type="module"[^>]*src="[^"]*assets\/[^"]*\.js"[^>]*><\/script>/,
            '<script type="module" src="/src/main.tsx"></script>',
          );
      },
    },
  };
}

export default defineConfig(({ command }) => {
  return {
    base: process.env.VITE_BASE_PATH || (command === 'build' ? '/reports-facilities-/' : '/'),
    plugins: [reactEntryBridgePlugin(), react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/index.js',
          chunkFileNames: 'assets/[name].js',
          assetFileNames: 'assets/[name][extname]',
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('exceljs')) return 'vendor-excel';
              if (id.includes('html2pdf')) return 'vendor-pdf';
              if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
              if (id.includes('lucide-react')) return 'vendor-icons';
              return 'vendor-core';
            }
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

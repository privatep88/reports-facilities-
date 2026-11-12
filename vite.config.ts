import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';

function reactEntryBridgePlugin(): Plugin {
  return {
    name: 'react-entry-bridge',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        const normalizedFaviconHtml = html
          .replace(/href="[^"]*favicon\.svg"/g, 'href="/favicon.svg"')
          .replace(/href="[^"]*favicon\.ico"/g, 'href="/favicon.ico"');

        if (normalizedFaviconHtml.includes('/src/main.tsx')) {
          return normalizedFaviconHtml;
        }
        return normalizedFaviconHtml
          .replace(/<link rel="stylesheet"[^>]*href="[^"]*assets\/[^"]*\.css"[^>]*>\s*/g, '')
          .replace(/<link rel="modulepreload"[^>]*href="[^"]*assets\/[^"]*\.js"[^>]*>\s*/g, '')
          .replace(
            /<script type="module"[^>]*src="[^"]*assets\/[^"]*\.js"[^>]*><\/script>/,
            '<script type="module" src="/src/main.tsx"></script>',
          );
      },
    },
    closeBundle() {
      try {
        const distDir = path.resolve(__dirname, 'dist');
        const distIndex = path.join(distDir, 'index.html');
        if (!fs.existsSync(distIndex)) return;

        const distAssets = path.join(distDir, 'assets');
        if (fs.existsSync(distAssets)) {
          fs.writeFileSync(path.join(distAssets, 'index-B2qv8KGN.js'), 'import "./index.js";\n');
          fs.writeFileSync(path.join(distAssets, 'index-DNysLAl3.js'), 'import "./index.js";\n');
          fs.writeFileSync(path.join(distAssets, 'index-aTwR7x5y.css'), '@import "./index.css";\n');
          fs.writeFileSync(path.join(distAssets, 'index-D9Zh6moI.css'), '@import "./index.css";\n');

          const rootAssets = path.resolve(__dirname, 'assets');
          fs.mkdirSync(rootAssets, {recursive: true});
          for (const file of fs.readdirSync(distAssets)) {
            fs.copyFileSync(path.join(distAssets, file), path.join(rootAssets, file));
          }
        }

        fs.copyFileSync(distIndex, path.join(distDir, '404.html'));
        fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
        fs.copyFileSync(distIndex, path.resolve(__dirname, 'index.html'));
        fs.copyFileSync(distIndex, path.resolve(__dirname, '404.html'));
        fs.writeFileSync(path.resolve(__dirname, '.nojekyll'), '');
      } catch (err) {
        console.error('closeBundle sync error:', err);
      }
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

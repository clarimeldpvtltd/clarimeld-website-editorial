import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  const cspContent =
    command === 'serve'
      ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self' ws://127.0.0.1:* http://127.0.0.1:*; object-src 'none'; base-uri 'self'; form-action 'none'"
      : "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";

  return {
    server: {
      host: '127.0.0.1',
      port: 5173,
      strictPort: false,
      watch: {
        ignored: ['**/.tmp-*', '**/docs/**'],
      },
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: false,
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 550,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          pmOs: resolve(__dirname, 'pm-os.html'),
          writerOs: resolve(__dirname, 'writer-os.html'),
          publicOs: resolve(__dirname, 'public-os.html'),
          suite: resolve(__dirname, 'suite.html'),
        },
      },
    },
    plugins: [
      {
        name: 'clarimeld-local-csp',
        transformIndexHtml(html) {
          return html.replace('__CSP_CONTENT__', cspContent);
        },
      },
    ],
  };
});

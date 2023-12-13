import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    // https://forum.babylonjs.com/t/unable-to-load-havok-plugin-error-while-loading-wasm-file-from-browser/40289/28?page=2
    exclude: ['@babylonjs/havok'],
  },
});

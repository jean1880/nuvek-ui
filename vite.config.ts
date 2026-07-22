import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Library build: emit an ESM + UMD bundle plus a single stylesheet (nuvek-ui.css).
// `vue` is externalized so consumers dedupe on their own copy.
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: 'NuvekUI',
      fileName: 'nuvek-ui',
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' },
        assetFileNames: 'nuvek-ui.[ext]',
      },
    },
  },
})

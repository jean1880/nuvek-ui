import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

// Copy the raw token/base stylesheets into dist so consumers can import them directly
// (`@nuvek/ui/tokens.css`) — the package only ships `dist/`, so the raw CSS must land there too.
function copyRawCss(): Plugin {
  const resolve = (rel: string) => fileURLToPath(new URL(rel, import.meta.url))
  return {
    name: 'nuvek-copy-raw-css',
    closeBundle() {
      copyFileSync(resolve('./src/tokens.css'), resolve('./dist/tokens.css'))
      copyFileSync(resolve('./src/base.css'), resolve('./dist/base.css'))
    },
  }
}

// Library build: emit an ESM + UMD bundle plus a single stylesheet (nuvek-ui.css).
// `vue` is externalized so consumers dedupe on their own copy.
export default defineConfig({
  plugins: [vue(), copyRawCss()],
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

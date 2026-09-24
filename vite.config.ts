import { copyFileSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import pkg from './package.json' with { type: 'json' }

const resolve = (rel: string) => fileURLToPath(new URL(rel, import.meta.url))

// Ship theme.css as-is: it is Tailwind SOURCE (@theme/@source), compiled by the consumer's
// Tailwind build — never by this one. Its `@source "./"` is relative to dist/, where the
// component bundle whose class strings the consumer must scan also lives.
function copyTheme(): Plugin {
  return {
    name: 'nuvek-copy-theme',
    closeBundle() {
      copyFileSync(resolve('./src/theme.css'), resolve('./dist/theme.css'))
    },
  }
}

// Every runtime/peer dependency stays external (including deep imports like
// `reka-ui/…`), so consumers dedupe on their own copies.
const external = [
  ...Object.keys(pkg.peerDependencies ?? {}),
  ...Object.keys(pkg.dependencies ?? {}),
].map((name) => new RegExp(`^${name}(/.*)?$`))

// Library build: ESM only (every consumer is a Vite app) and NO stylesheet output.
export default defineConfig({
  plugins: [vue(), copyTheme()],
  build: {
    lib: {
      entry: resolve('./src/index.ts'),
      formats: ['es'],
      fileName: 'nuvek-ui',
    },
    rollupOptions: { external },
  },
})

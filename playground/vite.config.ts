// Dev-only showcase of every component × variant — the visual baseline for reviews.
// Not shipped (package `files` is dist/ only). Run: `npm run playground`.
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [vue(), tailwindcss()],
})

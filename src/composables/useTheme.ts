import { ref } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'nuvek-theme'
// The token set is dark-first (a single :root). `light` is reserved for a future
// palette; until light tokens land, switching only stamps `data-theme` for
// forward-compatible styling hooks.
const theme = ref<Theme>('dark')

/** Shared theme state — reads/sets the `data-theme` attribute on <html> and persists it. */
export function useTheme() {
  function setTheme(next: Theme) {
    theme.value = next
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage unavailable (private mode) — non-fatal */
    }
  }

  function toggleTheme() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark')
  }

  /** Call once at app startup to restore a persisted choice (defaults to dark). */
  function initTheme() {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setTheme(stored === 'light' ? 'light' : 'dark')
  }

  return { theme, setTheme, toggleTheme, initTheme }
}

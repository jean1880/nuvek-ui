import { ref } from 'vue'

/**
 * A theme name. Only `dark` ships today; add a theme purely by defining a
 * `:root[data-theme="<name>"]` token-override block in `theme.css` — no change here.
 * The `(string & {})` keeps `dark` autocompleting while allowing any custom name.
 */
export type Theme = 'dark' | (string & {})

const STORAGE_KEY = 'nuvek-theme'
const DEFAULT_THEME = 'dark'

// Shared reactive theme name, stamped onto <html data-theme>.
const theme = ref<Theme>(DEFAULT_THEME)

/**
 * Theme support: stamp and persist a `data-theme` name on `<html>`. The token-override
 * blocks in `theme.css` do the actual reskinning — this composable only tracks/sets the name.
 */
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

  /** Call once at startup to restore a persisted theme (defaults to `dark`). */
  function initTheme() {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setTheme(stored || DEFAULT_THEME)
  }

  return { theme, setTheme, initTheme }
}

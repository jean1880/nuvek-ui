import { ref } from 'vue'

/**
 * A theme name. Only `dark` ships; add a theme by registering a theme config
 * (`registerThemes`) or by defining a `:root[data-theme="<name>"]` token-override block.
 * The `(string & {})` keeps `dark` autocompleting while allowing any custom name.
 */
export type Theme = 'dark' | (string & {})

/** What `initTheme` falls back to with nothing stored: one theme, or one per OS colour scheme. */
export type ThemeFallback = Theme | { light: Theme; dark: Theme }

const STORAGE_KEY = 'nuvek-theme'
const DEFAULT_THEME = 'dark'

// Shared reactive theme name, stamped onto <html data-theme>.
const theme = ref<Theme>(DEFAULT_THEME)

function resolveFallback(fallback: ThemeFallback): Theme {
  if (typeof fallback === 'string') return fallback
  const prefersLight =
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: light)').matches
  return prefersLight ? fallback.light : fallback.dark
}

/**
 * Theme support: stamp and persist a `data-theme` name on `<html>`. The token-override
 * blocks do the actual reskinning — this composable only tracks/sets the name.
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

  /**
   * Call once at startup to restore a persisted theme. With nothing stored it uses `fallback`
   * (default `dark`); a `{ light, dark }` fallback follows the OS `prefers-color-scheme`.
   * The fallback is applied without persisting, so each load re-reads the OS preference until the
   * user picks a theme with `setTheme`. (A mid-session OS change is not tracked.)
   */
  function initTheme(fallback: ThemeFallback = DEFAULT_THEME) {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    if (stored) {
      setTheme(stored)
      return
    }
    const next = resolveFallback(fallback)
    theme.value = next
    document.documentElement.setAttribute('data-theme', next)
  }

  return { theme, setTheme, initTheme }
}

// Theme config files: a theme is data (a name, a colour scheme and token overrides), so an app
// can keep its palettes in JSON or TS files instead of hand-writing override CSS. The config is
// validated, turned into a `:root[data-theme="<name>"]` override block, and either injected at
// runtime (`registerThemes`) or emitted at build time (`themeToCss`).

/** Every colour token in theme.css that a theme may override (`--color-<token>`). */
export const COLOR_TOKENS = [
  'bg',
  'bg-alt',
  'bg-modal',
  'bg-code',
  'overlay',
  'glass',
  'surface',
  'surface-hover',
  'surface-active',
  'fg',
  'fg-muted',
  'fg-dim',
  'on-primary',
  'border',
  'border-strong',
  'primary',
  'primary-hover',
  'primary-alt',
  'success',
  'error',
  'warning',
  'idle',
  'status-success',
  'status-error',
  'status-warning',
] as const

export type ColorToken = (typeof COLOR_TOKENS)[number]

export type ColorScheme = 'dark' | 'light'

export interface ThemeConfig {
  /** The `data-theme` value: lowercase letters, digits and hyphens, starting with a letter. */
  name: string
  /** Drives native controls and scrollbars. Defaults to `dark`, like the shipped theme. */
  colorScheme?: ColorScheme
  /** Overrides for any subset of the colour tokens; tokens left out keep the dark values. */
  colors: Partial<Record<ColorToken, string>>
}

/** Thrown when a theme config is malformed. `problems` lists every issue found, not just the first. */
export class ThemeConfigError extends Error {
  constructor(
    readonly source: string,
    readonly problems: string[],
  ) {
    super(`invalid theme config (${source}): ${problems.join('; ')}`)
    this.name = 'ThemeConfigError'
  }
}

const NAME = /^[a-z][a-z0-9-]*$/
const KNOWN = new Set<string>(COLOR_TOKENS)

// A colour value is written into a stylesheet, so it must not be able to leave its declaration.
// The character set excludes `;`, `{`, `}`, quotes, `:`, `*`, `\` and `<`; on top of that every
// `(` must open an allowlisted colour function and the parentheses must balance, since an
// unclosed function block in CSS swallows everything after it.
const COLOR_CHARS = /^[#a-zA-Z0-9\s().,%/+-]+$/
const COLOR_FUNCTIONS = new Set([
  'rgb',
  'rgba',
  'hsl',
  'hsla',
  'hwb',
  'lab',
  'lch',
  'oklab',
  'oklch',
  'color',
  'color-mix',
  'light-dark',
  'var',
])

/** True when `value` is a hex colour, a keyword, or allowlisted functional notation. */
function isSafeColor(value: string): boolean {
  if (!COLOR_CHARS.test(value)) return false
  let depth = 0
  for (const ch of value) {
    if (ch === '(') depth++
    else if (ch === ')' && --depth < 0) return false
  }
  if (depth !== 0) return false
  // Each `(` must directly follow an allowlisted function name (so no `url(`, `image-set(`, bare `(`).
  const opens = value.split('(').length - 1
  const fns = [...value.matchAll(/([a-zA-Z][a-zA-Z-]*)\(/g)]
  return fns.length === opens && fns.every((m) => COLOR_FUNCTIONS.has(m[1].toLowerCase()))
}

/**
 * Validate untrusted config data (a parsed JSON file) and return it as a `ThemeConfig`.
 * Unknown tokens are errors, so a typo like `primay` fails loudly instead of doing nothing.
 */
export function parseTheme(data: unknown, source = 'theme'): ThemeConfig {
  const problems: string[] = []
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new ThemeConfigError(source, ['expected an object'])
  }
  const raw = data as Record<string, unknown>

  for (const key of Object.keys(raw)) {
    if (!['name', 'colorScheme', 'colors'].includes(key)) problems.push(`unknown key "${key}"`)
  }

  const name = raw.name
  if (typeof name !== 'string' || !NAME.test(name)) {
    problems.push('name must match /^[a-z][a-z0-9-]*$/')
  }

  const scheme = raw.colorScheme
  if (scheme !== undefined && scheme !== 'dark' && scheme !== 'light') {
    problems.push('colorScheme must be "dark" or "light"')
  }

  const colors: Partial<Record<ColorToken, string>> = {}
  const rawColors = raw.colors
  if (typeof rawColors !== 'object' || rawColors === null || Array.isArray(rawColors)) {
    problems.push('colors must be an object of token → colour')
  } else {
    for (const [token, value] of Object.entries(rawColors)) {
      if (!KNOWN.has(token)) {
        problems.push(`unknown colour token "${token}"`)
      } else if (typeof value !== 'string' || !isSafeColor(value.trim())) {
        problems.push(`colour "${token}" is not a plain CSS colour value`)
      } else {
        colors[token as ColorToken] = value.trim()
      }
    }
  }

  if (problems.length) throw new ThemeConfigError(source, problems)
  return {
    name: name as string,
    ...(scheme ? { colorScheme: scheme as ColorScheme } : {}),
    colors,
  }
}

/** Type-checked authoring helper for TS theme files; validates like `parseTheme`. */
export function defineTheme(config: ThemeConfig): ThemeConfig {
  return parseTheme(config, config?.name ?? 'theme')
}

/** The override block for one theme, e.g. for writing a static CSS file at build time. */
export function themeToCss(config: ThemeConfig): string {
  const theme = parseTheme(config, config?.name ?? 'theme')
  const lines = [`  color-scheme: ${theme.colorScheme ?? 'dark'};`]
  for (const token of COLOR_TOKENS) {
    const value = theme.colors[token]
    if (value !== undefined) lines.push(`  --color-${token}: ${value};`)
  }
  return `:root[data-theme="${theme.name}"] {\n${lines.join('\n')}\n}\n`
}

const STYLE_ID = 'nuvek-themes'

export interface RegisterThemesOptions {
  /** CSP nonce for the injected `<style>`, when the app's policy requires one. */
  nonce?: string
}

/**
 * Inject the override blocks for `themes` into `<head>`, replacing any earlier registration.
 * Call before `initTheme()`. Returns a function that removes the injected style.
 * Under a strict CSP without a nonce, write `themeToCss` output to a stylesheet at build time instead.
 */
export function registerThemes(themes: ThemeConfig[], options: RegisterThemesOptions = {}): () => void {
  const parsed = themes.map((t, i) => parseTheme(t, `themes[${i}]`))
  const seen = new Set<string>()
  for (const t of parsed) {
    if (seen.has(t.name)) throw new ThemeConfigError(t.name, [`theme "${t.name}" is registered twice`])
    seen.add(t.name)
  }
  const css = parsed.map(themeToCss).join('\n')

  document.getElementById(STYLE_ID)?.remove()
  const style = document.createElement('style')
  style.id = STYLE_ID
  if (options.nonce) style.nonce = options.nonce
  style.textContent = css
  document.head.appendChild(style)
  return () => style.remove()
}

function luminance(hex: string): number {
  const full = hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex
  const [r, g, b] = [1, 3, 5].map((i) => {
    const s = parseInt(full.slice(i, i + 2), 16) / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x contrast ratio between two `#rgb`/`#rrggbb` colours; throws on any other format. */
export function contrastRatio(a: string, b: string): number {
  for (const c of [a, b]) {
    if (!HEX.test(c)) throw new TypeError(`contrastRatio needs #rgb or #rrggbb, got "${c}"`)
  }
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const SURFACES: ColorToken[] = ['bg', 'bg-alt', 'bg-modal', 'surface', 'surface-hover', 'surface-active']
const RULES: Array<[ColorToken, number]> = [
  ['fg', 7],
  ['fg-muted', 4.5],
  ['fg-dim', 4.5],
  ['border-strong', 3],
]
const HEX = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

/**
 * Check a theme against the contrast floors the shipped dark theme is held to (fg 7:1, fg-muted and
 * fg-dim 4.5:1, border-strong 3:1 on every background and surface). Only pairs where both tokens are
 * `#rgb`/`#rrggbb` in the config are checked; returns one message per failing pair (empty = pass).
 */
export function themeContrastIssues(config: ThemeConfig): string[] {
  const issues: string[] = []
  const hex = (t: ColorToken) => {
    const v = config.colors[t]
    return v !== undefined && HEX.test(v) ? v : undefined
  }
  for (const [fg, floor] of RULES) {
    const a = hex(fg)
    if (!a) continue
    for (const surface of SURFACES) {
      const b = hex(surface)
      if (!b) continue
      const r = contrastRatio(a, b)
      if (r < floor) issues.push(`${fg} on ${surface} is ${r.toFixed(2)}:1, needs ${floor}:1`)
    }
  }
  return issues
}

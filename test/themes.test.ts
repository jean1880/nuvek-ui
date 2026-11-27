import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  COLOR_TOKENS,
  ThemeConfigError,
  contrastRatio,
  defineTheme,
  parseTheme,
  registerThemes,
  themeContrastIssues,
  themeToCss,
  useTheme,
} from '../src'

// happy-dom rewrites import.meta.url, so resolve from vitest's root (the package directory).
const themeCss = readFileSync(join(process.cwd(), 'src/theme.css'), 'utf8')

const paper = {
  name: 'paper',
  colorScheme: 'light' as const,
  colors: { bg: '#fbf7ee', fg: '#1a1712', primary: 'oklch(0.62 0.12 85)' },
}

describe('COLOR_TOKENS', () => {
  it('lists exactly the overridable colour tokens defined in theme.css', () => {
    // A Set: the override example in theme.css's closing comment repeats some names.
    const defined = new Set([...themeCss.matchAll(/--color-([\w-]+):/g)].map((m) => m[1]))
    defined.delete('white')
    defined.delete('black')
    expect([...COLOR_TOKENS].sort()).toEqual([...defined].sort())
  })
})

describe('parseTheme', () => {
  it('accepts a valid config and trims values', () => {
    expect(parseTheme({ ...paper, colors: { bg: '  #fff ' } })).toEqual({
      name: 'paper',
      colorScheme: 'light',
      colors: { bg: '#fff' },
    })
  })

  it('reports every problem at once', () => {
    try {
      parseTheme({ name: 'Bad Name', colorScheme: 'sepia', colors: { primay: '#fff' }, extra: 1 }, 'bad.json')
      expect.unreachable()
    } catch (e) {
      expect(e).toBeInstanceOf(ThemeConfigError)
      const err = e as ThemeConfigError
      expect(err.source).toBe('bad.json')
      expect(err.problems).toHaveLength(4)
    }
  })

  it.each([
    'red; } body { display: none',
    '#fff}',
    'url(https://example.com/x.png)',
    'url(//example.com/x.png)',
    'image-set(#fff 1x)',
    'rgb(1 2 3',
    ')',
    'rgb(1 2 3))',
    '(#fff)',
    '"red"',
    'red /* x */',
    '<style>',
  ])('rejects %j as a colour value', (value) => {
    expect(() => parseTheme({ name: 'x', colors: { bg: value } })).toThrow(ThemeConfigError)
  })

  it.each([
    '#0f172a',
    '#0f172acc',
    'rebeccapurple',
    'rgb(2 6 23 / 0.85)',
    'OKLCH(0.6 0.1 85)',
    'color-mix(in oklab, var(--color-bg) 80%, white)',
  ])(
    'accepts %j as a colour value',
    (value) => {
      expect(parseTheme({ name: 'x', colors: { bg: value } }).colors.bg).toBe(value)
    },
  )

  it('rejects non-objects', () => {
    expect(() => parseTheme(null)).toThrow(ThemeConfigError)
    expect(() => parseTheme([])).toThrow(ThemeConfigError)
  })
})

describe('themeToCss', () => {
  it('emits a data-theme override block with the colour scheme, in token order', () => {
    expect(themeToCss(paper)).toBe(
      ':root[data-theme="paper"] {\n' +
        '  color-scheme: light;\n' +
        '  --color-bg: #fbf7ee;\n' +
        '  --color-fg: #1a1712;\n' +
        '  --color-primary: oklch(0.62 0.12 85);\n' +
        '}\n',
    )
  })

  it('defaults the colour scheme to dark', () => {
    expect(themeToCss(defineTheme({ name: 'night', colors: {} }))).toContain('color-scheme: dark;')
  })
})

describe('registerThemes', () => {
  afterEach(() => document.getElementById('nuvek-themes')?.remove())

  it('injects one style element and replaces it on re-registration', () => {
    registerThemes([paper])
    registerThemes([paper, { name: 'night', colors: { bg: '#000' } }], { nonce: 'abc' })
    const styles = document.querySelectorAll('style#nuvek-themes')
    expect(styles).toHaveLength(1)
    const style = styles[0] as HTMLStyleElement
    expect(style.nonce).toBe('abc')
    expect(style.textContent).toContain('[data-theme="paper"]')
    expect(style.textContent).toContain('[data-theme="night"]')
  })

  it('returns a remover', () => {
    const remove = registerThemes([paper])
    remove()
    expect(document.getElementById('nuvek-themes')).toBeNull()
  })

  it('refuses duplicate names', () => {
    expect(() => registerThemes([paper, paper])).toThrow(ThemeConfigError)
  })

  it('validates entries before reading them', () => {
    expect(() => registerThemes([null as never])).toThrow(ThemeConfigError)
  })
})

describe('contrast', () => {
  it('computes WCAG ratios, including #rgb shorthand', () => {
    expect(contrastRatio('#000', '#ffffff')).toBeCloseTo(21, 5)
    expect(contrastRatio('#777777', '#777')).toBeCloseTo(1, 5)
  })

  it('refuses non-hex input instead of returning NaN', () => {
    expect(() => contrastRatio('red', '#fff')).toThrow(TypeError)
  })

  it('flags pairs below the shipped floors and skips non-hex values', () => {
    const issues = themeContrastIssues({
      name: 'weak',
      colors: { bg: '#ffffff', surface: 'oklch(1 0 0)', fg: '#777777', 'border-strong': '#eeeeee' },
    })
    expect(issues).toEqual([
      expect.stringMatching(/^fg on bg is 4\.48:1, needs 7:1$/),
      expect.stringMatching(/^border-strong on bg is 1\.16:1, needs 3:1$/),
    ])
  })

  it('passes a readable light palette', () => {
    expect(themeContrastIssues(paper)).toEqual([])
  })

  it('keeps the playground sample theme valid and readable', () => {
    const sample = JSON.parse(readFileSync(join(process.cwd(), 'playground/themes/sample-light.json'), 'utf8'))
    expect(themeContrastIssues(parseTheme(sample, 'sample-light.json'))).toEqual([])
  })
})

describe('useTheme initTheme fallback', () => {
  const realMatchMedia = window.matchMedia
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    window.matchMedia = realMatchMedia
    document.documentElement.removeAttribute('data-theme')
  })

  function preferLight(light: boolean) {
    window.matchMedia = ((q: string) => ({ matches: light && q.includes('light') }) as MediaQueryList) as typeof window.matchMedia
  }

  it('defaults to dark without persisting it', () => {
    useTheme().initTheme()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.getItem('nuvek-theme')).toBeNull()
  })

  it('follows the OS scheme with a { light, dark } fallback', () => {
    preferLight(true)
    useTheme().initTheme({ light: 'paper', dark: 'night' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('paper')
    preferLight(false)
    useTheme().initTheme({ light: 'paper', dark: 'night' })
    expect(document.documentElement.getAttribute('data-theme')).toBe('night')
  })

  it('prefers a stored choice over the fallback', () => {
    useTheme().setTheme('night')
    preferLight(true)
    const { theme, initTheme } = useTheme()
    initTheme({ light: 'paper', dark: 'night' })
    expect(theme.value).toBe('night')
  })
})

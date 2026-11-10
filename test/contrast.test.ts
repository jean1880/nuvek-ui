// @vitest-environment node
// Reads the token values straight from src/theme.css and checks WCAG 2.x contrast, so a
// token edit that drops below the threshold on any surface fails here, not in a consumer.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const css = readFileSync(fileURLToPath(new URL('../src/theme.css', import.meta.url)), 'utf8')

function token(name: string): string {
  const m = css.match(new RegExp(`--color-${name}:\\s*(#[0-9a-fA-F]{6})\\s*;`))
  if (!m) throw new Error(`token --color-${name} is not a #rrggbb value in theme.css`)
  return m[1]
}

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const s = parseInt(hex.slice(i, i + 2), 16) / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

const surfaces = ['bg', 'bg-alt', 'surface', 'surface-hover', 'surface-active']

describe('token contrast', () => {
  it.each(surfaces)('fg-dim has at least 4.5:1 on %s', (surface) => {
    expect(ratio(token('fg-dim'), token(surface))).toBeGreaterThanOrEqual(4.5)
  })

  it.each(surfaces)('border-strong has at least 3:1 on %s', (surface) => {
    expect(ratio(token('border-strong'), token(surface))).toBeGreaterThanOrEqual(3)
  })

  it('keeps fg-muted readable on every surface', () => {
    for (const surface of surfaces) {
      expect(ratio(token('fg-muted'), token(surface))).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('declares a dark colour-scheme and a forced-colours-safe focus outline', () => {
    expect(css).toMatch(/color-scheme:\s*dark/)
    expect(css).toMatch(/outline:\s*2px solid transparent/)
  })
})

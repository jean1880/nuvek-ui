import { describe, expect, it } from 'vitest'
import { cn } from '../src/lib/cn'

describe('cn', () => {
  it('lets the last conflicting utility win (consumer class overrides component)', () => {
    expect(cn('px-4 py-2', 'px-2')).toBe('py-2 px-2')
  })

  // Theme keys tailwind-merge does not know by default would be misread as colours and
  // drop a real colour class. Each custom key added in theme.css belongs here.
  it.each([
    ['text-2xs', 'text-fg'],
    ['text-fluid-lg', 'text-fg-muted'],
    ['shadow-glow', 'shadow-primary/10'],
    ['shadow-card', 'shadow-primary/10'],
  ])('keeps %s alongside %s', (a, b) => {
    expect(cn(a, b)).toBe(`${a} ${b}`)
  })

  it('still resolves a custom size against a default size', () => {
    expect(cn('text-xs', 'text-2xs')).toBe('text-2xs')
    expect(cn('shadow-card', 'shadow-xl')).toBe('shadow-xl')
  })
})

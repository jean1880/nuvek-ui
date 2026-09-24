// @vitest-environment node
// Compiles a consumer stylesheet against the BUILT package (dist/) with the real Tailwind
// CLI. Requires `npm run build` first — ui-gate.sh runs build before test.
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeAll, describe, expect, it } from 'vitest'

const root = fileURLToPath(new URL('..', import.meta.url))
let css = ''

beforeAll(() => {
  const out = join(mkdtempSync(join(tmpdir(), 'nuvek-ui-theme-')), 'out.css')
  execFileSync(
    join(root, 'node_modules/.bin/tailwindcss'),
    ['-i', join(root, 'test/fixtures/consumer.css'), '-o', out],
    { cwd: root, stdio: 'pipe' },
  )
  css = readFileSync(out, 'utf8')
}, 60_000)

describe('theme.css', () => {
  it('ships its own @source so consumers need no per-app scan config', () => {
    expect(readFileSync(join(root, 'dist/theme.css'), 'utf8')).toMatch(/@source\s+"\.\/"/)
  })

  // Only reachable through theme.css's @source (the fixture disables auto-detection).
  // Substring match, so variant-prefixed classes (`data-[state=open]:animate-dialog-in`) count.
  it.each(['.bg-surface', '.text-2xs', '.shadow-card', '.max-h-9\\/10', 'animate-dialog-in'])(
    'generates %s from the component bundle',
    (selector) => {
      expect(css.includes(selector)).toBe(true)
    },
  )

  it('does not generate the reset default palette', () => {
    expect(css.includes('--color-sky-400')).toBe(false)
  })

  // A dropped token fails silently in the browser (the declaration is just ignored),
  // so check mechanically: every var(--x) WITHOUT a fallback must be defined somewhere.
  it('references no undefined custom property', () => {
    const defined = new Set<string>()
    for (const m of css.matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1])
    for (const m of css.matchAll(/@property\s+(--[\w-]+)/g)) defined.add(m[1])
    // Set per element, never globally: `--chip-c` by the Chip colour classes,
    // `--reka-toast-swipe-move-x` inline by Reka's ToastRoot during a swipe.
    const perElement = new Set(['--chip-c', '--reka-toast-swipe-move-x'])

    const undefinedRefs = new Set<string>()
    for (const m of css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      if (!defined.has(m[1]) && !perElement.has(m[1])) undefinedRefs.add(m[1])
    }
    expect([...undefinedRefs]).toEqual([])
  })
})

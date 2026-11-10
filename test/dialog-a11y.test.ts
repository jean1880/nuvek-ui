import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Drawer, Modal } from '../src'

async function settle() {
  for (let i = 0; i < 5; i++) await nextTick()
  await new Promise((r) => setTimeout(r, 0))
}

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
  document.body.innerHTML = ''
})

describe.each([
  ['Modal', Modal],
  ['Drawer', Drawer],
] as const)('%s', (_name, Comp) => {
  const mountIt = (props: Record<string, unknown> = {}) => {
    wrapper = mount(Comp, {
      props: { open: true, title: 'Details', ...props },
      slots: { default: '<p>Body</p>' },
      attachTo: document.body,
    })
    return wrapper
  }

  it('renders the title as an h2 that labels the dialog', async () => {
    mountIt()
    await settle()
    const dialog = document.querySelector('[role="dialog"]')
    const h2 = dialog?.querySelector('h2')
    expect(h2?.textContent).toContain('Details')
    expect(dialog?.getAttribute('aria-labelledby')).toBe(h2?.id)
  })

  it('keeps the header slot as the dialog title element, as before', async () => {
    wrapper = mount(Comp, {
      props: { open: true },
      slots: { default: '<p>Body</p>', header: '<span id="custom">Custom head</span>' },
      attachTo: document.body,
    })
    await settle()
    const dialog = document.querySelector('[role="dialog"]')
    const labelled = document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')
    expect(labelled?.tagName).toBe('HEADER')
    expect(labelled?.querySelector('#custom')).not.toBeNull()
    expect(dialog?.querySelector('h2')).toBeNull()
  })

  it('a closable dialog with a header slot keeps the close button out of its name', async () => {
    wrapper = mount(Comp, {
      props: { open: true, closable: true },
      slots: { default: '<p>Body</p>', header: 'Custom head' },
      attachTo: document.body,
    })
    await settle()
    const dialog = document.querySelector('[role="dialog"]')
    const labelled = document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')
    expect(labelled?.querySelector('button')).toBeNull()
    expect(document.querySelector('[aria-label="Close"]')).not.toBeNull()
  })

  it('has no close button unless asked', async () => {
    mountIt()
    await settle()
    expect(document.querySelector('[aria-label="Close"]')).toBeNull()
  })

  it('closable adds a named close button that emits close', async () => {
    const w = mountIt({ closable: true })
    await settle()
    const btn = document.querySelector('[aria-label="Close"]') as HTMLElement
    expect(btn).not.toBeNull()
    btn.click()
    await settle()
    expect(w.emitted('close')).toHaveLength(1)
  })

  it('closeLabel renames the close button', async () => {
    mountIt({ closable: true, closeLabel: 'Fermer' })
    await settle()
    expect(document.querySelector('[aria-label="Fermer"]')).not.toBeNull()
  })

  it('closable works without a title too', async () => {
    mountIt({ title: undefined, ariaLabel: 'Settings', closable: true })
    await settle()
    expect(document.querySelector('[aria-label="Close"]')).not.toBeNull()
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Settings')
  })
})

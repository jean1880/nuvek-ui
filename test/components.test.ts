import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Button from '../src/components/Button.vue'
import Chip from '../src/components/Chip.vue'
import Modal from '../src/components/Modal.vue'

// Real keydown events are cancelable; Reka's closeOnEsc opt-out relies on preventDefault.
function pressEscape() {
  document.activeElement?.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
  )
}

// Reka portals the dialog to <body> and settles focus over a couple of ticks.
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

describe('class merging', () => {
  it('Chip: a consumer class replaces the conflicting variant class', () => {
    wrapper = mount(Chip, { props: { size: 'md', class: 'px-5' }, slots: { default: 'ok' } })
    const cls = wrapper.classes()
    expect(cls).toContain('px-5')
    expect(cls).not.toContain('px-3')
  })
})

describe('Button', () => {
  it('renders a native button with type by default', () => {
    wrapper = mount(Button, { slots: { default: 'Go' } })
    expect(wrapper.element.tagName).toBe('BUTTON')
    expect(wrapper.attributes('type')).toBe('button')
  })

  it('as a link drops button-only attributes and uses aria-disabled', () => {
    wrapper = mount(Button, {
      props: { as: 'a', disabled: true },
      attrs: { href: '/x' },
      slots: { default: 'Go' },
    })
    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('type')).toBeUndefined()
    expect(wrapper.attributes('disabled')).toBeUndefined()
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })
})

describe('Modal', () => {
  function mountModal(props: Record<string, unknown> = {}) {
    wrapper = mount(Modal, {
      props: { open: true, title: 'Confirm', ...props },
      slots: { default: '<button id="inside">Inside</button>' },
      attachTo: document.body,
    })
    return wrapper
  }

  it('renders an accessible dialog and moves focus inside it', async () => {
    mountModal()
    await settle()
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy()
    expect(dialog?.contains(document.activeElement)).toBe(true)
  })

  it('emits close on Escape', async () => {
    const w = mountModal()
    await settle()
    pressEscape()
    await settle()
    expect(w.emitted('close')).toHaveLength(1)
  })

  it('does not close on Escape when closeOnEsc is false', async () => {
    const w = mountModal({ closeOnEsc: false })
    await settle()
    pressEscape()
    await settle()
    expect(w.emitted('close')).toBeUndefined()
  })
})

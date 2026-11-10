import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Combobox, Drawer, Modal, Select, type SelectOption } from '../src'

beforeAll(() => {
  const proto = window.HTMLElement.prototype as unknown as Record<string, unknown>
  proto.hasPointerCapture ??= () => false
  proto.setPointerCapture ??= () => undefined
  proto.releasePointerCapture ??= () => undefined
  proto.scrollIntoView ??= () => undefined
})

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

const options: SelectOption[] = [
  { value: 'a', label: 'Alpha' },
  { value: 'c', label: 'Charlie' },
]

const key = (el: Element | null, k: string) =>
  el?.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

const optionByText = (text: string) =>
  [...document.querySelectorAll('[role="option"]')].find((o) => o.textContent?.includes(text)) as HTMLElement

const closed = ref(false)
const chosen = ref<string | number | undefined>(undefined)

// A Modal or Drawer holding one field, kept open, with a Close hook so a stray dismissal is visible.
function mountIn(overlay: typeof Modal | typeof Drawer, field: typeof Select | typeof Combobox) {
  closed.value = false
  chosen.value = undefined
  wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          overlay,
          { open: true, title: 'Edit', onClose: () => (closed.value = true) },
          {
            default: () =>
              h(field as typeof Select, {
                modelValue: chosen.value,
                'onUpdate:modelValue': (v: string | number) => (chosen.value = v),
                options,
                label: 'Letter',
                id: 'field',
              }),
          },
        ),
    }),
    { attachTo: document.body },
  )
}

// The dialog content renders in a portal, so look the field up after it has mounted.
async function fieldOf(overlay: typeof Modal | typeof Drawer, field: typeof Select | typeof Combobox) {
  mountIn(overlay, field)
  await settle()
  return document.getElementById('field') as HTMLElement
}

describe.each([
  ['Modal', Modal],
  ['Drawer', Drawer],
] as const)('fields inside %s', (_name, overlay) => {
  it('Select opens its popup above the overlay and selects without dismissing it', async () => {
    const trigger = await fieldOf(overlay, Select)
    await settle()
    trigger.focus()
    key(trigger, 'ArrowDown')
    await settle()
    const list = document.querySelector('[role="listbox"]') as HTMLElement
    expect(list).not.toBeNull()
    // Portalled out of the dialog, and stacked above it (popover 1500 over modal 1400).
    expect(list.closest('[role="dialog"]')).toBeNull()
    expect(list.className).toContain('z-(--z-popover)')
    expect(document.querySelector('[role="dialog"]')?.className).toContain('z-(--z-modal)')
    key(document.activeElement, 'ArrowDown')
    await settle()
    key(document.activeElement, 'Enter')
    await settle()
    expect(chosen.value).toBe('c')
    expect(closed.value).toBe(false)
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('Combobox opens its popup above the overlay and selects without dismissing it', async () => {
    const input = await fieldOf(overlay, Combobox)
    await settle()
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    const list = document.querySelector('[role="listbox"]') as HTMLElement
    expect(list).not.toBeNull()
    expect(list.closest('[role="dialog"]')).toBeNull()
    expect(list.className).toContain('z-(--z-popover)')
    optionByText('Charlie').click()
    await settle()
    expect(chosen.value).toBe('c')
    expect(closed.value).toBe(false)
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('closing the popup with Escape leaves the overlay open', async () => {
    const trigger = await fieldOf(overlay, Select)
    await settle()
    trigger.focus()
    key(trigger, 'ArrowDown')
    await settle()
    key(document.activeElement, 'Escape')
    await settle()
    expect(document.querySelector('[role="listbox"]')).toBeNull()
    expect(closed.value).toBe(false)
  })
})

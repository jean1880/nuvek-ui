import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import {
  DropdownMenu,
  MenuCheckboxItem,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
} from '../src'

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

const state = { status: ref('open'), pinned: ref(true), picked: [] as string[] }

function mountMenu() {
  state.status.value = 'open'
  state.pinned.value = true
  state.picked = []
  wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(DropdownMenu, { open: true }, {
          trigger: () => h('button', { type: 'button' }, 'Actions'),
          default: () => [
            h(MenuLabel, null, () => 'Status'),
            h(
              MenuRadioGroup,
              { modelValue: state.status.value, 'onUpdate:modelValue': (v: string) => (state.status.value = v) },
              () => [
                h(MenuRadioItem, { value: 'open' }, () => 'Open'),
                h(MenuRadioItem, { value: 'closed' }, () => 'Closed'),
              ],
            ),
            h(MenuSeparator),
            h(
              MenuCheckboxItem,
              { modelValue: state.pinned.value, 'onUpdate:modelValue': (v: boolean) => (state.pinned.value = v) },
              () => 'Pinned',
            ),
            h(MenuItem, { onSelect: () => state.picked.push('rename') }, () => 'Rename'),
            h(MenuItem, { disabled: true }, () => 'Delete'),
          ],
        }),
    }),
    { attachTo: document.body },
  )
}

describe('DropdownMenu family', () => {
  it('renders a menu with item, radio and checkbox roles', async () => {
    mountMenu()
    await settle()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    expect(document.querySelectorAll('[role="menuitem"]')).toHaveLength(2)
    expect(document.querySelectorAll('[role="menuitemradio"]')).toHaveLength(2)
    expect(document.querySelectorAll('[role="menuitemcheckbox"]')).toHaveLength(1)
    expect(document.querySelector('[role="separator"]')).not.toBeNull()
  })

  it('exposes the checked state of radio and checkbox items', async () => {
    mountMenu()
    await settle()
    const radios = [...document.querySelectorAll('[role="menuitemradio"]')]
    expect(radios.map((r) => r.getAttribute('aria-checked'))).toEqual(['true', 'false'])
    expect(document.querySelector('[role="menuitemcheckbox"]')?.getAttribute('aria-checked')).toBe('true')
  })

  it('updates v-model state when a radio item is chosen', async () => {
    mountMenu()
    await settle()
    const closed = document.querySelectorAll('[role="menuitemradio"]')[1] as HTMLElement
    closed.click()
    await settle()
    expect(state.status.value).toBe('closed')
  })

  it('emits select for an action item and marks a disabled one', async () => {
    mountMenu()
    await settle()
    const items = [...document.querySelectorAll('[role="menuitem"]')] as HTMLElement[]
    expect(items[1].getAttribute('aria-disabled')).toBe('true')
    items[0].click()
    await settle()
    expect(state.picked).toEqual(['rename'])
  })

  // Visibility itself is a CSS matter; the keyboard test above proves the state that drives it
  // (`data-highlighted`). This only pins the classes that style that state.
  it('styles the highlighted state with a tint plus an inset ring, on a dark popup', async () => {
    mountMenu()
    await settle()
    const item = document.querySelector('[role="menuitem"]')?.className ?? ''
    expect(item).toContain('data-[highlighted]:bg-primary/15')
    expect(item).toContain('data-[highlighted]:ring-inset')
    const menu = document.querySelector('[role="menu"]')?.className ?? ''
    expect(menu).toContain('bg-bg-modal')
    expect(menu).toContain('border-border-strong')
  })

  it('renders nothing but the trigger while closed', async () => {
    wrapper = mount(DropdownMenu, {
      props: { open: false },
      slots: { trigger: '<button type="button">Actions</button>', default: '<div>content</div>' },
      attachTo: document.body,
    })
    await settle()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(document.body.textContent).toContain('Actions')
  })
})

describe('DropdownMenu keyboard and uncontrolled use', () => {
  const picked: string[] = []

  function mountUncontrolled() {
    picked.length = 0
    wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(DropdownMenu, null, {
            trigger: () => h('button', { type: 'button', id: 'trig' }, 'Actions'),
            default: () => [
              h(MenuItem, { onSelect: () => picked.push('first') }, () => 'First'),
              h(MenuItem, { onSelect: () => picked.push('second') }, () => 'Second'),
            ],
          }),
      }),
      { attachTo: document.body },
    )
    return document.getElementById('trig') as HTMLElement
  }

  const key = (el: Element | null, k: string) =>
    el?.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

  it('opens uncontrolled from the keyboard, selects with Enter and returns focus to the trigger', async () => {
    const trigger = mountUncontrolled()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    trigger.focus()
    key(trigger, 'ArrowDown')
    await settle()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    key(document.activeElement, 'ArrowDown')
    await settle()
    const active = document.activeElement as HTMLElement
    expect(active.getAttribute('role')).toBe('menuitem')
    expect(active.hasAttribute('data-highlighted')).toBe(true)

    key(active, 'Enter')
    await settle()
    expect(picked).toHaveLength(1)
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const trigger = mountUncontrolled()
    trigger.focus()
    key(trigger, 'ArrowDown')
    await settle()
    expect(document.querySelector('[role="menu"]')).not.toBeNull()
    key(document.activeElement, 'Escape')
    await settle()
    expect(document.querySelector('[role="menu"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})

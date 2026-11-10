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

  it('shows a visible highlight (tint plus inset ring) and dark popup styling', async () => {
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

import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Select, type SelectOption } from '../src'

// jsdom lacks the pointer and scroll APIs Reka's listbox calls.
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
  { value: 'b', label: 'Bravo', disabled: true },
  { value: 'c', label: 'Charlie' },
]

const model = ref<string | number | undefined>(undefined)

function mountSelect(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
  model.value = undefined
  wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(Select, {
          modelValue: model.value,
          'onUpdate:modelValue': (v: string | number) => (model.value = v),
          options,
          label: 'Letter',
          placeholder: 'Pick one',
          id: 'sel',
          ...props,
          ...attrs,
        }),
    }),
    { attachTo: document.body },
  )
  return document.getElementById('sel') as HTMLElement
}

const key = (el: Element | null, k: string) =>
  el?.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

async function openWithKeyboard(trigger: HTMLElement) {
  trigger.focus()
  key(trigger, 'ArrowDown')
  await settle()
}

describe('Select', () => {
  it('is a labelled combobox that is collapsed until opened', async () => {
    const trigger = mountSelect()
    expect(trigger.getAttribute('role')).toBe('combobox')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelector('label[for="sel"]')?.textContent).toContain('Letter')
    expect(trigger.textContent).toContain('Pick one')
    await openWithKeyboard(trigger)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('[role="listbox"]')).not.toBeNull()
    expect(document.querySelectorAll('[role="option"]')).toHaveLength(3)
  })

  it('moves with the arrow keys, selects with Enter and returns focus to the trigger', async () => {
    const trigger = mountSelect()
    await openWithKeyboard(trigger)
    const first = document.activeElement as HTMLElement
    expect(first.getAttribute('role')).toBe('option')
    expect(first.hasAttribute('data-highlighted')).toBe(true)
    key(first, 'Enter')
    await settle()
    expect(model.value).toBe('a')
    expect(document.querySelector('[role="listbox"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
    expect(trigger.textContent).toContain('Alpha')
  })

  it('skips disabled options while moving', async () => {
    const trigger = mountSelect()
    await openWithKeyboard(trigger)
    key(document.activeElement, 'ArrowDown')
    await settle()
    const active = document.activeElement as HTMLElement
    expect(active.textContent).toContain('Charlie')
    const disabled = [...document.querySelectorAll('[role="option"]')].find((o) => o.textContent?.includes('Bravo'))
    expect(disabled?.getAttribute('aria-disabled')).toBe('true')
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    const trigger = mountSelect()
    await openWithKeyboard(trigger)
    key(document.activeElement, 'Escape')
    await settle()
    expect(document.querySelector('[role="listbox"]')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('updates v-model with the chosen option', async () => {
    const trigger = mountSelect()
    await openWithKeyboard(trigger)
    const charlie = [...document.querySelectorAll('[role="option"]')].find((o) => o.textContent?.includes('Charlie'))
    key(charlie ?? null, 'Enter')
    await settle()
    expect(model.value).toBe('c')
  })

  it('shows the selected option as the value', async () => {
    const trigger = mountSelect({ modelValue: 'c' })
    await settle()
    expect(trigger.textContent).toContain('Charlie')
    await openWithKeyboard(trigger)
    const selected = [...document.querySelectorAll('[role="option"]')].find((o) => o.getAttribute('aria-selected') === 'true')
    expect(selected?.textContent).toContain('Charlie')
  })

  it('labels each group and renders its options beneath it', async () => {
    const trigger = mountSelect({
      options: [
        { value: 'x', label: 'Loose' },
        { value: 'r', label: 'Red', group: 'Colours' },
        { value: 'g', label: 'Green', group: 'Colours' },
        { value: 'o', label: 'Oak', group: 'Trees' },
      ],
    })
    await openWithKeyboard(trigger)
    const groups = [...document.querySelectorAll('[role="group"]')]
    const named = groups.filter((g) => g.getAttribute('aria-labelledby'))
    expect(named).toHaveLength(2)
    const names = named.map((g) => document.getElementById(g.getAttribute('aria-labelledby') as string)?.textContent)
    expect(names).toEqual(['Colours', 'Trees'])
    expect(named[0].querySelectorAll('[role="option"]')).toHaveLength(2)
  })

  it('wires the error: aria-invalid and aria-describedby to the message', () => {
    const trigger = mountSelect({ error: 'Choose a letter', help: 'Any letter' })
    expect(trigger.getAttribute('aria-invalid')).toBe('true')
    const describedBy = trigger.getAttribute('aria-describedby') as string
    expect(document.getElementById(describedBy)?.textContent).toBe('Choose a letter')
    expect(document.body.textContent).not.toContain('Any letter')
  })

  it('describes the field by its help text when there is no error', () => {
    const trigger = mountSelect({ help: 'Any letter' })
    expect(trigger.hasAttribute('aria-invalid')).toBe(false)
    const describedBy = trigger.getAttribute('aria-describedby') as string
    expect(document.getElementById(describedBy)?.textContent).toBe('Any letter')
  })

  it('keeps the caller aria-label, and names a label-less field from its placeholder', () => {
    const named = mountSelect({ label: undefined }, { 'aria-label': 'Sort order' })
    expect(named.getAttribute('aria-label')).toBe('Sort order')
    wrapper?.unmount()
    const fallback = mountSelect({ label: undefined })
    expect(fallback.getAttribute('aria-label')).toBe('Pick one')
  })

  it('marks required and hides the decorative asterisk and chevron from assistive tech', () => {
    const trigger = mountSelect({ required: true })
    expect(trigger.getAttribute('aria-required')).toBe('true')
    expect(document.querySelector('label[for="sel"] [aria-hidden="true"]')?.textContent).toBe('*')
    expect(trigger.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not open when disabled', async () => {
    const trigger = mountSelect({ disabled: true })
    expect(trigger.hasAttribute('disabled')).toBe(true)
    await openWithKeyboard(trigger)
    expect(document.querySelector('[role="listbox"]')).toBeNull()
  })

  it('sizes the trigger like TextField at md and scales for sm and lg', () => {
    expect(mountSelect().className).toContain('px-3 py-2 text-sm')
    wrapper?.unmount()
    expect(mountSelect({ size: 'sm' }).className).toContain('px-2.5')
    wrapper?.unmount()
    expect(mountSelect({ size: 'lg' }).className).toContain('px-4')
  })

  it('styles the popup like the menu family and stacks it above dialogs', async () => {
    const trigger = mountSelect()
    await openWithKeyboard(trigger)
    const list = document.querySelector('[role="listbox"]')?.className ?? ''
    expect(list).toContain('bg-bg-modal')
    expect(list).toContain('border-border-strong')
    expect(list).toContain('z-(--z-popover)')
    expect(list).toContain('max-h-72')
    expect(list).toContain('w-(--reka-popper-anchor-width)')
    const item = document.querySelector('[role="option"]')?.className ?? ''
    expect(item).toContain('data-[highlighted]:bg-primary/15')
    expect(item).toContain('data-[highlighted]:ring-inset')
  })

  it('submits its value under `name` inside a form', async () => {
    wrapper = mount(
      defineComponent({
        setup: () => () => h('form', null, [h(Select, { modelValue: 'c', options, name: 'letter', label: 'Letter' })]),
      }),
      { attachTo: document.body },
    )
    await settle()
    // Reka mirrors the value into a native select so the field posts with its form.
    expect(document.querySelector('select[name="letter"]')).not.toBeNull()
  })
})

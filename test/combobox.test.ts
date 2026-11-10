import { afterEach, beforeAll, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import { Combobox, type SelectOption } from '../src'

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
  { value: 'd', label: 'Delta' },
]

const single = ref<string | number | (string | number)[] | undefined>(undefined)
const events = { created: [] as string[], searched: [] as string[] }

function mountCombobox(props: Record<string, unknown> = {}, slots: Record<string, () => unknown> = {}) {
  single.value = props.multiple ? [] : undefined
  events.created = []
  events.searched = []
  wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(
          Combobox,
          {
            modelValue: single.value,
            'onUpdate:modelValue': (v: string | number | (string | number)[]) => (single.value = v),
            onCreate: (v: string) => events.created.push(v),
            onSearch: (v: string) => events.searched.push(v),
            options,
            label: 'Letter',
            placeholder: 'Find one',
            id: 'cb',
            ...props,
          },
          slots,
        ),
    }),
    { attachTo: document.body },
  )
  return document.getElementById('cb') as HTMLInputElement
}

const key = (el: Element | null, k: string) =>
  el?.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }))

async function type(input: HTMLInputElement, text: string) {
  input.focus()
  input.value = text
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await settle()
}

const optionTexts = () => [...document.querySelectorAll('[role="option"]')].map((o) => o.textContent?.trim())
const optionByText = (text: string) =>
  [...document.querySelectorAll('[role="option"]')].find((o) => o.textContent?.includes(text)) as HTMLElement

describe('Combobox single', () => {
  it('is a labelled combobox that expands when opened from the keyboard', async () => {
    const input = mountCombobox()
    expect(input.getAttribute('role')).toBe('combobox')
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(document.querySelector('label[for="cb"]')?.textContent).toContain('Letter')
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(document.querySelector('[role="listbox"]')).not.toBeNull()
    expect(optionTexts()).toHaveLength(4)
  })

  it('moves with the arrow keys and selects the highlighted option with Enter', async () => {
    const input = mountCombobox()
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    key(input, 'ArrowDown')
    await settle()
    // Opening highlights Alpha; Bravo is disabled and skipped, so the next step lands on Charlie.
    expect(document.querySelector('[data-highlighted]')?.textContent).toContain('Charlie')
    key(input, 'Enter')
    await settle()
    expect(single.value).toBe('c')
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(input.value).toBe('Charlie')
  })

  it('closes on Escape and keeps focus on the field', async () => {
    const input = mountCombobox()
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    key(input, 'Escape')
    await settle()
    expect(document.querySelector('[role="listbox"]')).toBeNull()
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(input)
  })

  it('selects on click and updates v-model', async () => {
    const input = mountCombobox()
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    optionByText('Delta').click()
    await settle()
    expect(single.value).toBe('d')
  })

  it('filters by what is typed, ignoring case, and emits search', async () => {
    const input = mountCombobox()
    await type(input, 'AL')
    expect(optionTexts()).toEqual(['Alpha'])
    expect(events.searched).toEqual(['AL'])
    await type(input, 'ta')
    expect(optionTexts()).toEqual(['Delta'])
  })

  it('shows the empty state, replaceable through the empty slot', async () => {
    const input = mountCombobox()
    await type(input, 'zzz')
    expect(document.body.textContent).toContain('No results')
    wrapper?.unmount()
    document.body.innerHTML = ''
    const custom = mountCombobox({}, { empty: () => 'Nothing matches' })
    await type(custom, 'zzz')
    expect(document.body.textContent).toContain('Nothing matches')
  })

  it('shows a loading row and marks the field busy while loading', async () => {
    const input = mountCombobox({ loading: true, options: [] })
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    expect(input.getAttribute('aria-busy')).toBe('true')
    expect(document.querySelector('[role="status"]')?.textContent).toContain('Loading')
    expect(document.body.textContent).not.toContain('No results')
  })

  it('can leave filtering to the caller for async results', async () => {
    const input = mountCombobox({ filter: false })
    await type(input, 'zzz')
    expect(optionTexts()).toHaveLength(4)
    expect(events.searched).toEqual(['zzz'])
  })

  it('offers an Add row for new text and emits create without changing the value', async () => {
    const input = mountCombobox({ allowCreate: true })
    await type(input, 'Echo')
    expect(optionTexts()).toEqual(['Add "Echo"'])
    optionByText('Add').click()
    await settle()
    expect(events.created).toEqual(['Echo'])
    expect(single.value).toBeUndefined()
  })

  it('does not offer Add when the text matches an option label', async () => {
    const input = mountCombobox({ allowCreate: true })
    await type(input, 'alpha')
    expect(optionTexts()).toEqual(['Alpha'])
  })

  it('creates from the keyboard with Enter on the Add row', async () => {
    const input = mountCombobox({ allowCreate: true })
    await type(input, 'Echo')
    key(input, 'Enter')
    await settle()
    expect(events.created).toEqual(['Echo'])
  })

  it('labels each group', async () => {
    const input = mountCombobox({
      options: [
        { value: 'r', label: 'Red', group: 'Colours' },
        { value: 'o', label: 'Oak', group: 'Trees' },
      ],
    })
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    const named = [...document.querySelectorAll('[role="group"]')].filter((g) => g.getAttribute('aria-labelledby'))
    const names = named.map((g) => document.getElementById(g.getAttribute('aria-labelledby') as string)?.textContent)
    expect(names).toEqual(['Colours', 'Trees'])
  })

  it('wires the error: aria-invalid and aria-describedby to the message', () => {
    const input = mountCombobox({ error: 'Pick a letter', help: 'Any letter' })
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(document.getElementById(input.getAttribute('aria-describedby') as string)?.textContent).toBe('Pick a letter')
    expect(document.body.textContent).not.toContain('Any letter')
  })

  it('describes the field by its help text when there is no error', () => {
    const input = mountCombobox({ help: 'Any letter' })
    expect(input.hasAttribute('aria-invalid')).toBe(false)
    expect(document.getElementById(input.getAttribute('aria-describedby') as string)?.textContent).toBe('Any letter')
  })

  it('marks required and disabled', () => {
    const input = mountCombobox({ required: true, disabled: true })
    expect(input.getAttribute('aria-required')).toBe('true')
    expect(input.disabled).toBe(true)
  })

  it('names a label-less field from its placeholder, and keeps a caller aria-label', () => {
    const fallback = mountCombobox({ label: undefined })
    expect(fallback.getAttribute('aria-label')).toBe('Find one')
    wrapper?.unmount()
    document.body.innerHTML = ''
    const named = mountCombobox({ label: undefined, 'aria-label': 'Pick a letter' })
    expect(named.getAttribute('aria-label')).toBe('Pick a letter')
  })

  it('styles the popup like the menu family, above dialogs', async () => {
    const input = mountCombobox()
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    const list = document.querySelector('[role="listbox"]')?.className ?? ''
    expect(list).toContain('bg-bg-modal')
    expect(list).toContain('border-border-strong')
    expect(list).toContain('z-(--z-popover)')
    expect(list).toContain('w-(--reka-popper-anchor-width)')
    const item = document.querySelector('[role="option"]')?.className ?? ''
    expect(item).toContain('data-[highlighted]:bg-primary/15')
    expect(item).toContain('data-[highlighted]:ring-inset')
  })
})

describe('Combobox multiple', () => {
  const removeButtons = () => [...document.querySelectorAll('button[aria-label^="Remove "]')]

  it('shows a removable chip per selected value, named "Remove {label}"', async () => {
    mountCombobox({ multiple: true, modelValue: ['a', 'c'] })
    await settle()
    expect(removeButtons().map((b) => b.getAttribute('aria-label'))).toEqual(['Remove Alpha', 'Remove Charlie'])
  })

  it('adds a value from the list and keeps the list open', async () => {
    const input = mountCombobox({ multiple: true })
    input.focus()
    key(input, 'ArrowDown')
    await settle()
    optionByText('Delta').click()
    await settle()
    expect(single.value).toEqual(['d'])
    expect(removeButtons().map((b) => b.getAttribute('aria-label'))).toEqual(['Remove Delta'])
    expect(input.getAttribute('aria-expanded')).toBe('true')
    expect(optionByText('Delta').getAttribute('aria-selected')).toBe('true')
  })

  it('removes a value with its chip button', async () => {
    mountCombobox({ multiple: true })
    single.value = ['a', 'c']
    await settle()
    ;(removeButtons()[0] as HTMLElement).click()
    await settle()
    expect(single.value).toEqual(['c'])
  })

  it('removes the last chip with Backspace on an empty field only', async () => {
    const input = mountCombobox({ multiple: true })
    single.value = ['a', 'c']
    await settle()
    await type(input, 'x')
    key(input, 'Backspace')
    await settle()
    expect(single.value).toEqual(['a', 'c'])
    await type(input, '')
    key(input, 'Backspace')
    await settle()
    expect(single.value).toEqual(['a'])
  })

  it('clears the typed text after choosing', async () => {
    const input = mountCombobox({ multiple: true })
    await type(input, 'del')
    optionByText('Delta').click()
    await settle()
    expect(input.value).toBe('')
  })

  it('has no remove buttons when disabled', async () => {
    mountCombobox({ multiple: true, modelValue: ['a'], disabled: true })
    single.value = ['a']
    await settle()
    expect(removeButtons()).toHaveLength(0)
  })

  it('keeps chip labels when async options no longer include the value', async () => {
    mountCombobox({ multiple: true })
    single.value = ['a']
    await settle()
    wrapper?.setProps({})
    expect(removeButtons().map((b) => b.getAttribute('aria-label'))).toEqual(['Remove Alpha'])
  })
})

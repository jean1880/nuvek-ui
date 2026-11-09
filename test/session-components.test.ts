import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'
import {
  Avatar,
  Drawer,
  ProgressBar,
  SearchField,
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  Tooltip,
  TooltipProvider,
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
  vi.unstubAllGlobals()
})

describe('Tabs', () => {
  const Harness = defineComponent({
    props: { class: String },
    setup(p) {
      const tab = ref('a')
      return () =>
        h(Tabs, { modelValue: tab.value, 'onUpdate:modelValue': (v: string) => (tab.value = v), class: p.class }, () => [
          h(TabsList, null, () => [
            h(TabsTrigger, { value: 'a' }, () => 'A'),
            h(TabsTrigger, { value: 'b' }, () => 'B'),
            h(TabsTrigger, { value: 'c', disabled: true }, () => 'C'),
          ]),
          h(TabsContent, { value: 'a' }, () => 'panel-a'),
          h(TabsContent, { value: 'b' }, () => 'panel-b'),
        ])
    },
  })

  it('renders ARIA roles and shows the active panel', () => {
    wrapper = mount(Harness, { attachTo: document.body })
    expect(wrapper.find('[role="tablist"]').exists()).toBe(true)
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(3)
    expect(tabs[0].attributes('aria-selected')).toBe('true')
    expect(tabs[2].attributes('disabled')).toBeDefined()
    expect(wrapper.text()).toContain('panel-a')
    expect(wrapper.text()).not.toContain('panel-b')
  })

  it('v-model updates when a trigger is activated', async () => {
    wrapper = mount(Harness, { attachTo: document.body })
    await wrapper.findAll('[role="tab"]')[1].trigger('mousedown', { button: 0, ctrlKey: false })
    await settle()
    expect(wrapper.text()).toContain('panel-b')
  })

  it('emits update:modelValue', async () => {
    wrapper = mount(Tabs, {
      props: { modelValue: 'a' },
      slots: {
        default: () => [
          h(TabsList, null, () => [h(TabsTrigger, { value: 'a' }, () => 'A'), h(TabsTrigger, { value: 'b' }, () => 'B')]),
        ],
      },
      attachTo: document.body,
    })
    await wrapper.findAll('[role="tab"]')[1].trigger('mousedown', { button: 0, ctrlKey: false })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['b'])
  })

  it('a consumer class replaces the conflicting default', () => {
    wrapper = mount(Harness, { props: { class: 'gap-8' }, attachTo: document.body })
    expect(wrapper.classes()).toContain('gap-8')
    expect(wrapper.classes()).not.toContain('gap-4')
  })
})

describe('Tooltip', () => {
  function mountTip(props: Record<string, unknown> = {}) {
    wrapper = mount(
      defineComponent({
        setup: () => () =>
          h(TooltipProvider, null, () =>
            h(Tooltip, { content: 'Help text', ...props }, () => h('button', { id: 'trig' }, 'Hover')),
          ),
      }),
      { attachTo: document.body },
    )
    return wrapper
  }

  it('renders the trigger and no content until opened', () => {
    mountTip()
    expect(document.querySelector('#trig')).not.toBeNull()
    expect(document.body.textContent).not.toContain('Help text')
  })

  it('opens on focus with role=tooltip content', async () => {
    mountTip({ delay: 0 })
    ;(document.querySelector('#trig') as HTMLElement).focus()
    await settle()
    expect(document.querySelector('[role="tooltip"]')?.textContent).toContain('Help text')
  })
})

describe('Drawer', () => {
  function mountDrawer(props: Record<string, unknown> = {}) {
    wrapper = mount(Drawer, {
      props: { open: true, title: 'Details', ...props },
      slots: { default: '<button>Inside</button>', footer: '<span id="foot">f</span>' },
      attachTo: document.body,
    })
    return wrapper
  }

  it('renders a labelled modal dialog with slots', async () => {
    mountDrawer()
    await settle()
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy()
    expect(dialog?.contains(document.activeElement)).toBe(true)
    expect(document.querySelector('#foot')).not.toBeNull()
  })

  it('uses ariaLabel as the name when there is no title', async () => {
    mountDrawer({ title: undefined, ariaLabel: 'Settings' })
    await settle()
    expect(document.querySelector('[role="dialog"]')?.textContent).toContain('Settings')
  })

  it('side switches the edge', async () => {
    mountDrawer({ side: 'left' })
    await settle()
    const cls = document.querySelector('[role="dialog"]')?.className ?? ''
    expect(cls).toContain('left-0')
    expect(cls).not.toContain('right-0')
  })

  it('emits close on Escape', async () => {
    const w = mountDrawer()
    await settle()
    document.activeElement?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    )
    await settle()
    expect(w.emitted('close')).toHaveLength(1)
  })

  it('a consumer class replaces the conflicting default', async () => {
    mountDrawer({ class: 'max-w-xl' })
    await settle()
    const cls = document.querySelector('[role="dialog"]')?.className ?? ''
    expect(cls).toContain('max-w-xl')
    expect(cls).not.toContain('max-w-md')
  })
})

describe.each([
  ['TextField', TextField],
  ['SearchField', SearchField],
] as const)('%s', (_name, Comp) => {
  it('associates the label with the input and reflects props', () => {
    wrapper = mount(Comp, {
      props: { modelValue: 'x', label: 'Name', placeholder: 'Type', type: 'email', id: 'f1' },
    })
    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('f1')
    expect(input.attributes('type')).toBe('email')
    expect(input.attributes('placeholder')).toBe('Type')
    expect(wrapper.find('label').attributes('for')).toBe('f1')
    expect(input.element.value).toBe('x')
  })

  it('emits update:modelValue on input', async () => {
    wrapper = mount(Comp, { props: { modelValue: '' } })
    await wrapper.find('input').setValue('hello')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['hello'])
  })

  it('disables the input', () => {
    wrapper = mount(Comp, { props: { modelValue: '', disabled: true } })
    expect(wrapper.find('input').attributes('disabled')).toBeDefined()
  })

  it('a consumer class replaces the conflicting default', () => {
    wrapper = mount(Comp, { props: { modelValue: '', class: 'gap-4' } })
    expect(wrapper.classes()).toContain('gap-4')
    expect(wrapper.classes()).not.toContain('gap-1')
  })
})

describe('TextField slots and focus', () => {
  it('pads for leading/trailing slots only when filled', () => {
    wrapper = mount(TextField, { props: { modelValue: '' } })
    expect(wrapper.find('input').classes()).not.toContain('ps-9')
    wrapper.unmount()
    wrapper = mount(TextField, {
      props: { modelValue: '' },
      slots: { leading: '<i id="l"/>', trailing: '<i id="t"/>' },
    })
    expect(wrapper.find('input').classes()).toEqual(expect.arrayContaining(['ps-9', 'pe-9']))
    expect(wrapper.find('#l').exists() && wrapper.find('#t').exists()).toBe(true)
  })

  it('does not suppress the theme focus-visible ring', () => {
    wrapper = mount(TextField, { props: { modelValue: '' } })
    const cls = wrapper.find('input').classes().join(' ')
    expect(cls).not.toMatch(/outline|ring-0|focus:/)
  })

  it('clearLabel names the SearchField clear button', () => {
    wrapper = mount(SearchField, { props: { modelValue: 'a', clearLabel: 'Effacer' } })
    expect(wrapper.find('button').attributes('aria-label')).toBe('Effacer')
  })
})

describe('TextField a11y', () => {
  it('falls back to the placeholder as aria-label without a label', () => {
    wrapper = mount(TextField, { props: { modelValue: '', placeholder: 'Email' } })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Email')
  })
})

describe('SearchField', () => {
  it('names the input from the visible label, else placeholder as aria-label', () => {
    wrapper = mount(SearchField, { props: { modelValue: '', placeholder: 'Search' } })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Search')
    wrapper.unmount()
    wrapper = mount(SearchField, { props: { modelValue: '', label: 'Find', placeholder: 'Search' } })
    expect(wrapper.find('input').attributes('aria-label')).toBeUndefined()
    expect(wrapper.find('label').text()).toBe('Find')
  })

  it('hides the clear button when empty and has an aria-hidden icon', () => {
    wrapper = mount(SearchField, { props: { modelValue: '' } })
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('svg').attributes('aria-hidden')).toBe('true')
  })

  it('clear empties the value and emits clear', async () => {
    wrapper = mount(SearchField, { props: { modelValue: 'abc' } })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([''])
    expect(wrapper.emitted('clear')).toHaveLength(1)
  })
})

describe('Skeleton', () => {
  it('is aria-hidden and shimmers', () => {
    wrapper = mount(Skeleton)
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.classes().join(' ')).toContain('animate-shimmer')
  })

  it('a consumer class replaces the conflicting default', () => {
    wrapper = mount(Skeleton, { props: { class: 'rounded-full' } })
    expect(wrapper.classes()).toContain('rounded-full')
    expect(wrapper.classes()).not.toContain('rounded-md')
  })
})

describe('Avatar', () => {
  it.each([
    ['Ada Lovelace', 'AL'],
    ['  ada   byron   king ', 'AB'],
    ['plato', 'P'],
    ['élodie östlund', 'ÉÖ'],
    ['𝒜lice 𝒷ob', '𝒜𝒷'],
  ])('initials for %s', async (name, expected) => {
    wrapper = mount(Avatar, { props: { name } })
    await settle()
    expect(wrapper.text()).toBe(expected.toUpperCase())
  })

  it.each(['', '   '])('empty name %j falls back to ? with a non-empty label', async (name) => {
    wrapper = mount(Avatar, { props: { name } })
    await settle()
    expect(wrapper.text()).toBe('?')
    expect(wrapper.find('[role="img"]').attributes('aria-label')).toBeTruthy()
  })

  // Reka probes the URL with a detached `new window.Image()`; capture it to fire its events.
  function captureImages() {
    const created: HTMLImageElement[] = []
    const Real = window.Image
    vi.stubGlobal(
      'Image',
      class extends Real {
        constructor() {
          super()
          created.push(this)
        }
      },
    )
    return created
  }

  it('falls back to initials when the image errors', async () => {
    const created = captureImages()
    wrapper = mount(Avatar, { props: { name: 'Grace Hopper', src: 'https://example.com/x.png' } })
    await settle()
    created[0].dispatchEvent(new Event('error'))
    await settle()
    expect(wrapper.find('img').attributes('style')).toContain('display: none')
    expect(wrapper.text()).toBe('GH')
  })

  it('renders the image with alt=name once loaded', async () => {
    const created = captureImages()
    wrapper = mount(Avatar, { props: { name: 'Grace Hopper', src: 'https://example.com/x.png' } })
    await settle()
    created[0].dispatchEvent(new Event('load'))
    await settle()
    expect(wrapper.find('img').attributes('alt')).toBe('Grace Hopper')
    expect(wrapper.find('img').attributes('style') ?? '').not.toContain('display: none')
    expect(wrapper.text()).toBe('')
  })

  it('size variants and class override', () => {
    wrapper = mount(Avatar, { props: { name: 'A B', size: 'lg', class: 'size-20' } })
    expect(wrapper.classes()).toContain('size-20')
    expect(wrapper.classes()).not.toContain('size-12')
  })
})

describe('ProgressBar', () => {
  const bar = (value: number, max: number, extra: Record<string, unknown> = {}) => {
    wrapper = mount(ProgressBar, { props: { value, max, ...extra } })
    return wrapper
  }

  it('exposes progressbar role with aria-valuenow/max', () => {
    const w = bar(30, 120)
    expect(w.attributes('role')).toBe('progressbar')
    expect(w.attributes('aria-valuenow')).toBe('30')
    expect(w.attributes('aria-valuemax')).toBe('120')
  })

  it.each([
    [-5, 10, '0'],
    [50, 10, '10'],
    [Number.NaN, 10, '0'],
  ])('clamps %s of %s to %s', (value, max, now) => {
    const w = bar(value, max)
    expect(w.attributes('aria-valuenow')).toBe(now)
  })

  it('sizes the indicator by percent and maps intent to a token class', () => {
    const w = bar(25, 100, { intent: 'error' })
    const ind = w.find('[data-state]:not([role])')
    expect(ind.attributes('style')).toContain('width: 25%')
    expect(ind.classes()).toContain('bg-error')
  })

  it('uses label as the accessible name', () => {
    expect(bar(1, 2, { label: 'Upload' }).attributes('aria-label')).toBe('Upload')
  })

  it('a consumer class replaces the conflicting default', () => {
    const w = bar(1, 2, { class: 'h-4' })
    expect(w.classes()).toContain('h-4')
    expect(w.classes()).not.toContain('h-2')
  })
})

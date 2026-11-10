import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { SearchField, TextField } from '../src'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe.each([
  ['TextField', TextField],
  ['SearchField', SearchField],
] as const)('%s aria-label precedence', (_name, Comp) => {
  it("keeps the caller's aria-label over the placeholder", () => {
    wrapper = mount(Comp, {
      props: { modelValue: '', placeholder: 'Find a note' },
      attrs: { 'aria-label': 'Search notes' },
    })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Search notes')
  })

  it('names a field with no placeholder from the caller aria-label', () => {
    wrapper = mount(Comp, { props: { modelValue: '' }, attrs: { 'aria-label': 'Session date' } })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Session date')
  })

  it('falls back to the placeholder when no aria-label is given', () => {
    wrapper = mount(Comp, { props: { modelValue: '', placeholder: 'Email' } })
    expect(wrapper.find('input').attributes('aria-label')).toBe('Email')
  })
})

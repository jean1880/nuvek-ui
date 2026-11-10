import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Chip } from '../src'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('Chip interactive', () => {
  it('guarantees a 24 px target at the compact size', () => {
    wrapper = mount(Chip, { props: { size: 'sm', interactive: true }, slots: { default: 'Filter' } })
    expect(wrapper.classes()).toContain('min-h-6')
    expect(wrapper.classes()).toContain('cursor-pointer')
  })

  it('leaves a plain chip unchanged', () => {
    wrapper = mount(Chip, { props: { size: 'sm' } })
    expect(wrapper.classes()).not.toContain('min-h-6')
    expect(wrapper.classes()).not.toContain('cursor-pointer')
  })
})

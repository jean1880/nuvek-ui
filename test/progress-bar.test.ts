import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { ProgressBar } from '../src'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('ProgressBar accessible name', () => {
  it('uses the supplied label as the name and the percentage as the value text', () => {
    wrapper = mount(ProgressBar, { props: { value: 5, max: 20, label: 'HP for Goblin' } })
    expect(wrapper.attributes('aria-label')).toBe('HP for Goblin')
    expect(wrapper.attributes('aria-valuetext')).toBe('25%')
  })

  it('has a sensible default name when none is passed', () => {
    wrapper = mount(ProgressBar, { props: { value: 1, max: 2 } })
    expect(wrapper.attributes('aria-label')).toBe('Progress')
    expect(wrapper.attributes('aria-valuetext')).toBe('50%')
  })

  it('outlines the track so it is visible on any surface', () => {
    wrapper = mount(ProgressBar, { props: { value: 1, max: 2 } })
    expect(wrapper.classes()).toContain('outline-border-strong')
  })
})

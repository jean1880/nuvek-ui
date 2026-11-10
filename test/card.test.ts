import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Card } from '../src'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('Card interactive', () => {
  it('draws the focus ring on the card when a child is keyboard-focused', () => {
    wrapper = mount(Card, { props: { interactive: true }, slots: { default: '<button>Open</button>' } })
    const cls = wrapper.classes().join(' ')
    expect(cls).toContain('has-[:focus-visible]:ring-2')
    expect(cls).toContain('has-[:focus-visible]:ring-primary')
    expect(cls).toContain('outline-transparent')
  })

  it('adds no focus ring by default', () => {
    wrapper = mount(Card)
    expect(wrapper.classes().join(' ')).not.toContain('focus-visible')
  })

  it('still clips its content', () => {
    wrapper = mount(Card, { props: { interactive: true } })
    expect(wrapper.classes()).toContain('overflow-hidden')
  })
})

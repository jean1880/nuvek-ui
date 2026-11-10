import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { Button } from '../src'

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('Button danger hover', () => {
  it('flips to the dark background colour on hover, not white on the error fill', () => {
    wrapper = mount(Button, { props: { variant: 'danger' }, slots: { default: 'Delete' } })
    const cls = wrapper.classes()
    expect(cls).toContain('not-disabled:hover:bg-error')
    expect(cls).toContain('not-disabled:hover:text-bg')
    expect(cls).not.toContain('not-disabled:hover:text-white')
  })
})

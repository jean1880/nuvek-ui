import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Avatar } from '../src'

async function settle() {
  for (let i = 0; i < 5; i++) await nextTick()
  await new Promise((r) => setTimeout(r, 0))
}

let wrapper: VueWrapper | undefined
afterEach(() => {
  wrapper?.unmount()
  wrapper = undefined
})

describe('Avatar decorative', () => {
  it('is named and exposed by default', async () => {
    wrapper = mount(Avatar, { props: { name: 'Ada Lovelace' } })
    await settle()
    expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    expect(wrapper.find('[role="img"]').attributes('aria-label')).toBe('Ada Lovelace')
  })

  it('decorative hides it and drops the duplicate name', async () => {
    wrapper = mount(Avatar, { props: { name: 'Ada Lovelace', decorative: true } })
    await settle()
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('[role="img"]').exists()).toBe(false)
    expect(wrapper.find('[aria-label]').exists()).toBe(false)
    expect(wrapper.text()).toBe('AL')
  })
})

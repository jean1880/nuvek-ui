import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import { ToastStack, useToasts } from '../src'

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

describe('useToasts durations', () => {
  it('keeps errors until dismissed and other types for at least 8 s', () => {
    const { toasts, showToast } = useToasts()
    showToast('a')
    showToast('b', 'info')
    showToast('c', 'warning')
    showToast('d', 'error')
    const [success, info, warning, error] = toasts.value
    for (const t of [success, info, warning]) expect(t.duration).toBeGreaterThanOrEqual(8000)
    expect(error.duration).toBe(Number.POSITIVE_INFINITY)
  })

  it('a single number applies to every type', () => {
    const { toasts, showToast } = useToasts(1234)
    showToast('a', 'error')
    showToast('b')
    expect(toasts.value.map((t) => t.duration)).toEqual([1234, 1234])
  })

  it('a per-type map overrides only the types it names', () => {
    const { toasts, showToast } = useToasts({ error: 20000 })
    showToast('a', 'error')
    showToast('b')
    expect(toasts.value.map((t) => t.duration)).toEqual([20000, 8000])
  })

  it('dismiss drops the toast', () => {
    const { toasts, showToast, dismiss } = useToasts()
    showToast('a')
    dismiss(toasts.value[0].id)
    expect(toasts.value).toEqual([])
  })
})

describe('ToastStack', () => {
  it('shows a dismiss button on a persistent toast even when not dismissible', async () => {
    wrapper = mount(ToastStack, {
      props: {
        dismissible: false,
        toasts: [
          { id: 1, msg: 'Saved', type: 'success', duration: 8000 },
          { id: 2, msg: 'Save failed', type: 'error', duration: Number.POSITIVE_INFINITY },
        ],
      },
      attachTo: document.body,
    })
    await settle()
    const buttons = document.querySelectorAll('[aria-label="Dismiss notification"]')
    expect(buttons).toHaveLength(1)
  })
})

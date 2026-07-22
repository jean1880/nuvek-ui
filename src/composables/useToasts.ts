import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  msg: string
  type: ToastType
}

/**
 * Shared transient-notification state. Pair with the `ToastStack` component:
 * `const { toasts, showToast } = useToasts()` → `<ToastStack :toasts="toasts" />`.
 */
export function useToasts(timeoutMs = 4000) {
  const toasts = ref<Toast[]>([])
  let nextId = 0

  function showToast(msg: string, type: ToastType = 'success') {
    const id = nextId++
    toasts.value.push({ id, msg, type })
    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id)
    }, timeoutMs)
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return { toasts, showToast, dismiss }
}
